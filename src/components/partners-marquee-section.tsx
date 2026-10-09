import type { Theme } from "../types";
import { SectionHeading } from "./section-heading";

type Partner = {
  name: string;
  website: string;
  logoName: string;
  logoExtension: "png" | "svg";
};

const partners: Partner[] = [
  {
    name: 'ГКУ "Инфогород"',
    website: "https://ig.mos.ru",
    logoName: "infogorod",
    logoExtension: "png",
  },
  {
    name: "Департамент информационных технологий города Москвы",
    website: "https://www.mos.ru/dit/",
    logoName: "mos-dit",
    logoExtension: "png",
  },
  {
    name: "ГКУ Московский авиационный центр",
    website: "https://mosavia.mos.ru",
    logoName: "mosavia",
    logoExtension: "png",
  },
  {
    name: "Департамент здравоохранения города Москвы",
    website: "https://mosgorzdrav.ru",
    logoName: "mosgorzdrav",
    logoExtension: "png",
  },
  {
    name: "Главное управление МЧС России по г. Москве",
    website: "https://moscow.mchs.gov.ru",
    logoName: "mchs-moscow",
    logoExtension: "svg",
  },
  {
    name: 'ГБУЗ "ГКБ им. А.К. Ерамишанцева ДЗМ"',
    website: "https://gkbe.ru",
    logoName: "gkbe",
    logoExtension: "png",
  },
  {
    name: "Станция скорой и неотложной медицинской помощи им. А.С. Пучкова",
    website: "https://mosgorzdrav.ru/ssnmp",
    logoName: "mos03",
    logoExtension: "svg",
  },
  {
    name: "Московская Областная Станция Скорой Медицинской Помощи",
    website: "https://mo03.ru",
    logoName: "mo03",
    logoExtension: "png",
  },
  {
    name: 'ПАО "Распадская"',
    website: "https://raspadskaya.com/ru/",
    logoName: "raspadskaya",
    logoExtension: "svg",
  },
  {
    name: 'Муниципальные услуги "Междуреченск"',
    website: "https://mrech.ru",
    logoName: "mrech-services",
    logoExtension: "png",
  },
  {
    name: "Администрация Междуреченского муниципального округа",
    website: "https://mrech.ru",
    logoName: "mrech-admin",
    logoExtension: "png",
  },
  {
    name: 'Группа компаний "ЕвроХим"',
    website: "https://eurochem.ru",
    logoName: "eurochem",
    logoExtension: "svg",
  },
  {
    name: "Государственное бюджетное учреждение здравоохранения города Москвы особого типа «Московский территориальный научно-практический центр медицины катастроф (ЦЭМП) Департамента здравоохранения города Москвы»",
    website: "https://cemp.msk.ru",
    logoName: "cemp",
    logoExtension: "png",
  },
  {
    name: "Государственное бюджетное учреждение города Москвы «Ритуал»",
    website: "https://ritual.mos.ru",
    logoName: "ritual",
    logoExtension: "png",
  },
  {
    name: "ООО «МАКТОР»",
    website: "https://www.maktor.ru",
    logoName: "maktor",
    logoExtension: "png",
  },
  {
    name: "Муниципальное Образовательное Бюджетное Учреждение «Национальная гимназия «Айыы Кыhата»»",
    website: "https://ykt-ak.obr.sakha.gov.ru",
    logoName: "aiyy-kyhata",
    logoExtension: "png",
  },
  {
    name: 'АО "АКАДО Телеком"',
    website: "https://www.akado-telecom.ru",
    logoName: "akado",
    logoExtension: "png",
  },
  {
    name: 'ГБУ РБ "Служба обеспечения мероприятий гражданской защиты"',
    website: "http://somgzrb.ru/oksion/",
    logoName: "bashkortostan-gerb",
    logoExtension: "png",
  },
  {
    name: 'АО "УРАЛХИММАШ"',
    website: "https://uralhimmash.ru",
    logoName: "uralhimmash",
    logoExtension: "png",
  },
  {
    name: "ГБУЗ «НИИ СП им.Н.В.Склифосовского ДЗМ»",
    website: "https://sklif.mos.ru",
    logoName: "sklif",
    logoExtension: "png",
  },
];

function getPartnerLogo(theme: Theme, partner: Partner) {
  const mode = theme === "dark" ? "dark" : "light";
  return new URL(
    `../partners/${mode}/${partner.logoName}.${partner.logoExtension}`,
    import.meta.url,
  ).href;
}

type PartnersMarqueeSectionProps = {
  theme: Theme;
};

export function PartnersMarqueeSection({ theme }: PartnersMarqueeSectionProps) {
  return (
    <section
      id="partners"
      className="bg-white px-4 py-16 transition-colors duration-200 dark:bg-[#080808] md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Партнёры"
          title="Организации, с которыми мы работаем"
          description="Государственные учреждения, профильные департаменты и специализированные организации."
        />

        <div className="mt-10 grid grid-cols-2 border-l border-t border-slate-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 dark:border-zinc-800">
          {partners.map((partner) => (
            <a
              key={partner.name}
              href={partner.website}
              target="_blank"
              rel="noreferrer"
              aria-label={partner.name}
              title={partner.name}
              className="flex min-h-28 items-center justify-center border-b border-r border-slate-200 bg-white p-5 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700 dark:border-zinc-800 dark:bg-[#0d0d0d] dark:hover:bg-[#151515] dark:focus-visible:ring-white"
            >
              <img
                src={getPartnerLogo(theme, partner)}
                alt=""
                className="max-h-14 w-auto max-w-full object-contain md:max-h-16"
                loading="lazy"
                draggable={false}
              />
              <span className="sr-only">{partner.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}