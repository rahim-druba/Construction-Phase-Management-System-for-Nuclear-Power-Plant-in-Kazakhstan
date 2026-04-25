import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Activity, ArrowRight, AlertTriangle, MapPin, Sparkles, RefreshCw } from "lucide-react";
import clsx from "clsx";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import FatigueBar from "@/components/FatigueBar";
import { WORKERS } from "@/data/workers";
import { ZONES } from "@/data/zones";
import { recoverySuggestions, zoneName } from "@/utils/workforce";

const STATUS_TONE = {
  "on-track": "ok",
  "at-risk":  "warn",
  "delayed":  "danger",
  "complete": "info",
};

export default function RecoveryPage() {
  const router = useRouter();
  const [zoneId, setZoneId] = useState("TH");
  const [delayDays, setDelayDays] = useState(3);
  const [moveCount, setMoveCount] = useState(8);
  const [moved, setMoved] = useState(new Set());

  useEffect(() => {
    if (router.query.zone && typeof router.query.zone === "string") {
      setZoneId(router.query.zone);
    }
  }, [router.query.zone]);

  const candidates = useMemo(() => recoverySuggestions(WORKERS, zoneId), [zoneId]);

  const selected = useMemo(() => candidates.slice(0, moveCount), [candidates, moveCount]);

  // Source breakdown for the chosen movement
  const sourceBreakdown = useMemo(() => {
    const m = {};
    selected.forEach((w) => { m[w.zone] = (m[w.zone] || 0) + 1; });
    return Object.entries(m).map(([zone, count]) => ({ zone, count, name: zoneName(zone) }));
  }, [selected]);

  // Naive recovery estimate: each extra worker shaves ~6h off delay, capped at 60%
  const recoveryHours = Math.min(delayDays * 24 * 0.6, selected.length * 6);
  const recoveryDays  = (recoveryHours / 24).toFixed(1);
  const recoveryPct   = delayDays === 0 ? 0 : Math.min(100, Math.round((recoveryHours / (delayDays * 24)) * 100));

  function commit() {
    const next = new Set(moved);
    selected.forEach((w) => next.add(w.id));
    setMoved(next);
  }

  return (
    <>
      <PageHeader
        title="Delay Recovery Simulator"
        subtitle="If a zone slips, instantly model who you can re-allocate from healthy zones to recover schedule."
        right={
          moved.size > 0 && (
            <button onClick={() => setMoved(new Set())} className="btn-ghost">
              <RefreshCw className="h-4 w-4" /> Reset simulation
            </button>
          )
        }
      />

      {/* Inputs */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Delayed Zone</label>
            <select className="input mt-1" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {ZONES.map((z) => (
                <option key={z.id} value={z.id}>{z.id} — {z.name} ({z.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Delay (days)</label>
            <input
              type="number" min={1} max={30}
              className="input mt-1"
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value) || 1)}
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Workers to Move</label>
            <input
              type="range" min={1} max={Math.max(1, candidates.length)}
              className="mt-3 w-full accent-atom-400"
              value={Math.min(moveCount, Math.max(1, candidates.length))}
              onChange={(e) => setMoveCount(Number(e.target.value))}
            />
            <div className="text-xs text-slate-300 tabular-nums">{Math.min(moveCount, candidates.length)} / {candidates.length} eligible</div>
          </div>
          <div className="flex items-end">
            <button onClick={commit} disabled={selected.length === 0} className="btn-primary w-full">
              <Sparkles className="h-4 w-4" /> Run Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Outcome cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Original Delay
          </div>
          <div className="mt-1 text-3xl font-semibold text-white tabular-nums">{delayDays}<span className="text-base text-slate-400 ml-1">days</span></div>
          <div className="mt-1 text-xs text-slate-400">{zoneName(zoneId)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-atom-300" /> Recovered
          </div>
          <div className="mt-1 text-3xl font-semibold text-atom-200 tabular-nums">{recoveryDays}<span className="text-base text-slate-400 ml-1">days</span></div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-atom-400 transition-all" style={{ width: `${recoveryPct}%` }} />
          </div>
          <div className="mt-1 text-xs text-slate-400">{recoveryPct}% of original delay</div>
        </div>
        <div className="card p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Net Slippage After Move</div>
          <div className="mt-1 text-3xl font-semibold text-white tabular-nums">
            {Math.max(0, (delayDays - Number(recoveryDays))).toFixed(1)}
            <span className="text-base text-slate-400 ml-1">days</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {selected.length} workers re-allocated
          </div>
        </div>
      </div>

      {/* Movement plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Re-allocation Plan</h3>
            <Pill tone="info" dot>{selected.length} moves</Pill>
          </div>
          <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>From</th>
                  <th></th>
                  <th>To</th>
                  <th>Fatigue</th>
                  <th>Days</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((w) => {
                  const isMoved = moved.has(w.id);
                  return (
                    <tr key={w.id} className={isMoved ? "bg-emerald-500/5" : ""}>
                      <td>
                        <div className="text-white text-sm">{w.name}</div>
                        <div className="text-[11px] text-slate-500">{w.skill}</div>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-300">{w.zone}</span>
                        <span className="ml-1 text-[11px] text-slate-500">{zoneName(w.zone)}</span>
                      </td>
                      <td className="text-slate-500"><ArrowRight className="h-4 w-4" /></td>
                      <td>
                        <span className="font-mono text-xs text-atom-300">{zoneId}</span>
                        <span className="ml-1 text-[11px] text-slate-400">{zoneName(zoneId)}</span>
                      </td>
                      <td><FatigueBar value={w.fatigue} /></td>
                      <td className="tabular-nums text-slate-300">{w.daysWorked}</td>
                    </tr>
                  );
                })}
                {selected.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-10">No eligible workers found in healthy zones.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-atom-300" /> Source Zones
          </h3>
          <p className="text-xs text-slate-400">Where the workers come from</p>

          <ul className="mt-3 space-y-2">
            {sourceBreakdown.length === 0 && <li className="text-xs text-slate-500">—</li>}
            {sourceBreakdown.map((s) => (
              <li key={s.zone} className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                <div>
                  <div className="text-sm text-white">{s.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{s.zone}</div>
                </div>
                <Pill tone="info">-{s.count}</Pill>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-atom-500/30 bg-atom-500/5 p-3 text-xs text-atom-100">
            All moves preserve cert validity and exclude workers with fatigue ≥ 70.
          </div>
        </div>
      </div>

      {/* Zones overview strip */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-white mb-2">Site Zone Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ZONES.map((z) => (
            <button
              key={z.id}
              onClick={() => setZoneId(z.id)}
              className={clsx(
                "card p-3 text-left transition-colors",
                z.id === zoneId ? "ring-1 ring-atom-400/50 bg-atom-500/5" : "card-hover"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-white font-medium truncate">{z.name}</div>
                <Pill tone={STATUS_TONE[z.status]}>{z.status}</Pill>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={clsx("h-full",
                  z.status === "delayed" ? "bg-rose-500" :
                  z.status === "at-risk" ? "bg-amber-500" :
                  z.status === "complete" ? "bg-emerald-500" : "bg-atom-400"
                )} style={{ width: `${z.progress}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>{z.discipline}</span>
                <span className="tabular-nums">{z.progress}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
