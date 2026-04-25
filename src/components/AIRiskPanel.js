import { useMemo, useState } from "react";
import {
  AlertTriangle, Activity, Users, Clock, CheckCircle2, ArrowRight, RotateCcw, Sparkles,
} from "lucide-react";
import clsx from "clsx";

import Pill from "@/components/Pill";
import { predictRisks } from "@/utils/risk";

const ICON_BY_KIND = {
  shortage: Users,
  fatigue:  Activity,
  delay:    Clock,
};

const NUM_BY_SEVERITY = {
  critical: "text-rose-300",
  high:     "text-amber-300",
  medium:   "text-atom-200",
  low:      "text-emerald-300",
};

const BAR_BY_SEVERITY = {
  critical: "bg-rose-500",
  high:     "bg-amber-400",
  medium:   "bg-atom-400",
  low:      "bg-emerald-400",
};

const BORDER_BY_SEVERITY = {
  critical: "border-rose-500/30",
  high:     "border-amber-500/30",
  medium:   "border-atom-500/30",
  low:      "border-emerald-500/30",
};

const ICON_TINT_BY_SEVERITY = {
  critical: "text-rose-300",
  high:     "text-amber-300",
  medium:   "text-atom-200",
  low:      "text-emerald-300",
};

const SEVERITY_WORD = {
  critical: "Critical",
  high:     "High",
  medium:   "Medium",
  low:      "Low",
};

export default function AIRiskPanel() {
  const risks = useMemo(() => predictRisks(), []);
  const [resolved, setResolved] = useState(new Set());

  function toggle(id) {
    const next = new Set(resolved);
    if (next.has(id)) next.delete(id); else next.add(id);
    setResolved(next);
  }

  const openCount = risks.length - resolved.size;

  return (
    <section className="card mt-6">
      {/* Header — single line, construction-PM tone */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            This Week&rsquo;s Risk Forecast
            <span className="ml-2 text-[11px] font-normal text-slate-400">· next 7 days on site</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Each score is the <span className="text-slate-300">likelihood the issue causes a schedule slip or safety incident within 7 days</span>.
            Built from the live task pipeline, fatigue thresholds, and certification expiry.
          </p>
        </div>
        <Pill tone={openCount === 0 ? "ok" : "warn"} dot>
          {openCount === 0 ? "All clear" : `${openCount} open issue${openCount === 1 ? "" : "s"}`}
        </Pill>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-white/5">
        {risks.map((r) => {
          const isResolved = resolved.has(r.id);
          const liveProb = isResolved ? r.postProbability : r.probability;
          const sev = isResolved ? "low" : r.severity;
          const Icon = ICON_BY_KIND[r.kind] || AlertTriangle;

          return (
            <li
              key={r.id}
              className={clsx(
                "px-5 py-3.5 transition-colors",
                isResolved && "bg-emerald-500/[0.04]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={clsx(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
                  isResolved
                    ? "bg-emerald-500/10 ring-emerald-500/30"
                    : "bg-white/5 ring-white/10"
                )}>
                  {isResolved ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <Icon className={clsx("h-4 w-4", ICON_TINT_BY_SEVERITY[sev])} />
                  )}
                </div>

                {/* Headline + recommendation */}
                <div className="min-w-0 flex-1">
                  <div className={clsx(
                    "text-sm font-medium",
                    isResolved ? "text-slate-400 line-through decoration-emerald-500/40" : "text-white"
                  )}>
                    {r.headline}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <ArrowRight className="h-3 w-3 shrink-0 text-slate-500" />
                    <span className="leading-snug">
                      {isResolved ? r.resolveSummary : r.recommendation}
                    </span>
                  </div>
                </div>

                {/* Likelihood + action */}
                <div className="flex shrink-0 flex-col items-end gap-1 w-[170px]">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-slate-500">
                    Likelihood · 7-day
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={clsx(
                      "text-xl font-semibold tabular-nums transition-colors leading-none",
                      NUM_BY_SEVERITY[sev]
                    )}>
                      {liveProb}%
                    </span>
                    <span className={clsx(
                      "text-[10px] font-medium uppercase tracking-wider",
                      NUM_BY_SEVERITY[sev]
                    )}>
                      {SEVERITY_WORD[sev]}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        BAR_BY_SEVERITY[sev]
                      )}
                      style={{ width: `${liveProb}%` }}
                    />
                  </div>
                  {isResolved && (
                    <div className="text-[10px] text-slate-500 tabular-nums">
                      was {r.probability}%
                    </div>
                  )}
                  <button
                    onClick={() => toggle(r.id)}
                    className={clsx(
                      "btn !py-1 !px-2.5 text-[11px] font-medium w-full justify-center mt-0.5",
                      isResolved
                        ? "border border-white/10 text-slate-300 hover:bg-white/5"
                        : "bg-atom-500 text-ink-950 hover:bg-atom-400"
                    )}
                  >
                    {isResolved ? (
                      <><RotateCcw className="h-3 w-3" /> Undo</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Resolve</>
                    )}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
