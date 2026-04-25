import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  Wrench,
  CalendarRange,
  ShieldCheck,
  BarChart3,
  Activity,
  Atom,
} from "lucide-react";
import { useLang } from "@/utils/i18n";
import clsx from "clsx";

export default function Sidebar() {
  const { t } = useLang();
  const router = useRouter();

  const items = [
    { href: "/",               label: t("nav.dashboard"),      icon: LayoutDashboard },
    { href: "/workers",        label: t("nav.workers"),        icon: Users },
    { href: "/assignments",    label: t("nav.assignments"),    icon: Wrench },
    { href: "/rotation",       label: t("nav.rotation"),       icon: CalendarRange },
    { href: "/certifications", label: t("nav.certifications"), icon: ShieldCheck },
    { href: "/gaps",           label: t("nav.gaps"),           icon: BarChart3 },
    { href: "/recovery",       label: t("nav.recovery"),       icon: Activity },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-white/10 bg-ink-950/70 backdrop-blur">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="relative grid place-items-center h-10 w-10 rounded-lg bg-gradient-to-br from-atom-500/30 to-atom-700/40 ring-1 ring-atom-400/40">
          <Atom className="h-5 w-5 text-atom-300" />
          <span className="absolute -inset-0.5 rounded-lg ring-1 ring-atom-400/20 animate-pulse" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold text-white tracking-tight">
            {t("brand")}
          </div>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider">
            {t("brandSub")}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Operations
        </div>
        <ul className="space-y-1">
          {items.map((it) => {
            const active =
              it.href === "/" ? router.pathname === "/" : router.pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={clsx(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-atom-500/10 text-atom-200 ring-1 ring-inset ring-atom-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={clsx("h-4 w-4", active ? "text-atom-300" : "text-slate-400 group-hover:text-slate-200")} />
                  <span className="truncate">{it.label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-atom-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="rounded-lg border border-atom-500/30 bg-atom-500/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-atom-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Site Online · NPP-2
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Last sync just now
          </div>
        </div>
      </div>
    </aside>
  );
}
