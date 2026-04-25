import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  Wrench, Sparkles, MapPin, Clock, CheckCircle2, AlertTriangle, RotateCcw,
  ArrowRight, Activity, Cpu, RefreshCw, ShieldCheck, Users,
} from "lucide-react";
import clsx from "clsx";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import FatigueBar from "@/components/FatigueBar";
import { WORKERS } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { ZONES } from "@/data/zones";
import {
  suggestCrew, recoverySuggestions, certLabel, zoneName, freshReplacement,
} from "@/utils/workforce";
import { useLang } from "@/utils/i18n";

const PRIORITY_TONES = { critical: "danger", high: "warn", medium: "info" };
const STATUS_TONE = {
  "on-track": "ok", "at-risk": "warn", "delayed": "danger", "complete": "info",
};
const FATIGUE_THRESHOLD = 65;

export default function ControlCenter() {
  const { t } = useLang();
  const router = useRouter();

  const [mode, setMode] = useState("task"); // "task" | "recovery"

  // ---- TASK MODE state ----
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [allowExpiring, setAllowExpiring] = useState(false);
  const [assigned, setAssigned] = useState(new Set());
  const [rotated, setRotated] = useState(new Map()); // fatiguedId -> replacementId

  // ---- RECOVERY MODE state ----
  const [zoneId, setZoneId] = useState("TH");
  const [delayDays, setDelayDays] = useState(3);
  const [moveCount, setMoveCount] = useState(8);
  const [moved, setMoved] = useState(new Set());

  // Read URL params: ?mode=recovery&zone=TH
  useEffect(() => {
    const m = router.query.mode;
    const z = router.query.zone;
    if (m === "recovery" || m === "task") setMode(m);
    if (typeof z === "string" && ZONES.some((x) => x.id === z)) setZoneId(z);
  }, [router.query.mode, router.query.zone]);

  const liveWorkers = useMemo(
    () => WORKERS.map((w) => ({ ...w, available: w.available && !assigned.has(w.id) && !moved.has(w.id) })),
    [assigned, moved]
  );

  // ============= TASK MODE COMPUTE =============
  const task = TASKS.find((x) => x.id === taskId);

  const taskResult = useMemo(() => {
    if (mode !== "task") return { chosen: [], poolSize: 0, shortBy: 0 };
    return suggestCrew(liveWorkers, {
      skill: task.skill,
      needed: task.needed,
      zoneId: task.zoneId,
      allowExpiringCerts: allowExpiring,
    });
  }, [mode, liveWorkers, task, allowExpiring]);

  // After applying any rotations, the "effective crew" replaces fatigued ones with fresh subs
  const effectiveCrew = useMemo(() => {
    return taskResult.chosen.map((w) => {
      const repId = rotated.get(w.id);
      if (!repId) return { worker: w, replaced: false };
      const rep = WORKERS.find((x) => x.id === repId);
      return { worker: rep || w, replaced: !!rep, original: w };
    });
  }, [taskResult.chosen, rotated]);

  const fatiguedInCrew = effectiveCrew.filter((c) => !c.replaced && c.worker.fatigue >= FATIGUE_THRESHOLD);

  // ============= RECOVERY MODE COMPUTE =============
  const recoveryCandidates = useMemo(
    () => recoverySuggestions(liveWorkers, zoneId),
    [liveWorkers, zoneId]
  );
  const recoverySelected = useMemo(
    () => recoveryCandidates.slice(0, Math.min(moveCount, recoveryCandidates.length)),
    [recoveryCandidates, moveCount]
  );
  const recoveryHours = Math.min(delayDays * 24 * 0.6, recoverySelected.length * 6);
  const recoveryDays  = (recoveryHours / 24).toFixed(1);
  const recoveryPct   = delayDays === 0 ? 0 : Math.min(100, Math.round((recoveryHours / (delayDays * 24)) * 100));
  const sourceBreakdown = useMemo(() => {
    const m = {};
    recoverySelected.forEach((w) => { m[w.zone] = (m[w.zone] || 0) + 1; });
    return Object.entries(m).map(([z, count]) => ({ zone: z, count, name: zoneName(z) }));
  }, [recoverySelected]);

  // ============= ACTIONS =============
  function commitAssignment() {
    const next = new Set(assigned);
    effectiveCrew.forEach((c) => next.add(c.worker.id));
    setAssigned(next);
    setRotated(new Map());
  }

  function autoRotate() {
    const usedIds = new Set([
      ...assigned,
      ...moved,
      ...effectiveCrew.map((c) => c.worker.id),
    ]);
    const newMap = new Map(rotated);
    fatiguedInCrew.forEach((c) => {
      const rep = freshReplacement(WORKERS, c.worker, usedIds);
      if (rep) {
        newMap.set(c.worker.id, rep.id);
        usedIds.add(rep.id);
      }
    });
    setRotated(newMap);
  }

  function commitRecovery() {
    const next = new Set(moved);
    recoverySelected.forEach((w) => next.add(w.id));
    setMoved(next);
  }

  function reset() {
    setAssigned(new Set());
    setMoved(new Set());
    setRotated(new Map());
  }

  // One-click "Optimize Workforce" — runs the right action for current mode + auto-rotate
  function optimize() {
    if (mode === "task") {
      autoRotate();
      // Slight delay to let rotation render before the assignment toast — but we can do both immediately
      setTimeout(commitAssignment, 50);
    } else {
      commitRecovery();
    }
  }

  const sessionDirty = assigned.size > 0 || moved.size > 0 || rotated.size > 0;

  return (
    <>
      <PageHeader
        title={t("control.title")}
        subtitle={t("control.subtitle")}
        right={
          <>
            {sessionDirty && (
              <button onClick={reset} className="btn-ghost">
                <RotateCcw className="h-4 w-4" /> {t("common.reset")}
              </button>
            )}
            <Pill tone="info" dot>AI-assisted</Pill>
          </>
        }
      />

      {/* MODE TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] p-1">
          {[
            { id: "task",     label: t("control.modes.task"),     icon: Wrench },
            { id: "recovery", label: t("control.modes.recovery"), icon: Activity },
          ].map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-atom-500/20 text-atom-200 ring-1 ring-inset ring-atom-500/40"
                         : "text-slate-300 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" /> {m.label}
              </button>
            );
          })}
        </div>

        <button onClick={optimize} className="btn-primary !px-4 !py-2.5 text-sm font-semibold shadow-glow">
          <Sparkles className="h-4 w-4" /> {t("control.actions.optimize")}
        </button>
      </div>

      {/* MAIN GRID: 12 col → 3 / 6 / 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT: TARGET PICKER */}
        <div className="card p-3 lg:col-span-3">
          <div className="px-2 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("control.sections.target")}
            </span>
            <Pill tone="muted">{mode === "task" ? `${TASKS.length} tasks` : `${ZONES.length} zones`}</Pill>
          </div>

          {mode === "task" ? (
            <ul className="space-y-1 max-h-[68vh] overflow-y-auto pr-1">
              {TASKS.map((tk) => {
                const isActive = tk.id === taskId;
                return (
                  <li key={tk.id}>
                    <button
                      onClick={() => setTaskId(tk.id)}
                      className={clsx(
                        "group w-full text-left rounded-lg px-3 py-2.5 transition-colors border",
                        isActive
                          ? "border-atom-500/40 bg-atom-500/10"
                          : "border-transparent hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white truncate">{tk.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span><Wrench className="inline h-3 w-3 mr-0.5" />{tk.skill}</span>
                            <span className="text-slate-600">·</span>
                            <span><MapPin className="inline h-3 w-3 mr-0.5" />{zoneName(tk.zoneId)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Pill tone={PRIORITY_TONES[tk.priority]} className="capitalize">{tk.priority}</Pill>
                          <span className="text-[10px] text-slate-500"><Clock className="inline h-3 w-3 mr-0.5" />{tk.deadlineDays}d</span>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400">
                        Needs <span className="text-white font-semibold">{tk.needed}</span> workers
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="space-y-1 max-h-[68vh] overflow-y-auto pr-1">
              {ZONES.map((z) => {
                const isActive = z.id === zoneId;
                return (
                  <li key={z.id}>
                    <button
                      onClick={() => setZoneId(z.id)}
                      className={clsx(
                        "group w-full text-left rounded-lg px-3 py-2.5 transition-colors border",
                        isActive
                          ? "border-atom-500/40 bg-atom-500/10"
                          : "border-transparent hover:bg-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium text-white truncate">{z.name}</div>
                        <Pill tone={STATUS_TONE[z.status]} className="capitalize">{z.status}</Pill>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {z.discipline} · <span className="font-mono">{z.id}</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div className={clsx("h-full",
                          z.status === "delayed" ? "bg-rose-500" :
                          z.status === "at-risk" ? "bg-amber-500" :
                          z.status === "complete" ? "bg-emerald-500" : "bg-atom-400"
                        )} style={{ width: `${z.progress}%` }} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* CENTER: SUGGESTED CREW / REALLOCATION PLAN */}
        <div className="card p-4 lg:col-span-6">
          {mode === "task" ? (
            <TaskCenter
              task={task}
              result={taskResult}
              effectiveCrew={effectiveCrew}
              fatiguedInCrew={fatiguedInCrew}
              allowExpiring={allowExpiring}
              setAllowExpiring={setAllowExpiring}
            />
          ) : (
            <RecoveryCenter
              zoneId={zoneId}
              delayDays={delayDays}
              setDelayDays={setDelayDays}
              moveCount={moveCount}
              setMoveCount={setMoveCount}
              candidates={recoveryCandidates}
              selected={recoverySelected}
              recoveryDays={recoveryDays}
              recoveryPct={recoveryPct}
              sourceBreakdown={sourceBreakdown}
            />
          )}
        </div>

        {/* RIGHT: ACTIONS PANEL */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("control.sections.actions")}
            </div>

            {mode === "task" ? (
              <div className="mt-3 space-y-2">
                <button
                  onClick={commitAssignment}
                  disabled={effectiveCrew.length === 0}
                  className="btn-primary w-full"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t("control.actions.assign")} ({effectiveCrew.length})
                </button>
                <button
                  onClick={autoRotate}
                  disabled={fatiguedInCrew.length === 0}
                  className="btn-ghost w-full"
                  title="Replace fatigued workers in the suggested crew with rested substitutes"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t("control.actions.rotate")} ({fatiguedInCrew.length})
                </button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <button
                  onClick={commitRecovery}
                  disabled={recoverySelected.length === 0}
                  className="btn-primary w-full"
                >
                  <ArrowRight className="h-4 w-4" />
                  {t("control.actions.reallocate")} ({recoverySelected.length})
                </button>
                <div className="rounded-lg border border-atom-500/30 bg-atom-500/5 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Recovery Estimate</div>
                  <div className="mt-1 text-2xl font-semibold text-atom-200 tabular-nums">
                    {recoveryDays}<span className="text-sm text-slate-400 ml-1">days</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-atom-400 transition-all" style={{ width: `${recoveryPct}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{recoveryPct}% of {delayDays}d delay</div>
                </div>
              </div>
            )}
          </div>

          {/* Live KPI panel */}
          <div className="card p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Session Snapshot
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <Stat icon={Users}        label="Pool"          value={mode === "task" ? taskResult.poolSize : recoveryCandidates.length} />
              <Stat icon={CheckCircle2} label="Selected"      value={mode === "task" ? effectiveCrew.length : recoverySelected.length} tone="ok" />
              <Stat icon={AlertTriangle} label="Fatigued"     value={mode === "task" ? fatiguedInCrew.length : recoverySelected.filter(w=>w.fatigue>=FATIGUE_THRESHOLD).length} tone="warn" />
              <Stat icon={ShieldCheck}  label="Cert valid"    value={(mode==="task"?effectiveCrew.map(c=>c.worker):recoverySelected).filter(w=>w.cert.status==="valid").length} tone="info" />
              {mode === "task" && (
                <Stat icon={MapPin}     label="In-zone"       value={effectiveCrew.filter(c=>c.worker.zone===task.zoneId).length} />
              )}
            </ul>

            {sessionDirty && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-200 flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>
                  {assigned.size > 0 && <>{assigned.size} assigned · </>}
                  {moved.size > 0 && <>{moved.size} reallocated · </>}
                  {rotated.size > 0 && <>{rotated.size} rotated</>}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============== Sub-components ===============

function Stat({ icon: Icon, label, value, tone = "muted" }) {
  const toneCls = {
    muted: "text-slate-300",
    ok:    "text-emerald-300",
    warn:  "text-amber-300",
    info:  "text-atom-300",
    danger:"text-rose-300",
  }[tone];
  return (
    <li className="flex items-center justify-between rounded-md bg-white/[0.03] px-2.5 py-1.5">
      <span className="inline-flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={clsx("font-semibold tabular-nums", toneCls)}>{value}</span>
    </li>
  );
}

function TaskCenter({ task, result, effectiveCrew, fatiguedInCrew, allowExpiring, setAllowExpiring }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-atom-300" /> Suggested Crew
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono text-slate-500">{task.id}</span> · {task.title} · needs <b className="text-slate-200">{task.needed}</b>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result.shortBy > 0 ? (
            <Pill tone="danger" dot><AlertTriangle className="h-3 w-3" /> Short by {result.shortBy}</Pill>
          ) : (
            <Pill tone="ok" dot><CheckCircle2 className="h-3 w-3" /> Fully staffed</Pill>
          )}
          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowExpiring}
              onChange={(e) => setAllowExpiring(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-atom-500 focus:ring-atom-500"
            />
            Allow expiring certs
          </label>
        </div>
      </div>

      {fatiguedInCrew.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-100">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            {fatiguedInCrew.length} worker{fatiguedInCrew.length === 1 ? "" : "s"} in this crew exceed fatigue threshold ({FATIGUE_THRESHOLD}).
            Use <b>Auto-Rotate</b> to swap them for rested substitutes.
          </span>
        </div>
      )}

      <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
        <table className="table-base">
          <thead>
            <tr>
              <th>#</th>
              <th>Worker</th>
              <th>Zone</th>
              <th>Fatigue</th>
              <th>Days</th>
              <th>Cert</th>
            </tr>
          </thead>
          <tbody>
            {effectiveCrew.map((c, idx) => {
              const w = c.worker;
              const cert = certLabel(w.cert);
              const inZone = w.zone === task.zoneId;
              return (
                <tr key={w.id} className={c.replaced ? "bg-emerald-500/5" : ""}>
                  <td className="font-mono text-slate-400">{idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-atom-500/20 ring-1 ring-atom-400/30 text-[10px] font-semibold text-atom-100">
                        {w.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div className="leading-tight">
                        <div className="text-white text-sm">{w.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {w.skill} · {w.yearsExperience}y
                          {c.replaced && (
                            <span className="ml-1 text-emerald-300">· swapped in for {c.original.name.split(" ")[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{w.zone}</span>
                      {inZone && <Pill tone="ok">in zone</Pill>}
                    </div>
                  </td>
                  <td><FatigueBar value={w.fatigue} /></td>
                  <td className="tabular-nums">{w.daysWorked}</td>
                  <td><Pill tone={cert.tone}>{cert.label}</Pill></td>
                </tr>
              );
            })}
            {effectiveCrew.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-10">
                  No matching workers in the live pool. Try allowing expiring certs or pick another task.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RecoveryCenter({
  zoneId, delayDays, setDelayDays, moveCount, setMoveCount,
  candidates, selected, recoveryDays, recoveryPct, sourceBreakdown,
}) {
  const z = ZONES.find((x) => x.id === zoneId);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-atom-300" /> Re-allocation Plan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Moving workers from healthy zones to <b className="text-slate-200">{z.name}</b>.
          </p>
        </div>
        <Pill tone={STATUS_TONE[z.status]} className="capitalize">{z.status}</Pill>
      </div>

      {/* Inputs */}
      <div className="mt-3 grid grid-cols-2 gap-3">
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
          <label className="text-[11px] uppercase tracking-wider text-slate-400">
            Workers to move — {Math.min(moveCount, candidates.length)} / {candidates.length} eligible
          </label>
          <input
            type="range" min={1} max={Math.max(1, candidates.length)}
            className="mt-3 w-full accent-atom-400"
            value={Math.min(moveCount, Math.max(1, candidates.length))}
            onChange={(e) => setMoveCount(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Outcome strip */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Outcome label="Original delay" value={`${delayDays}d`} tone="warn" />
        <Outcome label="Recovered"      value={`${recoveryDays}d`} tone="info" extra={`${recoveryPct}%`} />
        <Outcome label="Net slippage"   value={`${Math.max(0, delayDays - Number(recoveryDays)).toFixed(1)}d`} />
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
              <th>Cert</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((w) => {
              const cert = certLabel(w.cert);
              return (
                <tr key={w.id}>
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
                  <td><Pill tone={cert.tone}>{cert.label}</Pill></td>
                </tr>
              );
            })}
            {selected.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-10">
                  No eligible workers available in healthy zones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sourceBreakdown.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Sources:</span>
          {sourceBreakdown.map((s) => (
            <Pill key={s.zone} tone="info">{s.name} −{s.count}</Pill>
          ))}
        </div>
      )}
    </>
  );
}

function Outcome({ label, value, tone = "muted", extra }) {
  const cls = {
    muted: "text-white",
    info:  "text-atom-200",
    warn:  "text-amber-300",
  }[tone];
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={clsx("mt-1 text-2xl font-semibold tabular-nums", cls)}>
        {value}
        {extra && <span className="ml-1 text-xs text-slate-500">({extra})</span>}
      </div>
    </div>
  );
}
