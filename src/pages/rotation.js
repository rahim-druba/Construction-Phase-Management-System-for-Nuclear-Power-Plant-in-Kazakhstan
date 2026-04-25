import { useMemo, useState } from "react";
import { Sun, Moon, BedDouble, AlertTriangle, RefreshCw } from "lucide-react";
import clsx from "clsx";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import { WORKERS } from "@/data/workers";
import { useLang } from "@/utils/i18n";

// Build a 7-day rotation plan starting from today.
// Pattern: 4 days on (D), 3 days on night (N), 2 days off (O) — wrapped per worker offset
function planFor(worker, days = 7) {
  const PATTERN = ["D","D","D","D","N","N","N","O","O"];
  const offset = worker.id % PATTERN.length;
  return Array.from({ length: days }, (_, i) => PATTERN[(offset + i) % PATTERN.length]);
}

function dayLabel(i) {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

const SHIFT_META = {
  D: { label: "Day",   icon: Sun,        cls: "bg-atom-500/20 text-atom-200 ring-atom-500/30" },
  N: { label: "Night", icon: Moon,       cls: "bg-indigo-500/20 text-indigo-200 ring-indigo-500/30" },
  O: { label: "Off",   icon: BedDouble,  cls: "bg-white/5 text-slate-400 ring-white/10" },
};

export default function RotationPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState("all");
  const [rotated, setRotated] = useState(new Set());

  const data = useMemo(() => {
    return WORKERS.map((w) => ({
      worker: w,
      plan: planFor(w),
      flagged: w.daysWorked >= 7,
    }));
  }, []);

  const visible = data.filter(({ flagged }) => filter === "all" ? true : flagged);
  const flaggedCount = data.filter((d) => d.flagged).length;

  function rotateAll() {
    const next = new Set(rotated);
    data.forEach((d) => { if (d.flagged) next.add(d.worker.id); });
    setRotated(next);
  }

  return (
    <>
      <PageHeader
        title="Shift / Rotation Planner"
        subtitle="7-day rotation forecast. Workers with 7+ consecutive days are auto-flagged for mandatory rest."
        right={
          <>
            <div className="flex rounded-md border border-white/10 bg-white/[0.04] p-0.5 text-xs">
              {[
                { id: "all", label: "All" },
                { id: "flagged", label: `Flagged (${flaggedCount})` },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setFilter(b.id)}
                  className={clsx(
                    "px-3 py-1.5 rounded font-semibold transition-colors",
                    filter === b.id ? "bg-atom-500/20 text-atom-200" : "text-slate-400 hover:text-white"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <button onClick={rotateAll} className="btn-primary" disabled={flaggedCount === 0}>
              <RefreshCw className="h-4 w-4" /> Auto-rotate flagged
            </button>
          </>
        }
      />

      {/* Legend */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
        {Object.entries(SHIFT_META).map(([k, v]) => {
          const Icon = v.icon;
          return (
            <div key={k} className={clsx("inline-flex items-center gap-1.5 rounded-md ring-1 ring-inset px-2 py-1", v.cls)}>
              <Icon className="h-3.5 w-3.5" /> {v.label}
            </div>
          );
        })}
        <span className="ml-auto text-slate-400 inline-flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> 7+ consecutive days = mandatory rest
        </span>
      </div>

      <div className="card overflow-hidden">
        <div className="max-h-[68vh] overflow-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="min-w-[220px]">Worker</th>
                <th>Skill</th>
                <th className="text-center">Days</th>
                {Array.from({ length: 7 }, (_, i) => (
                  <th key={i} className="text-center font-mono">{dayLabel(i)}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ worker: w, plan, flagged }) => {
                const isRotated = rotated.has(w.id);
                const adjustedPlan = isRotated
                  ? plan.map((s, i) => i < 2 ? "O" : s)  // force 2 rest days
                  : plan;
                return (
                  <tr key={w.id} className={flagged ? "bg-amber-500/5" : ""}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="grid h-7 w-7 place-items-center rounded-full bg-atom-500/20 ring-1 ring-atom-400/30 text-[10px] font-semibold text-atom-100">
                          {w.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="leading-tight">
                          <div className="text-white text-sm">{w.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{w.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-300">{w.skill}</td>
                    <td className="text-center">
                      <span className={clsx("tabular-nums font-semibold", flagged ? "text-amber-300" : "text-slate-200")}>
                        {w.daysWorked}
                      </span>
                    </td>
                    {adjustedPlan.map((s, i) => {
                      const meta = SHIFT_META[s];
                      const Icon = meta.icon;
                      return (
                        <td key={i} className="text-center">
                          <span className={clsx(
                            "inline-flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-inset",
                            meta.cls
                          )} title={meta.label}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                        </td>
                      );
                    })}
                    <td>
                      {isRotated ? (
                        <Pill tone="ok" dot>Rest scheduled</Pill>
                      ) : flagged ? (
                        <Pill tone="warn" dot>
                          <AlertTriangle className="h-3 w-3" /> Needs rotation
                        </Pill>
                      ) : (
                        <Pill tone="muted" dot>Healthy</Pill>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={11} className="text-center text-slate-500 py-12">No workers match the filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
