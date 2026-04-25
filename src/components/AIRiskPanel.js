import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Brain, Sparkles, AlertTriangle, Activity, Users, Clock, ArrowUpRight,
  CheckCircle2, RotateCcw, ShieldCheck, TrendingDown, Zap,
} from "lucide-react";
import clsx from "clsx";

import Pill from "@/components/Pill";
import { predictRisks, severityTone } from "@/utils/risk";

const ICON_BY_KIND = {
  shortage: Users,
  fatigue:  Activity,
  delay:    Clock,
};

const SEVERITY_LABEL = {
  critical: "CRITICAL",
  high:     "HIGH",
  medium:   "MEDIUM",
  low:      "LOW",
};

const RING_BY_SEVERITY = {
  critical: "ring-rose-500/40 bg-rose-500/[0.07]",
  high:     "ring-amber-500/40 bg-amber-500/[0.06]",
  medium:   "ring-atom-500/40 bg-atom-500/[0.06]",
  low:      "ring-emerald-500/40 bg-emerald-500/[0.06]",
};

const BAR_BY_SEVERITY = {
  critical: "from-rose-500 to-rose-400",
  high:     "from-amber-500 to-amber-300",
  medium:   "from-atom-500 to-atom-300",
  low:      "from-emerald-500 to-emerald-300",
};

const ICON_BG_BY_SEVERITY = {
  critical: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  high:     "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  medium:   "bg-atom-500/15 text-atom-200 ring-atom-500/30",
  low:      "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

export default function AIRiskPanel() {
  const risks = useMemo(() => predictRisks(), []);
  const [resolved, setResolved] = useState(new Set());

  function toggleResolve(id) {
    const next = new Set(resolved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setResolved(next);
  }

  function resolveAll() {
    setResolved(new Set(risks.map((r) => r.id)));
  }

  function clearAll() {
    setResolved(new Set());
  }

  // Aggregate index = average of effective probabilities
  const aggregate = Math.round(
    risks.reduce((s, r) => s + (resolved.has(r.id) ? r.postProbability : r.probability), 0) / risks.length
  );
  const aggregateBefore = Math.round(risks.reduce((s, r) => s + r.probability, 0) / risks.length);
  const allResolved = resolved.size === risks.length;
  const someResolved = resolved.size > 0;

  return (
    <section className="card relative overflow-hidden mt-6">
      {/* glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 200px at 12% -20%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(500px 180px at 88% 110%, rgba(244,114,182,0.06), transparent 60%)",
        }}
      />

      {/* HEADER */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-atom-500/30 to-atom-500/5 ring-1 ring-atom-500/40">
            <Brain className="h-5 w-5 text-atom-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">AI Risk Forecast</h3>
              <Pill tone="info" dot>Predictive · 7-day horizon</Pill>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Predictive analytics engine — rule-based decision support across staffing, fatigue, and schedule risk.
            </p>
          </div>
        </div>

        {/* Aggregate index */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Aggregate Risk Index</div>
            <div className="flex items-baseline justify-end gap-2">
              <span
                className={clsx(
                  "text-2xl font-semibold tabular-nums transition-colors",
                  aggregate >= 70 ? "text-rose-300" :
                  aggregate >= 50 ? "text-amber-300" :
                  aggregate >= 30 ? "text-atom-200" : "text-emerald-300"
                )}
              >
                {aggregate}%
              </span>
              {someResolved && (
                <span className="text-[11px] text-emerald-300 inline-flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" />
                  −{aggregateBefore - aggregate}
                </span>
              )}
            </div>
          </div>

          {someResolved ? (
            <button onClick={clearAll} className="btn-ghost !py-1.5 !px-3 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Forecast
            </button>
          ) : (
            <button onClick={resolveAll} className="btn-primary !py-1.5 !px-3 text-xs shadow-glow">
              <Zap className="h-3.5 w-3.5" /> Resolve All
            </button>
          )}
        </div>
      </div>

      {/* BANNER WHEN ALL RESOLVED */}
      {allResolved && (
        <div className="relative border-b border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-2.5 flex items-center gap-2 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          All forecast risks mitigated. Workforce posture moved from <b className="mx-1 font-semibold">{aggregateBefore}%</b> → <b className="ml-1 font-semibold">{aggregate}%</b> risk.
        </div>
      )}

      {/* RISK ROWS */}
      <ul className="relative divide-y divide-white/5">
        {risks.map((r) => {
          const isResolved = resolved.has(r.id);
          const liveProb = isResolved ? r.postProbability : r.probability;
          const liveSev = isResolved ? "low" : r.severity;
          const Icon = ICON_BY_KIND[r.kind] || AlertTriangle;
          const delta = r.probability - r.postProbability;

          return (
            <li
              key={r.id}
              className={clsx(
                "px-5 py-4 transition-colors",
                isResolved ? "bg-emerald-500/[0.04]" : ""
              )}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left: title + headline */}
                <div className="lg:col-span-5 flex items-start gap-3">
                  <div
                    className={clsx(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset transition-colors",
                      isResolved
                        ? ICON_BG_BY_SEVERITY.low
                        : ICON_BG_BY_SEVERITY[r.severity]
                    )}
                  >
                    {isResolved ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white">{r.title}</span>
                      {isResolved ? (
                        <Pill tone="ok" dot>MITIGATED</Pill>
                      ) : (
                        <span
                          className={clsx(
                            "pill",
                            r.severity === "critical" && "bg-rose-500/15 text-rose-300 ring-rose-500/40",
                            r.severity === "high"     && "bg-amber-500/15 text-amber-300 ring-amber-500/40",
                            r.severity === "medium"   && "bg-atom-500/15 text-atom-200 ring-atom-500/40",
                            r.severity === "low"      && "bg-emerald-500/15 text-emerald-300 ring-emerald-500/40"
                          )}
                        >
                          {SEVERITY_LABEL[r.severity]}
                        </span>
                      )}
                    </div>
                    <p className={clsx(
                      "mt-1 text-[13px] leading-snug",
                      isResolved ? "text-slate-400 line-through decoration-emerald-500/40" : "text-slate-200"
                    )}>
                      {r.headline}
                    </p>
                    <div className="mt-1.5 text-[10.5px] text-slate-500 italic">
                      {r.basis}
                    </div>
                  </div>
                </div>

                {/* Middle: probability bar + delta */}
                <div className="lg:col-span-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">
                      Probability
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={clsx(
                          "text-2xl font-semibold tabular-nums transition-colors",
                          isResolved ? "text-emerald-300"
                            : liveSev === "critical" ? "text-rose-300"
                            : liveSev === "high"     ? "text-amber-300"
                            : liveSev === "medium"   ? "text-atom-200"
                            : "text-emerald-300"
                        )}
                      >
                        {liveProb}%
                      </span>
                      {isResolved && delta > 0 && (
                        <span className="text-[10.5px] text-emerald-300 inline-flex items-center gap-0.5">
                          <TrendingDown className="h-3 w-3" />
                          −{delta}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={clsx(
                        "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
                        isResolved
                          ? "from-emerald-500 to-emerald-300"
                          : BAR_BY_SEVERITY[r.severity]
                      )}
                      style={{ width: `${liveProb}%` }}
                    />
                  </div>
                  {/* Causes */}
                  <ul className="mt-2 space-y-0.5 text-[10.5px] text-slate-400">
                    {r.causes.slice(0, 3).map((c, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-slate-600 mt-0.5">›</span>
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: recommendation + actions */}
                <div className="lg:col-span-4">
                  <div
                    className={clsx(
                      "rounded-lg ring-1 ring-inset px-3 py-2.5 text-[12px] leading-snug",
                      isResolved
                        ? "ring-emerald-500/30 bg-emerald-500/[0.05] text-emerald-100"
                        : RING_BY_SEVERITY[r.severity] + " text-slate-200"
                    )}
                  >
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">
                      {isResolved ? "Resolution applied" : "Recommended action"}
                    </div>
                    {isResolved ? r.resolveSummary : r.recommendation}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => toggleResolve(r.id)}
                      className={clsx(
                        "btn !py-1.5 !px-3 text-xs",
                        isResolved
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                          : "bg-atom-500 text-ink-950 hover:bg-atom-400"
                      )}
                    >
                      {isResolved ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" /> Undo
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" /> {r.resolveLabel}
                        </>
                      )}
                    </button>
                    {r.goto && (
                      <Link
                        href={r.goto}
                        className="text-xs text-atom-300 hover:text-atom-200 inline-flex items-center gap-1"
                      >
                        Open in Control Center <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/5 bg-white/[0.02] px-5 py-2.5 text-[11px] text-slate-400">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-atom-300" />
          <span>{risks.length} active forecasts · refreshed every 60s · model v0.9 (rule-based)</span>
        </div>
        <span className="text-slate-500">
          Atomforce moves workforce management from <span className="text-slate-300">reactive</span> scheduling to <span className="text-atom-300">predictive risk prevention</span>.
        </span>
      </div>
    </section>
  );
}
