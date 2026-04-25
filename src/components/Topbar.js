import { Search, Bell } from "lucide-react";
import { LANGS, useLang } from "@/utils/i18n";
import clsx from "clsx";

export default function Topbar() {
  const { lang, setLang, t } = useLang();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-ink-950/80 px-4 md:px-6 py-3 backdrop-blur">
      <div className="md:hidden flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-atom-500/20 ring-1 ring-atom-400/40 text-atom-300 text-sm font-bold">
          A
        </div>
        <div className="text-sm font-semibold text-white">{t("brand")}</div>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{t("common.live")}</span>
        <span className="text-slate-600">·</span>
        <span className="font-mono text-xs">NPP-2 / Site Operations</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            placeholder={t("common.search") + "…"}
            className="input !py-1.5 pl-8 w-64"
          />
        </div>

        <div className="flex items-center rounded-md border border-white/10 bg-white/[0.04] p-0.5">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              title={l.name}
              className={clsx(
                "px-2 py-1 text-xs font-semibold rounded transition-colors",
                lang === l.code
                  ? "bg-atom-500/20 text-atom-200"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button className="btn-ghost !px-2.5 !py-1.5 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-ink-950" />
        </button>

        <div className="hidden md:flex items-center gap-2 pl-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-atom-400 to-atom-700 text-ink-950 text-xs font-bold">
            DK
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-white">D. Kassymov</div>
            <div className="text-[10px] text-slate-400">Site Director</div>
          </div>
        </div>
      </div>
    </header>
  );
}
