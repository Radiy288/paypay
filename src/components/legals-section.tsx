export function LegalsSection() {
  return (
    <footer className="border-t border-emerald-100 bg-[#f7fbf8] px-4 py-10 transition-colors duration-200 dark:border-zinc-800 dark:bg-[#080808] md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 text-xs leading-6 text-slate-600 md:grid-cols-[1.2fr_1fr_1fr] dark:text-zinc-500">
          <div>
            <p className="font-bold uppercase tracking-[0.12em] text-emerald-800 dark:text-zinc-300">
              Юридическая информация
            </p>
            <div className="mt-3 text-slate-700 dark:text-zinc-400">
              <p>Exec Servers LTD</p>
              <p>201140009875</p>
              <p>
                050059, г. Алматы, пр. Аль-Фараби, д. 17, БЦ «Нурлы Тау», офис 402
              </p>
              <p>050060, г. Алматы, а/я 157</p>
              <p>«Атқарушы серверлер» ЖШС</p>
            </div>
          </div>

          <div>
            <p className="font-bold text-slate-900 dark:text-zinc-300">
              Материалы сайта
            </p>
            <p className="mt-3">
              Если иное не указано отдельно, тексты и описательные материалы сайта
              предоставляются на условиях copyleft-лицензии CC BY-SA 4.0 с обязательным
              указанием источника и сохранением производных материалов на тех же условиях.
            </p>
          </div>

          <div>
            <p className="font-bold text-slate-900 dark:text-zinc-300">Дополнительно</p>
            <p className="mt-3">
              Сведения на сайте носят информационный и презентационный характер.
              Наименования продуктов, логотипы и товарные знаки принадлежат их
              правообладателям. Для официальных запросов рекомендуется использовать
              корпоративные каналы связи.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}