import clsx from "clsx";

const TONE = {
  default: "from-white/[0.06] to-white/[0.02] ring-white/10 text-slate-300",
  ok:      "from-emerald-500/15 to-transparent ring-emerald-500/30 text-emerald-300",
  warn:    "from-amber-500/15 to-transparent ring-amber-500/30 text-amber-300",
  danger:  "from-rose-500/15 to-transparent ring-rose-500/30 text-rose-300",
  info:    "from-atom-500/15 to-transparent ring-atom-500/30 text-atom-300",
};

export default function StatCard({ label, value, sub, icon: Icon, tone = "default", trend }) {
  return (
    <div className={clsx("card card-hover p-4", "overflow-hidden")}>
      <div className={clsx("absolute inset-x-0 top-0 h-px bg-gradient-to-r", {
        "from-transparent via-white/10 to-transparent": tone === "default",
        "from-transparent via-emerald-400/40 to-transparent": tone === "ok",
        "from-transparent via-amber-400/40 to-transparent": tone === "warn",
        "from-transparent via-rose-400/40 to-transparent": tone === "danger",
        "from-transparent via-atom-400/40 to-transparent": tone === "info",
      })} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-semibold text-white tabular-nums">{value}</div>
            {trend && (
              <span className={clsx(
                "text-xs font-medium",
                trend.startsWith("+") ? "text-emerald-400" : trend.startsWith("-") ? "text-rose-400" : "text-slate-400"
              )}>
                {trend}
              </span>
            )}
          </div>
          {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
        </div>
        {Icon && (
          <div className={clsx(
            "grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ring-1 ring-inset",
            TONE[tone]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
