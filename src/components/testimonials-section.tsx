import { SectionHeading } from "./section-heading";

const testimonials = [
  {
    name: "Алексей Воронов",
    role: "Руководитель IT-отдела",
    content:
      "Стабильность системы — это не её свойство, а результат моих решений, принятых заранее.",
    avatar: "/assets/Bq-OI_-6Rxva.jpg",
  },
  {
    name: "Рувим Шейхов",
    role: "Инвестор",
    content:
      "Я довожу формулировку до состояния, при котором интерпретации перестают существовать.",
    avatar: "/assets/DS8mlu1b1ZdQ.jpg",
  },
  {
    name: "Камиль Сафиуллин",
    role: "Руководитель проектов",
    content:
      "Процессы под моим управлением не ускоряются — они перестают отклоняться.",
    avatar: "/assets/BmJ6fWWjr75R.jpg",
  },
  {
    name: "Тимур Нуриев",
    role: "Многоцелевой дизайнер (Level, UI, UX, графика)",
    content:
      "То, что сначала кажется странным, в моей системе со временем становится единственно допустимым.",
    avatar: "/assets/VTL_EFK-WyFx.jpg",
  },
  {
    name: "Михаил Розенберг",
    role: "Разработчик",
    content:
      "В моём коде нет неожиданностей — только последствия решений, принятых ранее.",
    avatar: "/assets/B9-lZWwblQOs.jpg",
  },
  {
    name: "Радий Егоров",
    role: "Руководитель отдела информационной безопасности",
    content: "Если вы не видите угроз, значит я уже разобрался с ними.",
    avatar: "/assets/CMbsO-2PG4IH.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-white px-4 py-16 transition-colors duration-200 dark:bg-black md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Команда"
          title="Люди, отвечающие за результат"
          description="Ключевые участники команды и их профессиональные принципы."
        />

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          {testimonials.map((person) => (
            <article
              key={person.name}
              className="flex min-h-[286px] flex-col items-center bg-white px-6 py-7 text-center dark:bg-[#0a0a0a]"
            >
              <img
                src={person.avatar}
                alt={person.name}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                loading="lazy"
              />
              <h3 className="mt-4 text-sm font-bold text-slate-950 dark:text-white">
                {person.name}
              </h3>
              <p className="mt-1 flex min-h-10 max-w-[17rem] items-start justify-center text-xs leading-5 text-slate-500 dark:text-zinc-500">
                {person.role}
              </p>
              <blockquote className="mt-5 w-full border-t border-slate-100 pt-5 text-sm leading-6 text-slate-700 dark:border-zinc-900 dark:text-zinc-300">
                {person.content}
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}