import { useMemo } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingDown, TrendingUp, Flag, Globe2 } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import { WORKERS } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { gapByDiscipline } from "@/utils/workforce";

export default function GapsPage() {
  const data = useMemo(() => {
    return gapByDiscipline(WORKERS, TASKS).sort((a, b) => b.required - a.required);
  }, []);

  // Per-skill detailed breakdown
  const skillData = useMemo(() => {
    const required = {};
    TASKS.forEach((t) => { required[t.skill] = (required[t.skill] || 0) + t.needed; });
    const available = {};
    WORKERS.forEach((w) => {
      if (w.available && w.cert.status !== "expired") {
        available[w.skill] = (available[w.skill] || 0) + 1;
      }
    });
    const all = new Set([...Object.keys(required), ...Object.keys(available)]);
    return Array.from(all)
      .map((s) => ({ skill: s, required: required[s] || 0, available: available[s] || 0, gap: (required[s] || 0) - (available[s] || 0) }))
      .filter((x) => x.required > 0)
      .sort((a, b) => b.gap - a.gap);
  }, []);

  // Local vs foreign breakdown — premium feature
  const local = WORKERS.filter((w) => w.origin === "local").length;
  const foreign = WORKERS.length - local;
  const localPct = Math.round((local / WORKERS.length) * 100);

  return (
    <>
      <PageHeader
        title="Workforce Gap Analysis"
        subtitle="Compare required headcount against the available, certified, on-site workforce."
      />

      {/* Discipline level */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Required vs Available — by Discipline</h3>
            <p className="text-xs text-slate-400">Civil, Mechanical, Electrical, I&amp;C, Safety</p>
          </div>
          <Pill tone="muted">All zones</Pill>
        </div>
        <div className="mt-3 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="discipline" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="required"  name="Required"  fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="available" name="Available" fill="#22d3ee" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
          {data.map((d) => (
            <div key={d.discipline} className="rounded-lg border border-white/10 p-3">
              <div className="text-xs uppercase tracking-wider text-slate-400">{d.discipline}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-semibold text-white tabular-nums">
                  {d.available}<span className="text-slate-500">/{d.required}</span>
                </span>
                {d.gap > 0 ? (
                  <Pill tone="danger"><TrendingDown className="h-3 w-3" />-{d.gap}</Pill>
                ) : (
                  <Pill tone="ok"><TrendingUp className="h-3 w-3" />+{Math.abs(d.gap)}</Pill>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Skill-level Gap</h3>
          <p className="text-xs text-slate-400">Bottom = highest shortage. Excludes expired-cert workers.</p>
          <div className="mt-3 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis dataKey="skill" type="category" tickLine={false} axisLine={false} fontSize={11} width={140} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="required"  name="Required"  fill="#f59e0b" radius={[0,4,4,0]} />
                <Bar dataKey="available" name="Available" fill="#22d3ee" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium: Kazakhstan localization */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flag className="h-4 w-4 text-atom-300" /> Local Content — KZ
          </h3>
          <p className="text-xs text-slate-400">Local workforce vs foreign contractors</p>

          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Local (Kazakhstan)", value: local, color: "#22d3ee" },
                    { name: "Foreign Contractor", value: foreign, color: "#f472b6" },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="rgba(0,0,0,0.5)"
                >
                  <Cell fill="#22d3ee" />
                  <Cell fill="#f472b6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-atom-500/30 bg-atom-500/5 p-3 text-center">
            <div className="text-3xl font-semibold text-atom-200 tabular-nums">{localPct}%</div>
            <div className="text-xs text-slate-400">Local Kazakhstan content</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="rounded bg-white/5 py-1.5">
                <span className="text-atom-300 font-semibold">{local}</span> local
              </div>
              <div className="rounded bg-white/5 py-1.5">
                <span className="text-pink-300 font-semibold">{foreign}</span> foreign
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Globe2 className="h-3 w-3" /> Target: ≥80% per state programme
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
