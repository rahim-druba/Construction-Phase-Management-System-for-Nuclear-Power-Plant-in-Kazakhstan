import clsx from "clsx";

const map = {
  ok:     "pill-ok",
  warn:   "pill-warn",
  danger: "pill-danger",
  info:   "pill-info",
  muted:  "pill-muted",
};

export default function Pill({ tone = "muted", children, className, dot = false }) {
  return (
    <span className={clsx(map[tone] || map.muted, className)}>
      {dot && (
        <span
          className={clsx("h-1.5 w-1.5 rounded-full", {
            "bg-emerald-400": tone === "ok",
            "bg-amber-400":   tone === "warn",
            "bg-rose-400":    tone === "danger",
            "bg-atom-400":    tone === "info",
            "bg-slate-400":   tone === "muted",
          })}
        />
      )}
      {children}
    </span>
  );
}
