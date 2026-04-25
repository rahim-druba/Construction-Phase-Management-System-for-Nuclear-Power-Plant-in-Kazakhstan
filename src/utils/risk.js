// Atomforce — Predictive Analytics Engine (rule-based, demo mode).
//
// We do NOT claim deep learning. This is rule-based decision support:
// "Predicts workforce bottlenecks before they become delays."
//
// Three polished predictions for the next 7 operating days:
//   1. Labor Shortage Risk  — needed > available certified, weighted by deadline urgency
//   2. Fatigue Error Risk   — share of crew above safety thresholds (7 days / fatigue 70+)
//   3. Schedule Delay Risk  — task-level probability driven by gap × priority × deadline
//
// Each prediction returns the same shape so the UI can render them generically.

import { WORKERS } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { ZONES } from "@/data/zones";
import { zoneName } from "@/utils/workforce";

const FATIGUE_THRESHOLD = 70;
const CONSECUTIVE_DAYS_LIMIT = 7;
const FORECAST_HORIZON_DAYS = 7;

const PRIORITY_BONUS = { critical: 22, high: 12, medium: 4, low: 0 };

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function severityFromProbability(p) {
  if (p >= 75) return "critical";
  if (p >= 55) return "high";
  if (p >= 35) return "medium";
  return "low";
}

export function severityTone(sev) {
  switch (sev) {
    case "critical": return "danger";
    case "high":     return "warn";
    case "medium":   return "info";
    default:         return "ok";
  }
}

// =================================================================
// 1) LABOR SHORTAGE RISK
// =================================================================
function laborShortageRisk(workers, tasks) {
  // Per-skill required vs available (valid certs, available now)
  const required = {};
  const available = {};
  const worstByTask = []; // for headline pick

  tasks.forEach((t) => {
    if (t.deadlineDays > FORECAST_HORIZON_DAYS) return;
    required[t.skill] = (required[t.skill] || 0) + t.needed;
  });
  workers.forEach((w) => {
    if (w.available && w.cert.status !== "expired") {
      available[w.skill] = (available[w.skill] || 0) + 1;
    }
  });

  tasks.forEach((t) => {
    if (t.deadlineDays > FORECAST_HORIZON_DAYS) return;
    const have = available[t.skill] || 0;
    const gap = Math.max(0, t.needed - have);
    if (gap <= 0) return;
    const urgency = (FORECAST_HORIZON_DAYS - t.deadlineDays) + 1; // 1..7
    worstByTask.push({ task: t, gap, urgency, score: gap * urgency });
  });
  worstByTask.sort((a, b) => b.score - a.score);

  const totalGap = worstByTask.reduce((s, x) => s + x.gap, 0);
  const top = worstByTask[0];

  // Probability ramps up sharply with gap and urgency
  const probability = top
    ? clamp(35 + top.gap * 6 + top.urgency * 3, 18, 92)
    : 18;

  // Post-mitigation: transfers + requisition typically resolves ~65%
  const postProbability = top
    ? clamp(Math.round(probability * 0.32), 8, 35)
    : probability;

  const headline = top
    ? `${zoneName(top.task.zoneId)} likely short ${top.gap} certified ${top.task.skill}${top.gap === 1 ? "" : "s"} within ${top.task.deadlineDays} day${top.task.deadlineDays === 1 ? "" : "s"}.`
    : "Workforce supply meets all upcoming task requirements.";

  // Suggest a healthy source zone with the largest pool of that skill
  let sourceZone = null;
  if (top) {
    const buckets = {};
    workers.forEach((w) => {
      if (w.skill === top.task.skill && w.available && w.cert.status === "valid" && w.zone !== top.task.zoneId) {
        buckets[w.zone] = (buckets[w.zone] || 0) + 1;
      }
    });
    const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    if (entries.length) sourceZone = { id: entries[0][0], count: entries[0][1] };
  }

  const transferCount = top ? Math.min(top.gap, sourceZone ? sourceZone.count : top.gap) : 0;
  const recommendation = top
    ? sourceZone && transferCount > 0
      ? `Transfer ${transferCount} ${top.task.skill}${transferCount === 1 ? "" : "s"} from ${zoneName(sourceZone.id)} · post requisition for the rest.`
      : `Activate hiring requisition + cross-zone search for ${top.task.skill}.`
    : "Maintain current allocation.";

  return {
    id: "risk-shortage",
    kind: "shortage",
    title: "Labor Shortage Risk",
    headline,
    probability: Math.round(probability),
    postProbability: Math.round(postProbability),
    severity: severityFromProbability(probability),
    basis: "Based on 14-day staffing trend · upcoming task pipeline · certification expiry schedule",
    causes: top
      ? [
          `${top.task.needed} ${top.task.skill}s required by T-${top.task.deadlineDays}d`,
          `Only ${available[top.task.skill] || 0} certified ${top.task.skill}s available`,
          `${totalGap} total skill-positions short across ${worstByTask.length} task${worstByTask.length === 1 ? "" : "s"}`,
        ]
      : ["No critical gaps detected in 7-day horizon"],
    recommendation,
    resolveLabel: "Resolve · Transfer + Recruit",
    resolveSummary: top
      ? `Transferred ${transferCount} from ${sourceZone ? zoneName(sourceZone.id) : "site pool"} · requisition opened`
      : "No action required",
    goto: top ? `/control?mode=task` : null,
  };
}

// =================================================================
// 2) FATIGUE ERROR RISK
// =================================================================
function fatigueRisk(workers) {
  const active = workers.filter((w) => w.shift !== "off");
  const flaggedDays   = active.filter((w) => w.daysWorked >= CONSECUTIVE_DAYS_LIMIT).length;
  const flaggedFatig  = active.filter((w) => w.fatigue >= FATIGUE_THRESHOLD).length;
  const nightHeavy    = active.filter((w) => w.shift === "night" && w.daysWorked >= 5).length;

  // Combined exposure share
  const flaggedAny = active.filter((w) => w.daysWorked >= CONSECUTIVE_DAYS_LIMIT || w.fatigue >= FATIGUE_THRESHOLD).length;
  const share = active.length === 0 ? 0 : (flaggedAny / active.length) * 100;

  // Probability: scale share, add bonus for night-shift overload
  const probability = clamp(15 + share * 1.6 + Math.min(15, nightHeavy * 0.3), 15, 90);

  // Post-mitigation: scheduling 2-day rest for flagged ≈ -60%
  const postProbability = clamp(Math.round(probability * 0.38), 10, 35);

  // Identify worst-affected discipline for headline color
  const buckets = {};
  active.forEach((w) => {
    if (w.daysWorked >= CONSECUTIVE_DAYS_LIMIT || w.fatigue >= FATIGUE_THRESHOLD) {
      buckets[w.discipline] = (buckets[w.discipline] || 0) + 1;
    }
  });
  const worstDisc = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];

  const headline = flaggedAny > 0
    ? `${flaggedAny} worker${flaggedAny === 1 ? "" : "s"} crossing safety thresholds${worstDisc ? ` — ${worstDisc[0]} crews most exposed` : ""}.`
    : "All crews within safe rotation parameters.";

  return {
    id: "risk-fatigue",
    kind: "fatigue",
    title: "Crew Fatigue Risk",
    headline,
    probability: Math.round(probability),
    postProbability: Math.round(postProbability),
    severity: severityFromProbability(probability),
    basis: "Using fatigue threshold model · 7-day rotation policy · overtime tracking",
    causes: [
      `${flaggedDays} worker${flaggedDays === 1 ? "" : "s"} on duty ${CONSECUTIVE_DAYS_LIMIT}+ consecutive days`,
      `${flaggedFatig} worker${flaggedFatig === 1 ? "" : "s"} above fatigue index ${FATIGUE_THRESHOLD}`,
      `${nightHeavy} on extended night-shift streak`,
    ],
    recommendation: flaggedAny > 0
      ? `Auto-rotate ${flaggedAny} flagged worker${flaggedAny === 1 ? "" : "s"} → mandatory 2-day rest · backfill from rested pool.`
      : "Maintain current rotation cadence.",
    resolveLabel: "Resolve · Auto-Rotate Crews",
    resolveSummary: `${flaggedAny} flagged worker${flaggedAny === 1 ? "" : "s"} scheduled for rest · rested substitutes assigned`,
    goto: flaggedAny > 0 ? `/control?mode=rotation` : null,
  };
}

// =================================================================
// 3) SCHEDULE DELAY RISK (per-task, headline = worst)
// =================================================================
function delayRisk(workers, tasks) {
  const available = {};
  workers.forEach((w) => {
    if (w.available && w.cert.status !== "expired") {
      available[w.skill] = (available[w.skill] || 0) + 1;
    }
  });

  const scored = tasks
    .filter((t) => t.deadlineDays <= FORECAST_HORIZON_DAYS)
    .map((t) => {
      const have = available[t.skill] || 0;
      const gap = Math.max(0, t.needed - have);
      const gapRatio = t.needed === 0 ? 0 : gap / t.needed;
      const priorityB = PRIORITY_BONUS[t.priority] || 0;
      const deadlineB = (FORECAST_HORIZON_DAYS - t.deadlineDays) * 4; // closer = riskier
      const p = 18 + gapRatio * 55 + priorityB + deadlineB;
      return { task: t, gap, p: clamp(p, 12, 92) };
    })
    .sort((a, b) => b.p - a.p);

  const top = scored[0];
  const probability = top ? top.p : 12;
  // Reallocation typically pulls delay risk down by 55-65%
  const postProbability = top ? clamp(Math.round(probability * 0.36), 10, 38) : probability;

  // Estimated slip vs recovered slip (in days), demo-tuned
  const slipDays = top ? clamp(0.5 + top.gap * 0.5 + (top.task.priority === "critical" ? 1 : 0), 0.5, 4) : 0;
  const recoveredSlip = +(slipDays * 0.55).toFixed(1);

  const headline = top
    ? `${top.task.title} (${zoneName(top.task.zoneId)}) — ${Math.round(probability)}% probability of ${slipDays.toFixed(1)}-day slip.`
    : "All tasks tracking within tolerance.";

  return {
    id: "risk-delay",
    kind: "delay",
    title: "Schedule Delay Risk",
    headline,
    probability: Math.round(probability),
    postProbability: Math.round(postProbability),
    severity: severityFromProbability(probability),
    basis: "Using task dependency forecast · workforce gap model · deadline proximity",
    causes: top
      ? [
          `Workforce gap: ${top.gap} ${top.task.skill}${top.gap === 1 ? "" : "s"} missing`,
          `Priority: ${top.task.priority} · deadline T-${top.task.deadlineDays}d`,
          `Estimated slip: ${slipDays.toFixed(1)} day${slipDays === 1 ? "" : "s"} if uncorrected`,
        ]
      : ["No high-risk overlaps detected"],
    recommendation: top
      ? `Reallocate ${Math.max(2, top.gap)} ${top.task.skill}${top.gap === 1 ? "" : "s"} from healthy zones — projected recovery ~${recoveredSlip}d.`
      : "Continue scheduled execution.",
    resolveLabel: "Resolve · Reallocate Workers",
    resolveSummary: top
      ? `${Math.max(2, top.gap)} workers reallocated · ${recoveredSlip}d recovered of ${slipDays.toFixed(1)}d slip`
      : "No action required",
    goto: top ? `/control?mode=recovery&zone=${top.task.zoneId}` : null,
    extra: top ? { taskId: top.task.id, zoneId: top.task.zoneId, slipDays, recoveredSlip } : null,
  };
}

// =================================================================
// PUBLIC API
// =================================================================
export function predictRisks({ workers = WORKERS, tasks = TASKS } = {}) {
  return [
    laborShortageRisk(workers, tasks),
    fatigueRisk(workers),
    delayRisk(workers, tasks),
  ];
}

// Per-zone risk snapshot used by the Control Center "Predict Risks" mini-card.
export function predictZoneRisks(zoneId, { workers = WORKERS, tasks = TASKS } = {}) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) return [];

  const zoneTasks = tasks.filter((t) => t.zoneId === zoneId);
  const zoneWorkers = workers.filter((w) => w.zone === zoneId);

  // Shortage in this zone
  const shortageCounts = zoneTasks.map((t) => {
    const have = zoneWorkers.filter((w) => w.skill === t.skill && w.available && w.cert.status === "valid").length;
    return { skill: t.skill, gap: Math.max(0, t.needed - have), urgency: t.deadlineDays };
  }).filter((x) => x.gap > 0).sort((a, b) => b.gap - a.gap);

  const shortageProb = shortageCounts.length === 0
    ? 18
    : clamp(35 + shortageCounts[0].gap * 8 + (FORECAST_HORIZON_DAYS - shortageCounts[0].urgency) * 3, 25, 90);

  // Fatigue in this zone
  const flagged = zoneWorkers.filter((w) => w.daysWorked >= CONSECUTIVE_DAYS_LIMIT || w.fatigue >= FATIGUE_THRESHOLD).length;
  const fatigueShare = zoneWorkers.length === 0 ? 0 : (flagged / zoneWorkers.length) * 100;
  const fatigueProb = clamp(15 + fatigueShare * 1.7, 15, 88);

  // Delay risk for this zone (worst task)
  const taskScores = zoneTasks
    .filter((t) => t.deadlineDays <= FORECAST_HORIZON_DAYS)
    .map((t) => {
      const have = zoneWorkers.filter((w) => w.skill === t.skill && w.available && w.cert.status === "valid").length;
      const gap = Math.max(0, t.needed - have);
      const gapRatio = t.needed === 0 ? 0 : gap / t.needed;
      return { task: t, p: clamp(20 + gapRatio * 55 + (PRIORITY_BONUS[t.priority] || 0) + (FORECAST_HORIZON_DAYS - t.deadlineDays) * 4, 15, 92) };
    })
    .sort((a, b) => b.p - a.p);
  const delayProb = taskScores[0] ? taskScores[0].p : 18;

  return [
    {
      id: `${zoneId}-shortage`,
      kind: "shortage",
      label: "Shortage",
      probability: Math.round(shortageProb),
      severity: severityFromProbability(shortageProb),
      detail: shortageCounts.length > 0
        ? `Short ${shortageCounts[0].gap} ${shortageCounts[0].skill}${shortageCounts[0].gap === 1 ? "" : "s"}`
        : "Within capacity",
    },
    {
      id: `${zoneId}-fatigue`,
      kind: "fatigue",
      label: "Fatigue",
      probability: Math.round(fatigueProb),
      severity: severityFromProbability(fatigueProb),
      detail: `${flagged} of ${zoneWorkers.length} flagged`,
    },
    {
      id: `${zoneId}-delay`,
      kind: "delay",
      label: "Delay",
      probability: Math.round(delayProb),
      severity: severityFromProbability(delayProb),
      detail: taskScores[0] ? `${taskScores[0].task.title.slice(0, 28)}` : "On schedule",
    },
  ];
}
