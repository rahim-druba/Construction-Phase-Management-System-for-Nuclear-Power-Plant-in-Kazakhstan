import { useMemo } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Calendar, Mail } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

import PageHeader from "@/components/PageHeader";
import Pill from "@/components/Pill";
import StatCard from "@/components/StatCard";
import { WORKERS } from "@/data/workers";
import { zoneName } from "@/utils/workforce";

export default function CertificationsPage() {
  const groups = useMemo(() => {
    const expired  = WORKERS.filter((w) => w.cert.status === "expired").sort((a,b) => a.cert.expiresInDays - b.cert.expiresInDays);
    const expiring = WORKERS.filter((w) => w.cert.status === "expiring").sort((a,b) => a.cert.expiresInDays - b.cert.expiresInDays);
    const valid    = WORKERS.filter((w) => w.cert.status === "valid");
    return { expired, expiring, valid };
  }, []);

  const certByType = useMemo(() => {
    const m = {};
    WORKERS.forEach((w) => {
      const k = w.cert.name;
      if (!m[k]) m[k] = { name: k, valid: 0, expiring: 0, expired: 0 };
      m[k][w.cert.status] += 1;
    });
    return Object.values(m).sort((a,b) => (b.expired + b.expiring) - (a.expired + a.expiring));
  }, []);

  return (
    <>
      <PageHeader
        title="Certification Tracker"
        subtitle="Workers with expired or expiring certificates require immediate renewal action."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tracked"     value={WORKERS.length}     icon={ShieldCheck} tone="info" />
        <StatCard label="Valid"              value={groups.valid.length}    icon={ShieldCheck} tone="ok"     sub="No action needed" />
        <StatCard label="Expiring (≤30d)"    value={groups.expiring.length} icon={ShieldAlert} tone="warn"   sub="Schedule renewal" />
        <StatCard label="Expired"            value={groups.expired.length}  icon={ShieldX}     tone="danger" sub="Block from site" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white">Status by Certificate Type</h3>
          <p className="text-xs text-slate-400">Stacked breakdown across the workforce.</p>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={certByType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={11} width={150} />
                <Tooltip />
                <Bar dataKey="valid"    name="Valid"    stackId="a" fill="#10b981" radius={[0,0,0,0]} />
                <Bar dataKey="expiring" name="Expiring" stackId="a" fill="#f59e0b" />
                <Bar dataKey="expired"  name="Expired"  stackId="a" fill="#ef4444" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-300" /> Renewal Pipeline
          </h3>
          <p className="text-xs text-slate-400">Next 30 days · earliest first</p>

          <ul className="mt-3 space-y-2 max-h-80 overflow-auto pr-1">
            {groups.expiring.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{w.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{w.cert.name} · {w.skill}</div>
                </div>
                <Pill tone="warn">{w.cert.expiresInDays}d</Pill>
              </li>
            ))}
            {groups.expiring.length === 0 && <li className="text-xs text-slate-500">No upcoming renewals.</li>}
          </ul>
        </div>
      </div>

      {/* Detailed list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <Section
          title="Expired — block from site"
          tone="danger"
          icon={ShieldX}
          items={groups.expired}
        />
        <Section
          title="Expiring within 30 days"
          tone="warn"
          icon={ShieldAlert}
          items={groups.expiring}
        />
      </div>
    </>
  );
}

function Section({ title, tone, icon: Icon, items }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Icon className={
            tone === "danger" ? "h-4 w-4 text-rose-300" : "h-4 w-4 text-amber-300"
          } />
          {title}
        </h3>
        <Pill tone={tone}>{items.length}</Pill>
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
        <table className="table-base">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Certificate</th>
              <th>Zone</th>
              <th className="text-right">Expires</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((w) => (
              <tr key={w.id}>
                <td>
                  <div className="text-white text-sm">{w.name}</div>
                  <div className="text-[11px] text-slate-500">{w.skill}</div>
                </td>
                <td className="text-slate-200 text-xs">{w.cert.name}</td>
                <td className="text-xs">
                  <span className="font-mono text-slate-400">{w.zone}</span>
                  <span className="text-slate-500"> · {zoneName(w.zone)}</span>
                </td>
                <td className="text-right tabular-nums">
                  <Pill tone={tone}>
                    {w.cert.expiresInDays < 0 ? `${Math.abs(w.cert.expiresInDays)}d ago` : `${w.cert.expiresInDays}d`}
                  </Pill>
                </td>
                <td className="text-right">
                  <button className="btn-ghost !py-1 !px-2 !text-xs" title="Send renewal notice">
                    <Mail className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-slate-500 py-6 text-xs">All clear.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
