import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "kk", label: "KZ", name: "Қазақша" },
];

const dict = {
  en: {
    brand: "Atomforce",
    brandSub: "Workforce Command System",
    nav: {
      dashboard: "Dashboard",
      control: "Control Center",
    },
    common: {
      search: "Search",
      filter: "Filter",
      all: "All",
      assign: "Assign",
      simulate: "Simulate",
      reset: "Reset",
      live: "Live",
      day: "Day",
      night: "Night",
      off: "Off",
    },
    dash: {
      title: "Operations Overview",
      subtitle: "Real-time workforce intelligence across all NPP-2 zones",
      kpi: {
        total: "Total Workers",
        availableToday: "Available Today",
        fatigue: "Fatigue Alerts",
        shortages: "Shortage Alerts",
        expiring: "Expiring Certs",
      },
    },
    control: {
      title: "Workforce Control Center",
      subtitle: "Allocate · Rotate · Recover — one decision per click.",
      modes: {
        task: "Task Allocation",
        recovery: "Delay Recovery",
      },
      sections: {
        target: "Target",
        suggested: "Suggested Crew",
        actions: "Actions",
      },
      actions: {
        assign: "Assign Crew",
        rotate: "Auto-Rotate Fatigued",
        reallocate: "Reallocate Workers",
        optimize: "Optimize Workforce",
      },
    },
  },
  ru: {
    brand: "Atomforce",
    brandSub: "Командная система персонала",
    nav: {
      dashboard: "Панель",
      control: "Командный центр",
    },
    common: {
      search: "Поиск",
      filter: "Фильтр",
      all: "Все",
      assign: "Назначить",
      simulate: "Симуляция",
      reset: "Сброс",
      live: "Live",
      day: "День",
      night: "Ночь",
      off: "Выходной",
    },
    dash: {
      title: "Оперативный обзор",
      subtitle: "Аналитика персонала по всем зонам АЭС-2 в реальном времени",
      kpi: {
        total: "Всего рабочих",
        availableToday: "Доступны сегодня",
        fatigue: "Усталость",
        shortages: "Дефицит",
        expiring: "Истекают сертификаты",
      },
    },
    control: {
      title: "Командный центр персонала",
      subtitle: "Распределение · Ротация · Восстановление — одно решение за клик.",
      modes: {
        task: "Назначение задач",
        recovery: "Восстановление сроков",
      },
      sections: {
        target: "Цель",
        suggested: "Рекомендуемая бригада",
        actions: "Действия",
      },
      actions: {
        assign: "Назначить бригаду",
        rotate: "Авто-ротация усталых",
        reallocate: "Перераспределить",
        optimize: "Оптимизировать",
      },
    },
  },
  kk: {
    brand: "Atomforce",
    brandSub: "Қызметкерлерді басқару жүйесі",
    nav: {
      dashboard: "Бақылау тақтасы",
      control: "Басқару орталығы",
    },
    common: {
      search: "Іздеу",
      filter: "Сүзгі",
      all: "Барлығы",
      assign: "Тағайындау",
      simulate: "Симуляция",
      reset: "Қайта орнату",
      live: "Live",
      day: "Күндіз",
      night: "Түнде",
      off: "Демалыс",
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
    control: {
      title: "Қызметкерлерді басқару орталығы",
      subtitle: "Тағайындау · Ротация · Қалпына келтіру — бір шертумен.",
      modes: {
        task: "Тапсырма тағайындау",
        recovery: "Кешеуілді қалпына келтіру",
      },
      sections: {
        target: "Мақсат",
        suggested: "Ұсынылған бригада",
        actions: "Әрекеттер",
      },
      actions: {
        assign: "Бригаданы тағайындау",
        rotate: "Авто-ротация",
        reallocate: "Қайта бөлу",
        optimize: "Оңтайландыру",
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
