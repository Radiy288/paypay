import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, RotateCcw, Send, X } from "lucide-react";
import { SectionHeading } from "./section-heading";

const MAX_FILE_SIZE = 50_000_000;
const MAX_MESSAGE_LENGTH = 3500;
const MAX_ALIAS_LENGTH = 80;
const MAX_CONTACT_LENGTH = 254;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/ogg",
  "application/ogg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
]);

const ALLOWED_ARCHIVE_TYPES: Record<string, Set<string>> = {
  ".zip": new Set(["application/zip", "application/x-zip-compressed", "application/octet-stream", ""]),
  ".7z": new Set(["application/x-7z-compressed", "application/octet-stream", ""]),
  ".rar": new Set(["application/vnd.rar", "application/x-rar-compressed", "application/octet-stream", ""]),
};

function formatFileSize(bytes: number) {
  if (bytes < 1048576) {
    return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  }
  return `${(bytes / 1048576).toFixed(1)} МБ`;
}

function getFileExtension(name: string) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return name.slice(dotIndex).toLowerCase();
}

function isAllowedFile(file: File) {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;

  const allowedTypes = ALLOWED_ARCHIVE_TYPES[getFileExtension(file.name)];
  return allowedTypes != null && allowedTypes.has(file.type);
}

async function readError(response: Response) {
  try {
    const data = await response.json();
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  return `Ошибка запроса (${response.status})`;
}

function isTelegramUsername(value: string) {
  return /^@?[A-Za-z0-9_]{5,32}$/.test(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type Challenge = {
  token: string;
  image: string;
  tile: string;
  width: number;
  height: number;
  tile_x: number;
  tile_y: number;
  tile_width: number;
  tile_height: number;
  expires_at: string;
};

function isChallenge(data: unknown): data is Challenge {
  if (!data || typeof data !== "object") return false;
  const value = data as Partial<Challenge>;

  return (
    typeof value.token === "string" &&
    typeof value.image === "string" &&
    typeof value.tile === "string" &&
    value.image.startsWith("data:image/") &&
    value.tile.startsWith("data:image/") &&
    typeof value.width === "number" &&
    Number.isFinite(value.width) &&
    typeof value.height === "number" &&
    Number.isFinite(value.height) &&
    typeof value.tile_x === "number" &&
    Number.isFinite(value.tile_x) &&
    typeof value.tile_y === "number" &&
    Number.isFinite(value.tile_y) &&
    typeof value.tile_width === "number" &&
    Number.isFinite(value.tile_width) &&
    typeof value.tile_height === "number" &&
    Number.isFinite(value.tile_height) &&
    (value.width ?? 0) > 0 &&
    (value.height ?? 0) > 0 &&
    (value.tile_width ?? 0) > 0 &&
    (value.tile_height ?? 0) > 0 &&
    typeof value.expires_at === "string"
  );
}

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-black dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-white dark:focus:ring-white/15";

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  renderedWidth: number;
  renderedHeight: number;
};

export function FeedbackSection() {
  const [alias, setAlias] = useState("");
  const [contactType, setContactType] = useState<"email" | "telegram">("email");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVersion, setStatusVersion] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captchaSectionRef = useRef<HTMLElement>(null);
  const captchaBoxRef = useRef<HTMLDivElement>(null);
  const challengeAbortRef = useRef<AbortController | null>(null);
  const challengeRequestIdRef = useRef(0);
  const dragStateRef = useRef<DragState | null>(null);

  const sending = status === "sending";

  const statusColor = useMemo(() => {
    if (status === "error") return "text-red-700 dark:text-red-400";
    if (status === "success") return "text-emerald-700 dark:text-emerald-400";
    return "text-slate-600 dark:text-zinc-400";
  }, [status]);

  const setStatusWithMessage = useCallback(
    (nextStatus: "idle" | "sending" | "error" | "success", nextMessage: string | null) => {
      setStatus(nextStatus);
      setStatusMessage(nextMessage);
      setStatusVersion((value) => value + 1);
    },
    [],
  );

  useEffect(() => {
    if (!statusMessage || status === "sending") return;

    const current = statusMessage;
    const timeout = window.setTimeout(() => {
      setStatusMessage((value) => (value === current ? null : value));
    }, 10000);

    return () => window.clearTimeout(timeout);
  }, [statusMessage, statusVersion, status]);

  const loadChallenge = useCallback(async () => {
    challengeAbortRef.current?.abort();

    const controller = new AbortController();
    challengeAbortRef.current = controller;
    const requestId = ++challengeRequestIdRef.current;

    setChallengeStatus("loading");
    setChallengeError(null);
    setHasMoved(false);
    dragStateRef.current = null;

    try {
      const response = await fetch("/api/feedback/challenge", {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readError(response));
      }

      const data = await response.json();

      if (!isChallenge(data)) {
        throw new Error("Сервер вернул некорректную проверку.");
      }

      if (requestId !== challengeRequestIdRef.current) return;

      setChallenge(data);
      setOffset({ x: data.tile_x, y: data.tile_y });
      setHasMoved(false);
      setChallengeStatus("ready");
    } catch (error) {
      if (
        (error instanceof Error && error.name === "AbortError") ||
        requestId !== challengeRequestIdRef.current
      ) {
        return;
      }

      setChallenge(null);
      setChallengeStatus("error");
      setChallengeError(
        error instanceof Error ? error.message : "Не удалось загрузить проверку.",
      );
    }
  }, []);

  useEffect(() => {
    const element = captchaSectionRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      loadChallenge();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadChallenge();
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loadChallenge]);

  useEffect(() => {
    return () => {
      challengeAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!challenge) return;

    const expiresAt = Date.parse(challenge.expires_at);
    if (!Number.isFinite(expiresAt)) return;

    const delay = Math.max(0, expiresAt - Date.now());
    const timeout = window.setTimeout(() => void loadChallenge(), delay);

    return () => window.clearTimeout(timeout);
  }, [challenge, loadChallenge]);

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (file: File | null) => {
    setStatusMessage(null);
    setStatus("idle");

    if (!file) {
      clearAttachment();
      return;
    }

    if (file.size <= 0) {
      clearAttachment();
      setStatusWithMessage("error", "Файл пустой.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      clearAttachment();
      setStatusWithMessage("error", "Файл больше 50 МБ.");
      return;
    }

    if (!isAllowedFile(file)) {
      clearAttachment();
      setStatusWithMessage("error", "Этот формат файла не поддерживается.");
      return;
    }

    setAttachment(file);
  };

  const updateOffset = useCallback(
    (x: number, y: number) => {
      if (!challenge) return;

      setOffset({
        x: Math.round(clamp(x, 0, Math.max(0, challenge.width - challenge.tile_width))),
        y: Math.round(clamp(y, 0, Math.max(0, challenge.height - challenge.tile_height))),
      });
    },
    [challenge],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!challenge || challengeStatus !== "ready" || sending) return;

    const rect = captchaBoxRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: offset.x,
      startY: offset.y,
      renderedWidth: rect.width,
      renderedHeight: rect.height,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (!challenge || !drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();

    const nextX =
      drag.startX + ((event.clientX - drag.startClientX) / drag.renderedWidth) * challenge.width;
    const nextY =
      drag.startY + ((event.clientY - drag.startClientY) / drag.renderedHeight) * challenge.height;

    updateOffset(nextX, nextY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragStateRef.current;
    if (drag && drag.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragStateRef.current = null;
      setHasMoved(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!challenge || challengeStatus !== "ready" || sending) return;

    const step = event.shiftKey ? 12 : 4;
    let nextX = offset.x;
    let nextY = offset.y;

    switch (event.key) {
      case "ArrowLeft":
        nextX -= step;
        break;
      case "ArrowRight":
        nextX += step;
        break;
      case "ArrowUp":
        nextY -= step;
        break;
      case "ArrowDown":
        nextY += step;
        break;
      default:
        return;
    }

    event.preventDefault();
    updateOffset(nextX, nextY);
    setHasMoved(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const trimmedAlias = alias.trim();
    const trimmedContact = contact.trim();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setStatusWithMessage("error", "Напишите сообщение.");
      return;
    }

    if (trimmedContact) {
      if (contactType === "telegram" && !isTelegramUsername(trimmedContact)) {
        setStatusWithMessage("error", "Укажите Telegram как @username.");
        return;
      }

      if (contactType === "email") {
        const input = document.createElement("input");
        input.type = "email";
        input.value = trimmedContact;
        if (!input.checkValidity()) {
          setStatusWithMessage("error", "Проверьте адрес email.");
          return;
        }
      }
    }

    if (attachment && (attachment.size > MAX_FILE_SIZE || !isAllowedFile(attachment))) {
      setStatusWithMessage("error", "Проверьте вложение.");
      return;
    }

    if (!challenge || challengeStatus !== "ready" || !hasMoved) {
      setStatusWithMessage("error", "Сначала переместите фрагмент.");
      return;
    }

    try {
      setStatusWithMessage("sending", "Отправляем…");

      const formData = new FormData();

      if (trimmedAlias) {
        formData.set("alias", trimmedAlias);
      }

      if (trimmedContact) {
        formData.set("contact_type", contactType);
        formData.set("contact", trimmedContact);
      }

      formData.set("message", trimmedMessage);
      formData.set("captcha_token", challenge.token);
      formData.set("captcha_x", String(offset.x));
      formData.set("captcha_y", String(offset.y));

      if (attachment) {
        formData.set("attachment", attachment, attachment.name);
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorMessage = await readError(response);

        if (response.status !== 429) {
          loadChallenge();
        }

        throw new Error(errorMessage);
      }

      setAlias("");
      setContact("");
      setMessage("");
      clearAttachment();
      setStatusWithMessage("success", "Спасибо. Сообщение отправлено.");
      loadChallenge();
    } catch (error) {
      setStatusWithMessage(
        "error",
        error instanceof Error
          ? error.message
          : "Не удалось отправить. Попробуйте ещё раз.",
      );
    }
  };

  return (
    <section
      id="feedback"
      className="bg-white px-4 py-16 transition-colors duration-200 dark:bg-black md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Обратная связь"
          title="Напишите нам"
          description="Имя и контакт — по желанию."
        />

        <form
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:gap-12"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="min-w-0">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <label className="grid min-w-0 gap-2 text-sm font-bold text-slate-900 dark:text-zinc-200">
                Имя или псевдоним
                <input
                  type="text"
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                  maxLength={MAX_ALIAS_LENGTH}
                  autoComplete="nickname"
                  disabled={sending}
                  className={inputClass}
                  placeholder="Как к вам обращаться"
                />
              </label>

              <div className="grid min-w-0 gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-200">
                  Контакт
                </span>

                <div className="grid min-w-0 gap-2 sm:grid-cols-1 xl:grid-cols-[auto_minmax(0,1fr)]">
                  <div
                    className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-zinc-700 dark:bg-black"
                    aria-label="Способ связи"
                  >
                    {(["email", "telegram"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContactType(type)}
                        disabled={sending}
                        aria-pressed={contactType === type}
                        className={`min-h-11 px-3 text-xs font-bold transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 disabled:opacity-60 dark:focus-visible:ring-white ${
                          contactType === type
                            ? "bg-emerald-50 text-emerald-800 dark:bg-zinc-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-200"
                        } ${
                          type === "telegram"
                            ? "border-l border-slate-300 dark:border-zinc-700"
                            : ""
                        }`}
                      >
                        {type === "email" ? "Email" : "Telegram"}
                      </button>
                    ))}
                  </div>

                  <input
                    type={contactType === "email" ? "email" : "text"}
                    value={contact}
                    onChange={(event) => setContact(event.target.value)}
                    maxLength={MAX_CONTACT_LENGTH}
                    autoComplete={contactType === "email" ? "email" : "off"}
                    disabled={sending}
                    className={inputClass}
                    placeholder={contactType === "email" ? "name@example.org" : "@username"}
                    aria-label="Контакт"
                  />
                </div>
              </div>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-bold text-slate-900 sm:mt-6 dark:text-zinc-200">
              Сообщение*
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                required
                rows={6}
                disabled={sending}
                className={`${inputClass} min-h-36 resize-y py-3 leading-6`}
                placeholder="Что вы хотите сообщить?"
              />
              {message.length > 0 && (
                <span className="text-right text-xs font-normal tabular-nums text-slate-400 dark:text-zinc-600">
                  {message.length} / {MAX_MESSAGE_LENGTH}
                </span>
              )}
            </label>

            <div className="mt-5 sm:mt-6">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                <label className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-800 focus-within:ring-2 focus-within:ring-emerald-700/15 dark:border-zinc-700 dark:bg-black dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white">
                  <Paperclip size={16} />
                  Прикрепить файл
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,audio/mpeg,audio/ogg,application/ogg,audio/wav,audio/wave,audio/x-wav,.zip,.7z,.rar,application/zip,application/x-7z-compressed,application/vnd.rar"
                    disabled={sending}
                    className="sr-only"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0] ?? null)
                    }
                  />
                </label>

                {attachment && (
                  <div className="flex min-w-0 flex-1 items-center gap-1 text-sm text-slate-600 dark:text-zinc-400">
                    <span className="min-w-0 flex-1 truncate" title={attachment.name}>
                      {attachment.name} · {formatFileSize(attachment.size)}
                    </span>
                    <button
                      type="button"
                      onClick={clearAttachment}
                      disabled={sending}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-50 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
                      aria-label="Удалить вложение"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                Медиа или архив до 50 МБ.
              </p>
            </div>
          </div>

          <aside
            ref={captchaSectionRef}
            className="min-w-0 border-t border-slate-200 pt-6 dark:border-zinc-800 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            aria-label="Проверка перед отправкой"
          >
            <div className="mx-auto w-full max-w-[320px] lg:mx-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-200">
                    Проверка
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-500">
                    Перетащите фрагмент в вырез.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void loadChallenge()}
                  disabled={challengeStatus === "loading" || sending}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-300 dark:focus-visible:ring-white"
                  aria-label="Обновить проверку"
                  title="Обновить проверку"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              {challengeStatus === "loading" && (
                <div className="flex aspect-[16/11] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#0a0a0a] dark:text-zinc-500">
                  Загружаем проверку…
                </div>
              )}

              {challengeStatus === "idle" && (
                <div className="flex aspect-[16/11] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#0a0a0a] dark:text-zinc-500">
                  Проверка появится здесь.
                </div>
              )}

              {challengeStatus === "error" && (
                <div className="flex aspect-[16/11] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 text-center dark:border-zinc-800 dark:bg-[#0a0a0a]">
                  <p className="text-sm leading-5 text-red-700 dark:text-red-400">
                    {challengeError ?? "Не удалось загрузить проверку."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadChallenge()}
                    className="text-sm font-bold text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 dark:text-white dark:hover:text-zinc-300 dark:focus-visible:ring-white"
                  >
                    Повторить
                  </button>
                </div>
              )}

              {challengeStatus === "ready" && challenge && (
                <>
                  <div
                    ref={captchaBoxRef}
                    className="relative aspect-[16/11] w-full select-none overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <img
                      src={challenge.image}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute inset-0 h-full w-full object-fill"
                    />

                    <button
                      type="button"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onKeyDown={handleKeyDown}
                      disabled={sending}
                      className="absolute cursor-grab touch-none border-0 bg-transparent p-0 outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{
                        left: `${(offset.x / challenge.width) * 100}%`,
                        top: `${(offset.y / challenge.height) * 100}%`,
                        width: `${(challenge.tile_width / challenge.width) * 100}%`,
                        height: `${(challenge.tile_height / challenge.height) * 100}%`,
                      }}
                      aria-label="Перемещаемый фрагмент. Перетащите мышью или используйте стрелки клавиатуры."
                    >
                      <img
                        src={challenge.tile}
                        alt=""
                        draggable={false}
                        className="pointer-events-none h-full w-full object-fill drop-shadow-md"
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center lg:col-span-2">
            <button
              type="submit"
              disabled={
                sending ||
                !message.trim() ||
                challengeStatus !== "ready" ||
                !challenge ||
                !hasMoved
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              <Send size={16} />
              {sending ? "Отправляем…" : "Отправить"}
            </button>

            {statusMessage && (
              <p
                className={`min-w-0 text-sm leading-5 ${statusColor}`}
                role={status === "error" ? "alert" : "status"}
              >
                {statusMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}