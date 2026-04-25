import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "kk", label: "KZ", name: "Қазақша" },
];

const dict = {
  en: {
    brand: "Atomforce",
    brandSub: "NPP Workforce Intelligence",
    nav: {
      dashboard: "Dashboard",
      workers: "Workers",
      assignments: "Smart Allocation",
      rotation: "Rotation Planner",
      certifications: "Certifications",
      gaps: "Gap Analysis",
      recovery: "Delay Recovery",
    },
    common: {
      search: "Search",
      filter: "Filter",
      all: "All",
      assign: "Assign",
      assigned: "Assigned",
      simulate: "Simulate",
      total: "Total",
      available: "Available",
      unavailable: "Unavailable",
      onShift: "On shift",
      offDuty: "Off duty",
      day: "Day",
      night: "Night",
      off: "Off",
      yes: "Yes",
      no: "No",
      reset: "Reset",
      apply: "Apply",
      export: "Export",
      live: "Live",
    },
    dash: {
      title: "Operations Overview",
      subtitle: "Real-time workforce intelligence across all NPP-2 zones",
      kpi: {
        total: "Total Workers",
        availableToday: "Available Today",
        fatigue: "Fatigue Alerts",
        shortages: "Skill Shortages",
        expiring: "Expiring Certs",
      },
    },
    workers: {
      title: "Workforce Roster",
      subtitle: "Searchable registry of all on-site personnel",
      cols: {
        name: "Name",
        skill: "Skill",
        zone: "Zone",
        availability: "Availability",
        days: "Days Worked",
        cert: "Certification",
        shift: "Shift",
        fatigue: "Fatigue",
      },
    },
  },
  ru: {
    brand: "Atomforce",
    brandSub: "Управление персоналом АЭС",
    nav: {
      dashboard: "Панель",
      workers: "Персонал",
      assignments: "Распределение",
      rotation: "Смены",
      certifications: "Сертификаты",
      gaps: "Дефицит",
      recovery: "Восстановление",
    },
    common: {
      search: "Поиск",
      filter: "Фильтр",
      all: "Все",
      assign: "Назначить",
      assigned: "Назначено",
      simulate: "Симуляция",
      total: "Всего",
      available: "Доступно",
      unavailable: "Недоступно",
      onShift: "На смене",
      offDuty: "Выходной",
      day: "День",
      night: "Ночь",
      off: "Выходной",
      yes: "Да",
      no: "Нет",
      reset: "Сброс",
      apply: "Применить",
      export: "Экспорт",
      live: "Live",
    },
    dash: {
      title: "Оперативный обзор",
      subtitle: "Аналитика персонала по всем зонам АЭС-2 в реальном времени",
      kpi: {
        total: "Всего рабочих",
        availableToday: "Доступны сегодня",
        fatigue: "Усталость",
        shortages: "Дефицит навыков",
        expiring: "Истекают сертификаты",
      },
    },
    workers: {
      title: "Реестр персонала",
      subtitle: "Поиск по всем работникам на объекте",
      cols: {
        name: "Имя",
        skill: "Специальность",
        zone: "Зона",
        availability: "Статус",
        days: "Дней подряд",
        cert: "Сертификат",
        shift: "Смена",
        fatigue: "Усталость",
      },
    },
  },
  kk: {
    brand: "Atomforce",
    brandSub: "АЭС қызметкерлерін басқару",
    nav: {
      dashboard: "Бақылау тақтасы",
      workers: "Қызметкерлер",
      assignments: "Тағайындау",
      rotation: "Ауысымдар",
      certifications: "Сертификаттар",
      gaps: "Тапшылық",
      recovery: "Қалпына келтіру",
    },
    common: {
      search: "Іздеу",
      filter: "Сүзгі",
      all: "Барлығы",
      assign: "Тағайындау",
      assigned: "Тағайындалды",
      simulate: "Симуляция",
      total: "Барлығы",
      available: "Қол жетімді",
      unavailable: "Қол жетімсіз",
      onShift: "Ауысымда",
      offDuty: "Демалыс",
      day: "Күндіз",
      night: "Түнде",
      off: "Демалыс",
      yes: "Иә",
      no: "Жоқ",
      reset: "Қайта орнату",
      apply: "Қолдану",
      export: "Экспорт",
      live: "Live",
    },
    dash: {
      title: "Операциялық шолу",
      subtitle: "АЭС-2 барлық аймақтары бойынша нақты уақыттағы талдау",
      kpi: {
        total: "Жалпы қызметкер",
        availableToday: "Бүгін қолжетімді",
        fatigue: "Шаршау",
        shortages: "Кадр тапшылығы",
        expiring: "Сертификат мерзімі",
      },
    },
    workers: {
      title: "Қызметкерлер тізімі",
      subtitle: "Объектідегі барлық қызметкерлер бойынша іздеу",
      cols: {
        name: "Аты-жөні",
        skill: "Мамандық",
        zone: "Аймақ",
        availability: "Күй",
        days: "Қатарынан күн",
        cert: "Сертификат",
        shift: "Ауысым",
        fatigue: "Шаршау",
      },
    },
  },
};

const LangCtx = createContext({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("atomforce.lang");
    if (saved && dict[saved]) setLang(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("atomforce.lang", lang);
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => {
        const v = get(dict[lang], key);
        if (v != null) return v;
        const en = get(dict.en, key);
        return en != null ? en : key;
      },
    }),
    [lang]
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
