import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "card-print rounded-[var(--radius)] border border-line bg-surface/70 backdrop-blur-sm",
        hover && "transition-colors duration-200 hover:border-[color:color-mix(in_oklab,var(--accent)_45%,var(--color-line))] hover:bg-surface-2/70",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "bad" | "warn";
}) {
  const tones: Record<string, string> = {
    neutral: "border-line bg-surface-2 text-muted",
    accent: "border-[color:color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color:color-mix(in_oklab,var(--accent)_14%,transparent)] text-[color:var(--accent)]",
    ok: "border-ok/30 bg-ok/10 text-ok",
    bad: "border-bad/30 bg-bad/10 text-bad",
    warn: "border-warn/30 bg-warn/10 text-warn",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-[3px] border px-2 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: "var(--accent)" }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 44,
  stroke = 3,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute text-[0.66rem] font-semibold tabular-nums">{children}</span>
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-line bg-surface/50 px-4 py-3">
      <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
      {sub && <div className="mt-0.5 text-[0.7rem] text-faint">{sub}</div>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">{children}</div>;
}
