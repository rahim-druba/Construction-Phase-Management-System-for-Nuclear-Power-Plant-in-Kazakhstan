import { useMemo, useState } from "react";
import { Wrench, Sparkles, MapPin, Clock, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import FatigueBar from "@/components/FatigueBar";
import { WORKERS, SKILL_LIST } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { ZONES } from "@/data/zones";
import { suggestCrew, certLabel, zoneName } from "@/utils/workforce";
import { useLang } from "@/utils/i18n";

const PRIORITY_TONES = { critical: "danger", high: "warn", medium: "info" };

export default function AssignmentsPage() {
  const { t } = useLang();
  const [selectedTaskId, setSelectedTaskId] = useState(TASKS[0].id);

  // Custom override controls — for live demo
  const [customSkill, setCustomSkill] = useState("");
  const [customNeeded, setCustomNeeded] = useState("");
  const [customZone, setCustomZone] = useState("");
  const [allowExpiring, setAllowExpiring] = useState(false);

  // Track of "assigned" workers across the session (frontend-only)
  const [assignedIds, setAssignedIds] = useState(new Set());

  const selectedTask = TASKS.find((x) => x.id === selectedTaskId);

  const effective = useMemo(() => ({
    skill:  customSkill  || selectedTask.skill,
    needed: Number(customNeeded) > 0 ? Number(customNeeded) : selectedTask.needed,
    zoneId: customZone   || selectedTask.zoneId,
  }), [customSkill, customNeeded, customZone, selectedTask]);

  // Workers not yet assigned in this session
  const liveWorkers = useMemo(
    () => WORKERS.map((w) => ({ ...w, available: w.available && !assignedIds.has(w.id) })),
    [assignedIds]
  );

  const result = useMemo(
    () => suggestCrew(liveWorkers, { ...effective, allowExpiringCerts: allowExpiring }),
    [liveWorkers, effective, allowExpiring]
  );

  function commitAssignment() {
    const next = new Set(assignedIds);
    result.chosen.forEach((w) => next.add(w.id));
    setAssignedIds(next);
  }
  function reset() {
    setAssignedIds(new Set());
  }

  return (
    <>
      <PageHeader
        title="Smart Crew Allocation"
        subtitle="Auto-suggest the best available crew based on skill, certification, fatigue, and zone proximity."
        right={
          <>
            {assignedIds.size > 0 && (
              <button onClick={reset} className="btn-ghost">
                <RotateCcw className="h-4 w-4" /> {t("common.reset")} ({assignedIds.size})
              </button>
            )}
            <Pill tone="info" dot>AI-assisted</Pill>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task list */}
        <div className="card p-3 lg:col-span-1">
          <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Active Tasks
          </div>
          <ul className="space-y-1">
            {TASKS.map((task) => {
              const isActive = task.id === selectedTaskId;
              return (
                <li key={task.id}>
                  <button
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setCustomSkill(""); setCustomNeeded(""); setCustomZone("");
                    }}
                    className={
                      "group w-full text-left rounded-lg px-3 py-2.5 transition-colors border " +
                      (isActive
                        ? "border-atom-500/40 bg-atom-500/10"
                        : "border-transparent hover:bg-white/5 hover:border-white/10")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{task.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono">{task.id}</span>
                          <span className="text-slate-600">·</span>
                          <span><Wrench className="inline h-3 w-3 mr-0.5" />{task.skill}</span>
                          <span className="text-slate-600">·</span>
                          <span><MapPin className="inline h-3 w-3 mr-0.5" />{zoneName(task.zoneId)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Pill tone={PRIORITY_TONES[task.priority]} className="capitalize">{task.priority}</Pill>
                        <span className="text-[10px] text-slate-500"><Clock className="inline h-3 w-3 mr-0.5" />{task.deadlineDays}d</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Needs <span className="text-white font-semibold">{task.needed}</span> workers</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Allocation panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inputs */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-atom-300" /> Allocation Inputs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Override the task or run a custom query.</p>
              </div>
              <Pill tone="muted">{selectedTask.id}</Pill>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400">Skill</label>
                <select
                  className="input mt-1"
                  value={customSkill || selectedTask.skill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                >
                  {SKILL_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400">Workers Needed</label>
                <input
                  type="number"
                  min={1}
                  className="input mt-1"
                  value={customNeeded || selectedTask.needed}
                  onChange={(e) => setCustomNeeded(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400">Location / Zone</label>
                <select
                  className="input mt-1"
                  value={customZone || selectedTask.zoneId}
                  onChange={(e) => setCustomZone(e.target.value)}
                >
                  {ZONES.map((z) => <option key={z.id} value={z.id}>{z.id} — {z.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400">Cert Policy</label>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowExpiring}
                    onChange={(e) => setAllowExpiring(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-atom-500 focus:ring-atom-500"
                  />
                  Allow expiring certs
                </label>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Suggested Crew</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by fatigue, certification, and zone proximity.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result.shortBy > 0 ? (
                  <Pill tone="danger" dot>
                    <AlertTriangle className="h-3 w-3" /> Short by {result.shortBy}
                  </Pill>
                ) : (
                  <Pill tone="ok" dot>
                    <CheckCircle2 className="h-3 w-3" /> Fully staffed
                  </Pill>
                )}
                <span className="text-xs text-slate-400">Pool: {result.poolSize}</span>
                <button
                  className="btn-primary"
                  disabled={result.chosen.length === 0}
                  onClick={commitAssignment}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t("common.assign")} {result.chosen.length}
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Worker</th>
                    <th>Zone</th>
                    <th>Fatigue</th>
                    <th>Days</th>
                    <th>Cert</th>
                    <th>Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {result.chosen.map((w, idx) => {
                    const cert = certLabel(w.cert);
                    const inZone = w.zone === effective.zoneId;
                    return (
                      <tr key={w.id}>
                        <td className="font-mono text-slate-400">{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="grid h-7 w-7 place-items-center rounded-full bg-atom-500/20 ring-1 ring-atom-400/30 text-[10px] font-semibold text-atom-100">
                              {w.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                            </div>
                            <div className="leading-tight">
                              <div className="text-white text-sm">{w.name}</div>
                              <div className="text-[11px] text-slate-500">{w.skill} · {w.yearsExperience}y exp</div>
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
                        <td><Pill tone="muted" dot className="capitalize">{w.shift}</Pill></td>
                      </tr>
                    );
                  })}
                  {result.chosen.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-slate-500 py-10">
                        No workers match the current criteria. Try relaxing the cert policy or pick another skill.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {assignedIds.size > 0 && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {assignedIds.size} workers assigned in this session. They are excluded from future suggestions.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
