import { compile } from "mathjs";

type Fn = { fn: string; color?: string; label?: string; dashed?: boolean };
type Pt = { x: number; y: number; label?: string; color?: string };

const PALETTE = ["var(--accent)", "#f59e0b", "#22c55e", "#ec4899", "#38bdf8"];

export function FunctionPlot({
  functions,
  domain,
  range,
  points = [],
  caption,
  title,
}: {
  functions: Fn[];
  domain: [number, number];
  range?: [number, number];
  points?: Pt[];
  caption?: string;
  title?: string;
}) {
  const W = 640, H = 360, P = 38;
  const [x0, x1] = domain;
  const N = 240;

  // evaluate
  const series = functions.map((f) => {
    let ev: (x: number) => number;
    try {
      const c = compile(f.fn);
      ev = (x: number) => c.evaluate({ x });
    } catch {
      ev = () => NaN;
    }
    const pts: [number, number][] = [];
    for (let i = 0; i <= N; i++) {
      const x = x0 + ((x1 - x0) * i) / N;
      let y = NaN;
      try {
        y = Number(ev(x));
      } catch {}
      pts.push([x, y]);
    }
    return { ...f, pts };
  });

  // y-range
  let [y0, y1] = range ?? [Infinity, -Infinity];
  if (!range) {
    for (const s of series)
      for (const [, y] of s.pts) if (Number.isFinite(y)) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (const p of points) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    if (!Number.isFinite(y0) || !Number.isFinite(y1) || y0 === y1) { y0 = -1; y1 = 1; }
    const pad = (y1 - y0) * 0.12 || 1;
    y0 -= pad; y1 += pad;
  }

  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - y0) / (y1 - y0)) * (H - 2 * P);

  const path = (pts: [number, number][]) => {
    let d = "", pen = false;
    for (const [x, y] of pts) {
      if (!Number.isFinite(y) || y < y0 - (y1 - y0) || y > y1 + (y1 - y0)) { pen = false; continue; }
      d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)} `;
      pen = true;
    }
    return d;
  };

  const xticks = niceTicks(x0, x1, 8);
  const yticks = niceTicks(y0, y1, 6);

  return (
    <figure className="my-5">
      {title && <div className="mb-2 text-sm font-medium text-text">{title}</div>}
      <div className="overflow-hidden rounded-xl border border-line bg-[#0b0d13] p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title ?? "Funktionsplot"}>
          {/* grid */}
          {xticks.map((t) => (
            <line key={`xg${t}`} x1={sx(t)} y1={P} x2={sx(t)} y2={H - P} stroke="#1b1f2b" strokeWidth={1} />
          ))}
          {yticks.map((t) => (
            <line key={`yg${t}`} x1={P} y1={sy(t)} x2={W - P} y2={sy(t)} stroke="#1b1f2b" strokeWidth={1} />
          ))}
          {/* axes (x=0,y=0 if in range) */}
          {y0 < 0 && y1 > 0 && <line x1={P} y1={sy(0)} x2={W - P} y2={sy(0)} stroke="#3a4153" strokeWidth={1.5} />}
          {x0 < 0 && x1 > 0 && <line x1={sx(0)} y1={P} x2={sx(0)} y2={H - P} stroke="#3a4153" strokeWidth={1.5} />}
          {/* tick labels */}
          {xticks.map((t) => (
            <text key={`xt${t}`} x={sx(t)} y={H - P + 14} fontSize={10} fill="#646b7d" textAnchor="middle">
              {fmt(t)}
            </text>
          ))}
          {yticks.map((t) => (
            <text key={`yt${t}`} x={P - 6} y={sy(t) + 3} fontSize={10} fill="#646b7d" textAnchor="end">
              {fmt(t)}
            </text>
          ))}
          {/* curves */}
          {series.map((s, i) => (
            <path
              key={i}
              d={path(s.pts)}
              fill="none"
              stroke={s.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth={2.2}
              strokeDasharray={s.dashed ? "6 5" : undefined}
              strokeLinejoin="round"
            />
          ))}
          {/* points */}
          {points.map((p, i) => (
            <g key={`p${i}`}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={4} fill={p.color ?? "#f59e0b"} stroke="#0b0d13" strokeWidth={1.5} />
              {p.label && (
                <text x={sx(p.x) + 7} y={sy(p.y) - 7} fontSize={11} fill="#e9ebf2">
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      {(functions.some((f) => f.label) || caption) && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          {functions.map((f, i) =>
            f.label ? (
              <span key={i} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-3 rounded" style={{ background: f.color ?? PALETTE[i % PALETTE.length] }} />
                {f.label}
              </span>
            ) : null,
          )}
          {caption && <span className="text-faint">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

function fmt(n: number): string {
  if (Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)) return n.toExponential(1);
  return (Math.round(n * 100) / 100).toString();
}

function niceTicks(lo: number, hi: number, count: number): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const start = Math.ceil(lo / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= hi + 1e-9; t += step) ticks.push(Math.round(t / step) * step);
  return ticks;
}
