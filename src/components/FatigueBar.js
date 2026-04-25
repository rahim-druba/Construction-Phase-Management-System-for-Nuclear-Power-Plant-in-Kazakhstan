import clsx from "clsx";

export default function FatigueBar({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const tone =
    v >= 75 ? "bg-rose-500"   :
    v >= 55 ? "bg-amber-500"  :
    v >= 30 ? "bg-atom-400"   :
              "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
        <div className={clsx("h-full rounded-full transition-all", tone)} style={{ width: `${v}%` }} />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-slate-300">{v}</span>
    </div>
  );
}
