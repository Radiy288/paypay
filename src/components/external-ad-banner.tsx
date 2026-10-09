import { ArrowUpRight } from "lucide-react";

const POLICE_URL = "https://www.mos.ru/city/projects/rabotamvd/";
const policeImage = new URL("/assets/-rHvTtLBF9cQ.webp", import.meta.url).href;

export function ExternalAdBanner() {
  return (
    <section
      aria-label="Спецпроект правительства Москвы"
      className="relative isolate mx-4 overflow-hidden rounded-2xl bg-emerald-700 text-white transition-colors duration-200 sm:mx-6 lg:mx-8 dark:bg-zinc-900"
    >
      <a
        href={POLICE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Служба в московской полиции"
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      />

      <div className="pointer-events-none relative z-10 mx-auto min-h-[300px] max-w-6xl px-4 py-10 md:px-6 lg:py-0">
        <div className="max-w-2xl py-2 lg:w-[55%] lg:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            Спецпроект правительства Москвы
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Служба в московской полиции
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
            Встаньте на защиту правопорядка в столице и безопасности своих близких. Поступайте на
            службу в московскую полицию и получите гарантии стабильности.
          </p>

          <a
            href={POLICE_URL}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:focus-visible:ring-offset-zinc-900"
          >
            Узнать
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[180px] items-end justify-end lg:absolute lg:inset-y-0 lg:right-0 lg:w-[45%]">
        <img
          src={policeImage}
          alt=""
          draggable={false}
          className="block max-h-[280px] w-auto max-w-full object-contain object-right-bottom lg:h-full lg:max-h-[320px]"
        />
      </div>
    </section>
  );
}