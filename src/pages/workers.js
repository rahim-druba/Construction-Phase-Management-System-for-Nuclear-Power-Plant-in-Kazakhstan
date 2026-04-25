import { useMemo, useState } from "react";
import { Search, Download, Filter } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import FatigueBar from "@/components/FatigueBar";
import { WORKERS, SKILL_LIST } from "@/data/workers";
import { ZONES } from "@/data/zones";
import { useLang } from "@/utils/i18n";
import { certLabel, downloadJSON, zoneName } from "@/utils/workforce";

export default function WorkersPage() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [zone, setZone] = useState("");
  const [availability, setAvailability] = useState("");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return WORKERS.filter((w) => {
      if (skill && w.skill !== skill) return false;
      if (zone && w.zone !== zone) return false;
      if (availability === "yes" && !w.available) return false;
      if (availability === "no" && w.available) return false;
      if (ql) {
        const hay = `${w.name} ${w.skill} ${w.employeeId} ${zoneName(w.zone)}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [q, skill, zone, availability]);

  return (
    <>
      <PageHeader
        title={t("workers.title")}
        subtitle={`${filtered.length} / ${WORKERS.length} ${t("workers.subtitle").toLowerCase()}`}
        right={
          <button
            onClick={() => downloadJSON("workers.json", filtered)}
            className="btn-ghost"
          >
            <Download className="h-4 w-4" /> {t("common.export")}
          </button>
        }
      />

      <div className="card p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`${t("common.search")} name, ID, skill…`}
              className="input pl-8"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="h-4 w-4" />
            <span>{t("common.filter")}:</span>
          </div>

          <select className="input !w-auto" value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="">{t("common.all")} skills</option>
            {SKILL_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="input !w-auto" value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">{t("common.all")} zones</option>
            {ZONES.map((z) => <option key={z.id} value={z.id}>{z.id} — {z.name}</option>)}
          </select>

          <select className="input !w-auto" value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="">{t("common.all")}</option>
            <option value="yes">{t("common.available")}</option>
            <option value="no">{t("common.unavailable")}</option>
          </select>

          {(q || skill || zone || availability) && (
            <button
              className="btn-ghost"
              onClick={() => { setQ(""); setSkill(""); setZone(""); setAvailability(""); }}
            >
              {t("common.reset")}
            </button>
          )}
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="max-h-[68vh] overflow-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>{t("workers.cols.name")}</th>
                <th>{t("workers.cols.skill")}</th>
                <th>{t("workers.cols.zone")}</th>
                <th>{t("workers.cols.shift")}</th>
                <th>{t("workers.cols.availability")}</th>
                <th>{t("workers.cols.days")}</th>
                <th>{t("workers.cols.fatigue")}</th>
                <th>{t("workers.cols.cert")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => {
                const cert = certLabel(w.cert);
                return (
                  <tr key={w.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-atom-500/40 to-atom-700/40 ring-1 ring-atom-400/30 text-xs font-semibold text-atom-100">
                          {w.name.split(" ").map((n) => n[0]).join("").slice(0,2)}
                        </div>
                        <div className="leading-tight">
                          <div className="font-medium text-white">{w.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{w.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-slate-100">{w.skill}</div>
                      <div className="text-[11px] text-slate-500">{w.discipline}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-300">{w.zone}</span>
                      <span className="ml-1 text-xs text-slate-500">· {zoneName(w.zone)}</span>
                    </td>
                    <td>
                      <Pill
                        tone={w.shift === "day" ? "info" : w.shift === "night" ? "muted" : "muted"}
                        dot
                      >
                        {w.shift === "day" ? t("common.day") : w.shift === "night" ? t("common.night") : t("common.off")}
                      </Pill>
                    </td>
                    <td>
                      {w.available
                        ? <Pill tone="ok"     dot>{t("common.available")}</Pill>
                        : <Pill tone="muted"  dot>{t("common.unavailable")}</Pill>}
                    </td>
                    <td className="tabular-nums">
                      <span className={w.daysWorked >= 7 ? "text-amber-300 font-semibold" : "text-slate-200"}>
                        {w.daysWorked}
                      </span>
                    </td>
                    <td><FatigueBar value={w.fatigue} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Pill tone={cert.tone}>{cert.label}</Pill>
                        <span className="text-[11px] text-slate-500">{w.cert.name}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center text-slate-500 py-12">No workers match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
