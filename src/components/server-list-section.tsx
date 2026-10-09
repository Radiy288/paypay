import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { SectionHeading } from "./section-heading";

type ServerInfo = {
  id: string;
  name: string;
  players: number;
  maxplayers: number;
  online: boolean;
  href?: string;
  description?: string;
  map?: string;
};

function normalizeServers(data: unknown): ServerInfo[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as any).servers)
      ? (data as any).servers
      : [];

  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => ({
      id: String(item.id ?? index),
      name: typeof item.name === "string" ? item.name : `Сервер ${index + 1}`,
      players: Number(item.players ?? 0),
      maxplayers: Number(item.maxplayers ?? 0),
      online: !!item.online,
      href: typeof item.href === "string" ? item.href : undefined,
      description: typeof item.description === "string" ? item.description : undefined,
      map: typeof item.map === "string" ? item.map : undefined,
    }));
}

function getConnectAddress(server: ServerInfo) {
  return (
    server.description?.replace(/^connect\s+/i, "") ??
    server.href?.replace("steam://connect/", "") ??
    ""
  );
}

export function ServerListSection() {
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/server-status", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        setServers(normalizeServers(data));
        setError(null);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setError(error.message || "Не удалось загрузить данные");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async (server: ServerInfo) => {
    const address = getConnectAddress(server);
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      const id = server.id ?? server.name;
      setCopiedId(id);

      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedId(null);
        copyTimeoutRef.current = null;
      }, 1600);
    } catch (error) {
      console.error("Не удалось скопировать адрес сервера", error);
    }
  };

  return (
    <section
      id="servers"
      className="bg-white px-4 py-16 transition-colors duration-200 dark:bg-black md:px-6 md:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Игровая инфраструктура"
          title="Список серверов"
          description="Текущий онлайн и данные для подключения."
        />

        <div className="mx-auto mt-10 w-full overflow-hidden border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0a0a0a]">
          <div className="hidden border-b border-slate-200 bg-[#f7fbf8] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 xl:grid xl:grid-cols-[minmax(0,2fr)_minmax(7rem,0.7fr)_minmax(0,1.45fr)_minmax(8.5rem,0.9fr)] xl:items-center xl:gap-5 dark:border-zinc-800 dark:bg-[#0d0d0d] dark:text-zinc-600">
            <span>Сервер</span>
            <span className="text-center">Игроки</span>
            <span>Адрес</span>
            <span className="text-center">Действие</span>
          </div>

          {loading ? (
            <div className="flex min-h-36 items-center justify-center px-5 py-10 text-center text-sm text-slate-500 dark:text-zinc-500">
              Загрузка данных о серверах…
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex min-h-36 items-center justify-center px-5 py-10 text-center text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </div>
          ) : servers.length === 0 ? (
            <div className="flex min-h-36 items-center justify-center px-5 py-10 text-center text-sm text-slate-500 dark:text-zinc-500">
              Серверы не найдены.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800">
              {servers.map((server) => {
                const address = getConnectAddress(server);
                const id = server.id ?? server.name;
                const copied = copiedId === id;

                return (
                  <article
                    key={id}
                    className={`grid gap-5 px-5 py-5 transition-colors sm:px-6 md:grid-cols-2 md:gap-x-8 xl:grid-cols-[minmax(0,2fr)_minmax(7rem,0.7fr)_minmax(0,1.45fr)_minmax(8.5rem,0.9fr)] xl:items-center xl:gap-5 ${
                      server.online
                        ? "hover:bg-emerald-50/50 dark:hover:bg-[#101312]"
                        : "bg-slate-50/70 dark:bg-[#0d0d0d]"
                    }`}
                  >
                    <div className="min-w-0 md:col-span-2 xl:col-span-1">
                      <h3
                        className={`truncate text-sm font-bold ${
                          server.online
                            ? "text-slate-950 dark:text-white"
                            : "text-slate-400 dark:text-zinc-600"
                        }`}
                        title={server.name}
                      >
                        {server.name}
                      </h3>
                      {server.map && (
                        <p
                          className={`mt-1.5 truncate text-xs leading-5 ${
                            server.online
                              ? "text-slate-500 dark:text-zinc-500"
                              : "text-slate-400 dark:text-zinc-700"
                          }`}
                          title={server.map}
                        >
                          {server.map}
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 xl:hidden dark:text-zinc-600">
                        Игроки
                      </span>
                      <div className="xl:text-center">
                        <span
                          className={`inline-flex min-h-7 items-center px-2.5 text-sm font-medium tabular-nums ${
                            server.online && server.players > 0
                              ? "text-emerald-700 dark:text-emerald-400"
                              : server.online
                                ? "text-slate-700 dark:text-zinc-300"
                                : "text-slate-400 dark:text-zinc-600"
                          }`}
                        >
                          {server.players} / {server.maxplayers}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 xl:hidden dark:text-zinc-600">
                        Адрес
                      </span>
                      {address ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(server)}
                          title={address}
                          aria-label={`Скопировать адрес сервера ${server.name}: ${address}`}
                          className={`group flex max-w-full items-center gap-2 rounded-md text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0a0a0a] ${
                            server.online
                              ? "text-slate-600 hover:text-emerald-800 dark:text-zinc-400 dark:hover:text-white"
                              : "text-slate-400 hover:text-slate-500 dark:text-zinc-600 dark:hover:text-zinc-500"
                          }`}
                        >
                          <span className="min-w-0 truncate font-mono text-xs">
                            {copied ? "Скопировано" : address}
                          </span>
                          {copied ? (
                            <Check
                              size={14}
                              className={
                                server.online
                                  ? "shrink-0 text-emerald-700 dark:text-white"
                                  : "shrink-0 text-slate-400 dark:text-zinc-600"
                              }
                            />
                          ) : (
                            <Copy
                              size={14}
                              className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                            />
                          )}
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-zinc-600">—</span>
                      )}
                    </div>

                    <div className="min-w-0 md:flex md:items-end md:justify-end xl:block">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 md:hidden xl:hidden dark:text-zinc-600">
                        Действие
                      </span>
                      <div className="xl:text-center">
                        {server.online && server.href ? (
                          <a
                            href={server.href}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0a0a0a]"
                          >
                            Подключиться
                            <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <span className="inline-flex min-h-9 items-center text-sm text-slate-400 dark:text-zinc-600">
                            Не в сети
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}