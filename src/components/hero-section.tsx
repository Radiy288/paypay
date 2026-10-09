const features = [
  {
    title: "Непрерывное сопровождение",
    description: "Контроль состояния сервисов, инфраструктуры и критичных точек отказа.",
  },
  {
    title: "Системная архитектура",
    description: "Решения, которые удобно поддерживать, развивать и масштабировать.",
  },
  {
    title: "Инженерная дисциплина",
    description: "Предсказуемые процессы, документация и аккуратные изменения в среде.",
  },
  {
    title: "Комплексная реализация",
    description: "Работы от проектирования и запуска до дальнейшей эксплуатации.",
  },
];

export function HeroSection() {
  return (
    <section className="border-b border-emerald-100 bg-[#f1faf5] px-4 py-20 text-slate-950 transition-colors duration-200 dark:border-zinc-800 dark:bg-black dark:text-white md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-zinc-400">
            Exec Servers LTD · инфраструктура и системная интеграция
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] md:text-6xl xl:text-7xl">
            Надёжная техническая инфраструктура для критичных цифровых сервисов
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-700 dark:text-zinc-300 md:text-xl">
            Научно-техническая организация, выполняющая обслуживание, модернизацию и системную
            интеграцию для специализированных служб и учреждений критической информационной
            инфраструктуры города Москвы.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#feedback"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              Обратная связь
            </a>
            <a
              href="#servers"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:border-emerald-400 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              Список серверов
            </a>
            <a
              href="#community"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:border-emerald-400 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-black dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:text-white dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
            >
              Сообщество
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 border-t border-emerald-200 md:grid-cols-2 lg:grid-cols-4 dark:border-zinc-800">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border-b border-emerald-200 py-6 md:px-5 md:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0 dark:border-zinc-800"
            >
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}