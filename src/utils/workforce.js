import { WORKERS } from "@/data/workers";
import { ZONES } from "@/data/zones";

export function zoneById(id) {
  return ZONES.find((z) => z.id === id);
}

export function zoneName(id) {
  const z = zoneById(id);
  return z ? z.name : id;
}

// Lower score = better candidate for assignment.
// Combines fatigue, certificate freshness, and a small experience bonus.
export function candidateScore(w) {
  const certPenalty =
    w.cert.status === "expired" ? 1000 :
    w.cert.status === "expiring" ? 25 :
    0;
  const expBonus = Math.min(15, w.yearsExperience * 0.5);
  return w.fatigue + certPenalty - expBonus;
}

export function fatigueLabel(score) {
  if (score >= 75) return { label: "Critical", tone: "danger" };
  if (score >= 55) return { label: "High",     tone: "warn" };
  if (score >= 30) return { label: "Moderate", tone: "info" };
  return { label: "Low", tone: "ok" };
}

export function certLabel(cert) {
  if (cert.status === "expired") return { label: "Expired", tone: "danger" };
  if (cert.status === "expiring") return { label: `Expires in ${cert.expiresInDays}d`, tone: "warn" };
  return { label: "Valid", tone: "ok" };
}

// Smart Crew Allocation: pick best available workers for a task.
// Considers skill match, availability, valid certs, lowest fatigue.
export function suggestCrew(workers, { skill, needed, zoneId, allowExpiringCerts = false }) {
  const pool = workers
    .filter((w) => w.skill === skill)
    .filter((w) => w.available)
    .filter((w) => (allowExpiringCerts ? w.cert.status !== "expired" : w.cert.status === "valid"));

  // Prefer workers already in target zone (less travel/setup time)
  const scored = pool
    .map((w) => ({
      worker: w,
      score: candidateScore(w) + (w.zone === zoneId ? -10 : 0),
    }))
    .sort((a, b) => a.score - b.score);

  const chosen = scored.slice(0, needed).map((s) => s.worker);
  return {
    chosen,
    poolSize: pool.length,
    shortBy: Math.max(0, needed - chosen.length),
  };
}

// Workforce gap by discipline: required vs available
export function gapByDiscipline(workers, tasks) {
  const required = {};
  const available = {};
  for (const t of tasks) {
    const w = WORKERS.find((x) => x.skill === t.skill);
    const disc = w ? w.discipline : "Other";
    required[disc] = (required[disc] || 0) + t.needed;
  }
  for (const w of workers) {
    if (w.available) {
      available[w.discipline] = (available[w.discipline] || 0) + 1;
    }
  }
  const all = new Set([...Object.keys(required), ...Object.keys(available)]);
  return Array.from(all).map((d) => ({
    discipline: d,
    required: required[d] || 0,
    available: available[d] || 0,
    gap: (required[d] || 0) - (available[d] || 0),
  }));
}

// Workers eligible to be moved away from a "completed" or low-priority zone
// to help recover a delayed zone.
export function recoverySuggestions(workers, delayedZoneId) {
  const fromZones = ZONES
    .filter((z) => z.status === "complete" || z.status === "on-track")
    .map((z) => z.id);

  const movable = workers
    .filter((w) => w.available)
    .filter((w) => fromZones.includes(w.zone))
    .filter((w) => w.cert.status !== "expired")
    .filter((w) => w.fatigue < 70)
    .sort((a, b) => a.fatigue - b.fatigue);

  return movable;
}

// Per-skill required vs available (used by Dashboard alerts + Gap views)
export function gapBySkill(workers, tasks) {
  const required = {};
  tasks.forEach((t) => { required[t.skill] = (required[t.skill] || 0) + t.needed; });
  const available = {};
  workers.forEach((w) => {
    if (w.available && w.cert.status !== "expired") {
      available[w.skill] = (available[w.skill] || 0) + 1;
    }
  });
  const all = new Set([...Object.keys(required), ...Object.keys(available)]);
  return Array.from(all)
    .map((s) => ({ skill: s, required: required[s] || 0, available: available[s] || 0, gap: (required[s] || 0) - (available[s] || 0) }))
    .filter((x) => x.required > 0)
    .sort((a, b) => b.gap - a.gap);
}

// Find a fresh, in-zone replacement for a fatigued worker.
// Used by Auto-Rotate: swap workers with fatigue >= threshold for rested ones.
export function freshReplacement(workers, fatiguedWorker, excludedIds = new Set()) {
  return workers
    .filter((w) =>
      w.id !== fatiguedWorker.id &&
      !excludedIds.has(w.id) &&
      w.skill === fatiguedWorker.skill &&
      w.available &&
      w.cert.status === "valid" &&
      w.fatigue < 40
    )
    .sort((a, b) => {
      const az = a.zone === fatiguedWorker.zone ? -10 : 0;
      const bz = b.zone === fatiguedWorker.zone ? -10 : 0;
      return (a.fatigue + az) - (b.fatigue + bz);
    })[0];
}

export function downloadJSON(filename, data) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
