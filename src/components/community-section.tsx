import { SectionHeading } from "./section-heading";

export function CommunitySection() {
  return (
    <section
      id="community"
      className="border-y border-emerald-100 bg-[#f1faf5] px-4 py-16 transition-colors duration-200 dark:border-zinc-800 dark:bg-[#0a0a0a] md:px-6 md:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <SectionHeading
          eyebrow="Сообщество"
          title="Рабочая точка связи Exec Servers"
          description="Discord используется для связи, координации, обсуждения игровых площадок и связанных сервисов."
        />

        <a
          href="https://discord.execservers.online"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#0a0a0a]"
        >
          Открыть Discord
        </a>
      </div>
    </section>
  );
}