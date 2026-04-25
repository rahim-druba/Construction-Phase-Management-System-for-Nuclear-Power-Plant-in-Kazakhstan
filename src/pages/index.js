import { useMemo } from "react";
import Link from "next/link";
import {
  Users, UserCheck, AlertTriangle, ShieldAlert, Wrench, MapPin, ArrowUpRight,
  Flag, Cpu, ShieldX, UserPlus, GraduationCap, CalendarRange, ClipboardList,
  Briefcase, BarChart3, Activity, Award,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import clsx from "clsx";

import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Pill from "@/components/Pill";
import { WORKERS } from "@/data/workers";
import { TASKS } from "@/data/tasks";
import { ZONES } from "@/data/zones";
import { OPEN_POSITIONS, RECENT_HIRES, HIRING_TREND } from "@/data/recruitment";
import { gapByDiscipline, gapBySkill, zoneName } from "@/utils/workforce";
import { useLang } from "@/utils/i18n";

const DISC_COLORS = ["#22d3ee", "#60a5fa", "#a78bfa", "#f59e0b", "#10b981", "#ef4444", "#f472b6", "#94a3b8"];

export default function Dashboard() {
  const { t } = useLang();

  const stats = useMemo(() => {
    const total = WORKERS.length;
    const available = WORKERS.filter((w) => w.available).length;
    const fatigue = WORKERS.filter((w) => w.fatigue >= 70 || w.daysWorked >= 7).length;
    const expiring = WORKERS.filter((w) => w.cert.status === "expiring" || w.cert.status === "expired").length;
    const expired = WORKERS.filter((w) => w.cert.status === "expired").length;
    const skillGaps = gapBySkill(WORKERS, TASKS);
    const shortages = skillGaps.filter((g) => g.gap > 0).length;
    const discGaps = gapByDiscipline(WORKERS, TASKS);
    return { total, available, fatigue, expiring, expired, shortages, skillGaps, discGaps };
  }, []);

  const zoneData = useMemo(() => {
    return ZONES.map((z) => {
      const onSite = WORKERS.filter((w) => w.zone === z.id).length;
      const here = WORKERS.filter((w) => w.zone === z.id && w.available).length;
      return { zone: z.id, name: z.name, onSite, available: here, status: z.status };
    });
  }, []);

  const skillMix = useMemo(() => {
    const m = {};
    WORKERS.forEach((w) => { m[w.discipline] = (m[w.discipline] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);

  const trend = useMemo(() => {
    const base = stats.available;
    return Array.from({ length: 14 }, (_, i) => ({
      day: `D-${13 - i}`,
      available: Math.max(40, Math.round(base + Math.sin(i / 1.6) * 12 + (i % 3 === 0 ? -6 : 2))),
      required:  Math.max(50, Math.round(base + 14 + Math.cos(i / 2) * 8)),
    }));
  }, [stats.available]);

  // Local KZ vs foreign (premium)
  const local   = WORKERS.filter((w) => w.origin === "local").length;
  const foreign = WORKERS.length - local;
  const localPct = Math.round((local / WORKERS.length) * 100);

  // Alerts
  const topShortages = stats.skillGaps.filter((g) => g.gap > 0).slice(0, 3);
  const delayedZones = ZONES.filter((z) => z.status === "delayed" || z.status === "at-risk");
  const urgentCerts  = WORKERS
    .filter((w) => w.cert.status === "expired" || w.cert.status === "expiring")
    .sort((a, b) => a.cert.expiresInDays - b.cert.expiresInDays)
    .slice(0, 4);

  // ==== Recruitment / Onboarding ====
  const totalOpen      = OPEN_POSITIONS.reduce((s, p) => s + p.needed, 0);
  const totalApplicants= OPEN_POSITIONS.reduce((s, p) => s + p.applicants, 0);
  const avgTimeToFill  = Math.round(OPEN_POSITIONS.reduce((s, p) => s + p.daysOpen, 0) / OPEN_POSITIONS.length);
  const criticalOpen   = OPEN_POSITIONS.filter((p) => p.urgency === "critical").length;
  const onboarding     = RECENT_HIRES.filter((h) => h.onboardingPct < 100);
  const openByDiscipline = useMemo(() => {
    const m = {};
    OPEN_POSITIONS.forEach((p) => { m[p.discipline] = (m[p.discipline] || 0) + p.needed; });
    return Object.entries(m).map(([discipline, needed]) => ({ discipline, needed }));
  }, []);

  return (
    <>
      <PageHeader
        title={t("dash.title")}
        subtitle={t("dash.subtitle")}
        right={
          <>
            <Pill tone="info" dot>{t("common.live")}</Pill>
            <Link href="/control" className="btn-primary">
              <Cpu className="h-4 w-4" />
              {t("nav.control")}
            </Link>
          </>
        }
      />

      {/* HR LIFECYCLE COVERAGE STRIP */}
      <div className="card p-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mr-1">
            HR Lifecycle Coverage
          </span>
          {[
            { id: "rec",   label: "Recruitment",   icon: UserPlus,       link: "#recruitment" },
            { id: "onb",   label: "Onboarding",    icon: ClipboardList,  link: "#recruitment" },
            { id: "alloc", label: "Allocation",    icon: Briefcase,      link: "/control?mode=task" },
            { id: "rot",   label: "Rotation",      icon: CalendarRange,  link: "/control?mode=rotation" },
            { id: "cert",  label: "Certification", icon: GraduationCap,  link: null },
            { id: "plan",  label: "Planning",      icon: BarChart3,      link: null },
            { id: "rec2",  label: "Recovery",      icon: Activity,       link: "/control?mode=recovery" },
            { id: "loc",   label: "Local Content", icon: Flag,           link: null },
          ].map((it) => {
            const Icon = it.icon;
            const cls = "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 ring-1 ring-inset bg-emerald-500/10 text-emerald-200 ring-emerald-500/30 hover:bg-emerald-500/20 transition-colors";
            return it.link ? (
              <Link key={it.id} href={it.link} className={cls}>
                <Icon className="h-3.5 w-3.5" /> {it.label}
              </Link>
            ) : (
              <span key={it.id} className={cls}>
                <Icon className="h-3.5 w-3.5" /> {it.label}
              </span>
            );
          })}
          <span className="ml-auto text-[10px] text-slate-500">8 / 8 covered</span>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label={t("dash.kpi.total")}          value={stats.total}     sub="On the roster"      icon={Users}        tone="info"   trend="+12" />
        <StatCard label={t("dash.kpi.availableToday")} value={stats.available} sub="Cleared for shift"  icon={UserCheck}    tone="ok"     trend="+8" />
        <StatCard label={t("dash.kpi.shortages")}      value={stats.shortages} sub="Skills under-staffed" icon={Wrench}     tone="danger" trend="+1" />
        <StatCard label={t("dash.kpi.fatigue")}        value={stats.fatigue}   sub=">7 days or high"    icon={AlertTriangle} tone="warn"  trend="+3" />
        <StatCard label={t("dash.kpi.expiring")}       value={stats.expiring}  sub={`${stats.expired} already expired`} icon={ShieldAlert} tone="warn" trend="+2" />
      </div>

      {/* MAIN GRID */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Required vs Available trend */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Weekly Attendance — Required vs Available</h3>
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
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
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
          <h3 className="text-sm font-semibold text-white">Workers by Discipline</h3>
          <p className="text-xs text-slate-400">Active workforce composition</p>
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
                    <Cell key={i} fill={DISC_COLORS[i % DISC_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Staffing Coverage */}
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Zone Staffing Coverage</h3>
              <p className="text-xs text-slate-400">Workers on site by construction zone</p>
            </div>
            <Link href="/control?mode=recovery" className="text-xs text-atom-300 hover:text-atom-200 inline-flex items-center gap-1">
              Open Control Center <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} barGap={4}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="zone" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
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

        {/* Alerts side panel */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Operational Alerts</h3>
            <Pill tone="danger" dot>{topShortages.length + delayedZones.length + urgentCerts.length}</Pill>
          </div>
          <p className="text-xs text-slate-400">Items needing decision today</p>

          <div className="mt-3 space-y-3">
            {/* Skill shortages */}
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="flex items-center gap-2 text-rose-200 font-semibold text-xs">
                <Wrench className="h-4 w-4" /> Skill Shortages
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {topShortages.length === 0 && <li className="text-slate-500">None.</li>}
                {topShortages.map((g) => (
                  <li key={g.skill} className="flex items-center justify-between gap-2">
                    <span className="truncate">{g.skill}</span>
                    <Pill tone="danger">-{g.gap}</Pill>
                  </li>
                ))}
              </ul>
            </div>

            {/* Delayed zones */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-2 text-amber-200 font-semibold text-xs">
                <MapPin className="h-4 w-4" /> Delayed / At-Risk Zones
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {delayedZones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{z.name}</span>
                    <Link
                      href={`/control?mode=recovery&zone=${z.id}`}
                      className="text-amber-200 hover:text-amber-100 inline-flex items-center gap-1"
                    >
                      Recover <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expiring certs */}
            <div className="rounded-lg border border-atom-500/20 bg-atom-500/5 p-3">
              <div className="flex items-center gap-2 text-atom-200 font-semibold text-xs">
                <ShieldX className="h-4 w-4" /> Cert Renewals
              </div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                {urgentCerts.map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2">
                    <span className="truncate">{w.name} <span className="text-slate-500">· {w.cert.name}</span></span>
                    <Pill tone={w.cert.status === "expired" ? "danger" : "warn"}>
                      {w.cert.expiresInDays < 0 ? `${Math.abs(w.cert.expiresInDays)}d ago` : `${w.cert.expiresInDays}d`}
                    </Pill>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* RECRUITMENT & ONBOARDING — addresses HR hiring lifecycle */}
        <div id="recruitment" className="card p-4 lg:col-span-2 scroll-mt-24">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-atom-300" /> Recruitment Pipeline
              </h3>
              <p className="text-xs text-slate-400">Open positions, applicants, time-to-fill</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone="danger" dot>{criticalOpen} critical</Pill>
              <Pill tone="muted">{OPEN_POSITIONS.length} reqs</Pill>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
            <MiniStat label="Open positions"   value={totalOpen}        tone="info" />
            <MiniStat label="Applicants"       value={totalApplicants}  tone="ok" />
            <MiniStat label="Avg time-to-fill" value={`${avgTimeToFill}d`} tone="warn" />
            <MiniStat label="Hired (12m)"      value={HIRING_TREND.reduce((s,m)=>s+m.hired,0)} />
          </div>

          {/* Hiring trend */}
          <div className="mt-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HIRING_TREND} barGap={2}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="hired"    name="Hired"    fill="#22d3ee" radius={[3,3,0,0]} />
                <Bar dataKey="attrited" name="Attrited" fill="#f472b6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top open positions table */}
          <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Role</th>
                  <th className="text-center">Need</th>
                  <th className="text-center">Apps</th>
                  <th className="text-center">Open</th>
                  <th>Source</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {OPEN_POSITIONS.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="text-white text-sm">{p.role}</div>
                      <div className="text-[11px] text-slate-500">{p.discipline} · {p.manager}</div>
                    </td>
                    <td className="text-center tabular-nums text-slate-200">{p.needed}</td>
                    <td className="text-center tabular-nums text-emerald-300">{p.applicants}</td>
                    <td className="text-center tabular-nums text-slate-300">{p.daysOpen}d</td>
                    <td>
                      <Pill tone={p.source === "local" ? "info" : p.source === "foreign" ? "muted" : "warn"} className="capitalize">
                        {p.source}
                      </Pill>
                    </td>
                    <td>
                      <Pill tone={p.urgency === "critical" ? "danger" : p.urgency === "high" ? "warn" : "muted"} className="capitalize">
                        {p.urgency}
                      </Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ONBOARDING TRACKER — addresses HR onboarding step */}
        <div className="card p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-atom-300" /> Onboarding
            </h3>
            <Pill tone="info">{onboarding.length} active</Pill>
          </div>
          <p className="text-xs text-slate-400">Recent hires · last 30 days</p>

          <ul className="mt-3 space-y-2.5 max-h-[420px] overflow-auto pr-1">
            {RECENT_HIRES.map((h, i) => (
              <li key={i} className="rounded-lg border border-white/10 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{h.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{h.role} · D+{h.startedDaysAgo}</div>
                  </div>
                  <Pill tone={h.origin === "local" ? "info" : "muted"} className="capitalize">{h.origin}</Pill>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all",
                        h.onboardingPct >= 90 ? "bg-emerald-500" :
                        h.onboardingPct >= 50 ? "bg-atom-400" : "bg-amber-500"
                      )}
                      style={{ width: `${h.onboardingPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-slate-400 w-9 text-right">{h.onboardingPct}%</span>
                  {h.onboardingPct === 100 && <Award className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* KZ Local Content — premium */}
        <div className="card p-4 lg:col-span-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flag className="h-4 w-4 text-atom-300" /> Kazakhstan Local Content
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Local workforce share vs foreign contractors. Target ≥ 80% per state programme.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="rounded bg-white/5 px-2 py-2">
                  <div className="text-atom-300 font-semibold tabular-nums text-lg">{local}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Local</div>
                </div>
                <div className="rounded bg-white/5 px-2 py-2">
                  <div className="text-pink-300 font-semibold tabular-nums text-lg">{foreign}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Foreign</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Local (Kazakhstan)", value: local },
                      { name: "Foreign Contractor", value: foreign },
                    ]}
                    dataKey="value" nameKey="name"
                    innerRadius={48} outerRadius={72}
                    paddingAngle={3}
                    stroke="rgba(0,0,0,0.4)"
                  >
                    <Cell fill="#22d3ee" />
                    <Cell fill="#f472b6" />
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-atom-500/30 bg-atom-500/5 p-4 text-center">
                <div className="text-5xl font-semibold text-atom-200 tabular-nums leading-none">{localPct}<span className="text-2xl text-slate-400 ml-0.5">%</span></div>
                <div className="mt-2 text-xs text-slate-400">Local Kazakhstan content</div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-gradient-to-r from-atom-500 to-emerald-400" style={{ width: `${localPct}%` }} />
                </div>
                <div className="mt-1.5 text-[10px] text-slate-500">Target 80%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MiniStat({ label, value, tone = "muted" }) {
  const cls = {
    info:  "text-atom-200",
    ok:    "text-emerald-300",
    warn:  "text-amber-300",
    muted: "text-white",
  }[tone];
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={clsx("mt-0.5 text-lg font-semibold tabular-nums", cls)}>{value}</div>
    </div>
  );
}
