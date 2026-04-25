import { useMemo } from "react";
import {
  Users, UserCheck, AlertTriangle, ShieldAlert, Wrench, MapPin, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Pill from "@/components/Pill";
import { WORKERS } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { ZONES } from "@/data/zones";
import { gapByDiscipline, zoneName } from "@/utils/workforce";
import { useLang } from "@/utils/i18n";

const PIE_COLORS = ["#22d3ee", "#60a5fa", "#a78bfa", "#f59e0b", "#10b981", "#ef4444", "#f472b6", "#94a3b8"];

export default function Dashboard() {
  const { t } = useLang();

  const stats = useMemo(() => {
    const total = WORKERS.length;
    const available = WORKERS.filter((w) => w.available).length;
    const fatigue = WORKERS.filter((w) => w.fatigue >= 70 || w.daysWorked >= 7).length;
    const expiring = WORKERS.filter((w) => w.cert.status === "expiring" || w.cert.status === "expired").length;
    const gaps = gapByDiscipline(WORKERS, TASKS);
    const shortages = gaps.filter((g) => g.gap > 0).length;
    return { total, available, fatigue, expiring, shortages, gaps };
  }, []);

  const zoneData = useMemo(() => {
    return ZONES.map((z) => {
      const onSite = WORKERS.filter((w) => w.zone === z.id).length;
      const here = WORKERS.filter((w) => w.zone === z.id && w.available).length;
      return { zone: z.id, name: z.name, onSite, available: here, progress: z.progress, status: z.status };
    });
  }, []);

  const skillMix = useMemo(() => {
    const m = {};
    WORKERS.forEach((w) => {
      m[w.discipline] = (m[w.discipline] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  const trend = useMemo(() => {
    // Synthetic 14-day staffing trend
    const base = stats.available;
    return Array.from({ length: 14 }, (_, i) => ({
      day: `D-${13 - i}`,
      available: Math.max(40, Math.round(base + Math.sin(i / 1.6) * 6 + (i % 3 === 0 ? -3 : 1))),
      required:  Math.max(50, Math.round(base + 6 + Math.cos(i / 2) * 4)),
    }));
  }, [stats.available]);

  const criticalAlerts = useMemo(() => {
    const expired = WORKERS.filter((w) => w.cert.status === "expired").slice(0, 3);
    const burned  = WORKERS.filter((w) => w.daysWorked >= 9).slice(0, 3);
    const delayedZones = ZONES.filter((z) => z.status === "delayed");
    return { expired, burned, delayedZones };
  }, []);

  return (
    <>
      <PageHeader
        title={t("dash.title")}
        subtitle={t("dash.subtitle")}
        right={
          <>
            <Pill tone="info" dot>{t("common.live")}</Pill>
            <Link href="/assignments" className="btn-primary">
              <Wrench className="h-4 w-4" />
              {t("nav.assignments")}
            </Link>
          </>
        }
      />

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label={t("dash.kpi.total")}          value={stats.total}     sub="On the roster"      icon={Users}        tone="info"   trend="+2" />
        <StatCard label={t("dash.kpi.availableToday")} value={stats.available} sub="Cleared for shift"  icon={UserCheck}    tone="ok"     trend="+5" />
        <StatCard label={t("dash.kpi.fatigue")}        value={stats.fatigue}   sub=">7 days or high"    icon={AlertTriangle} tone="warn"  trend="+3" />
        <StatCard label={t("dash.kpi.shortages")}      value={stats.shortages} sub="Disciplines short"  icon={Wrench}       tone="danger" trend="-1" />
        <StatCard label={t("dash.kpi.expiring")}       value={stats.expiring}  sub="Within 30 days"     icon={ShieldAlert}  tone="warn"   trend="+2" />
      </div>

      {/* MAIN GRID */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Required vs Available trend */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Staffing — Required vs Available</h3>
              <p className="text-xs text-slate-400">Last 14 days · all disciplines</p>
            </div>
            <Pill tone="muted">14d</Pill>
          </div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAvail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="required"  stroke="#f59e0b" strokeWidth={2} fill="url(#gReq)" />
                <Area type="monotone" dataKey="available" stroke="#22d3ee" strokeWidth={2} fill="url(#gAvail)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Discipline mix */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white">Discipline Mix</h3>
          <p className="text-xs text-slate-400">Active workforce by discipline</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={2}
                  stroke="rgba(0,0,0,0.4)"
                >
                  {skillMix.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zones overview */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Zone Coverage</h3>
              <p className="text-xs text-slate-400">Workers on site by construction zone</p>
            </div>
            <Link href="/gaps" className="text-xs text-atom-300 hover:text-atom-200 inline-flex items-center gap-1">
              View gap analysis <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} barGap={4}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="zone" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip
                  formatter={(v, k) => [v, k === "onSite" ? "On site" : "Available"]}
                  labelFormatter={(l) => `Zone ${l} — ${zoneName(l)}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="onSite"    name="On site"   fill="#1f2937" radius={[4,4,0,0]} />
                <Bar dataKey="available" name="Available" fill="#22d3ee" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical alerts side panel */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white">Critical Alerts</h3>
          <p className="text-xs text-slate-400">Items needing decision today</p>

          <div className="mt-3 space-y-3 text-sm">
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-2 text-rose-200 font-semibold text-xs">
                <ShieldAlert className="h-4 w-4" /> Expired Certificates ({criticalAlerts.expired.length})
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {criticalAlerts.expired.length === 0 && <li className="text-slate-500">None — clean.</li>}
                {criticalAlerts.expired.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{w.name} <span className="text-slate-500">· {w.skill}</span></span>
                    <Pill tone="danger">{w.cert.expiresInDays}d</Pill>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-amber-200 font-semibold text-xs">
                <AlertTriangle className="h-4 w-4" /> Fatigue Watchlist ({criticalAlerts.burned.length})
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {criticalAlerts.burned.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{w.name} <span className="text-slate-500">· {w.skill}</span></span>
                    <Pill tone="warn">{w.daysWorked}d straight</Pill>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-atom-500/20 bg-atom-500/5 p-3">
              <div className="flex items-center gap-2 text-atom-200 font-semibold text-xs">
                <MapPin className="h-4 w-4" /> Delayed Zones
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {criticalAlerts.delayedZones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{z.name}</span>
                    <Link href={`/recovery?zone=${z.id}`} className="text-atom-300 hover:text-atom-200 inline-flex items-center gap-1">
                      Recover <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
