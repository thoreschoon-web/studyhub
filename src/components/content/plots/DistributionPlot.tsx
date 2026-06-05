import { distDomain, distPdf, isDiscrete, type DistKind } from "@/lib/stats";

export function DistributionPlot({
  dist,
  params,
  shade,
  markers = [],
  title,
  caption,
}: {
  dist: DistKind;
  params: Record<string, number>;
  shade?: { from?: number; to?: number; tail?: "left" | "right" | "two" };
  markers?: { x: number; label?: string }[];
  title?: string;
  caption?: string;
}) {
  const W = 640, H = 340, P = 38;
  const [x0, x1] = distDomain(dist, params);
  const pdf = distPdf(dist, params);
  const discrete = isDiscrete(dist);

  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P);

  let ymax = 0;
  const N = 320;
  const curve: [number, number][] = [];
  if (discrete) {
    for (let k = Math.ceil(x0); k <= Math.floor(x1); k++) {
      const y = pdf(k);
      ymax = Math.max(ymax, y);
      curve.push([k, y]);
    }
  } else {
    for (let i = 0; i <= N; i++) {
      const x = x0 + ((x1 - x0) * i) / N;
      const y = pdf(x);
      if (Number.isFinite(y)) ymax = Math.max(ymax, y);
      curve.push([x, y]);
    }
  }
  ymax = ymax * 1.15 || 1;
  const sy = (y: number) => H - P - (y / ymax) * (H - 2 * P);

  const inShade = (x: number) => {
    if (!shade) return false;
    if (shade.tail === "left") return shade.from !== undefined && x <= shade.from;
    if (shade.tail === "right") return shade.from !== undefined && x >= shade.from;
    if (shade.tail === "two")
      return (shade.from !== undefined && x <= shade.from) || (shade.to !== undefined && x >= shade.to);
    return (shade.from === undefined || x >= shade.from) && (shade.to === undefined || x <= shade.to);
  };

  const linePath = curve
    .filter(([, y]) => Number.isFinite(y))
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`)
    .join(" ");

  // shaded area under continuous curve
  let areaPath = "";
  if (shade && !discrete) {
    const pts = curve.filter(([x, y]) => Number.isFinite(y) && inShade(x));
    if (pts.length) {
      areaPath =
        `M${sx(pts[0][0]).toFixed(1)},${sy(0).toFixed(1)} ` +
        pts.map(([x, y]) => `L${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ") +
        ` L${sx(pts[pts.length - 1][0]).toFixed(1)},${sy(0).toFixed(1)} Z`;
    }
  }

  const xticks = ticks(x0, x1, discrete ? Math.min(12, x1 - x0) : 8, discrete);

  return (
    <figure className="my-5">
      {title && <div className="mb-2 text-sm font-medium text-text">{title}</div>}
      <div className="overflow-hidden rounded-xl border border-line bg-plot p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={title ?? "Verteilung"}>
          <line x1={P} y1={sy(0)} x2={W - P} y2={sy(0)} style={{ stroke: "var(--color-plot-axis)" }} strokeWidth={1.5} />
          {areaPath && <path d={areaPath} fill="color-mix(in oklab, var(--accent) 32%, transparent)" />}

          {discrete
            ? curve.map(([k, y]) => (
                <g key={k}>
                  <rect
                    x={sx(k) - 9}
                    y={sy(y)}
                    width={18}
                    height={sy(0) - sy(y)}
                    rx={2}
                    fill={inShade(k) ? "color-mix(in oklab, var(--accent) 55%, transparent)" : "color-mix(in oklab, var(--accent) 22%, transparent)"}
                    stroke="var(--accent)"
                    strokeWidth={1}
                  />
                </g>
              ))
            : <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth={2.4} strokeLinejoin="round" />}

          {markers.map((m, i) => (
            <g key={i}>
              <line x1={sx(m.x)} y1={P - 6} x2={sx(m.x)} y2={sy(0)} stroke="#f59e0b" strokeWidth={1.4} strokeDasharray="4 4" />
              {m.label && (
                <text x={sx(m.x)} y={P - 9} fontSize={11} fill="#f59e0b" textAnchor="middle">
                  {m.label}
                </text>
              )}
            </g>
          ))}

          {xticks.map((t) => (
            <text key={t} x={sx(t)} y={H - P + 14} fontSize={10} style={{ fill: "var(--color-faint)" }} textAnchor="middle">
              {discrete ? t : fmt(t)}
            </text>
          ))}
        </svg>
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted">{caption}</figcaption>}
    </figure>
  );
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

function ticks(lo: number, hi: number, count: number, integer: boolean): number[] {
  if (integer) {
    const step = Math.max(1, Math.ceil((hi - lo) / count));
    const out: number[] = [];
    for (let t = Math.ceil(lo); t <= hi; t += step) out.push(t);
    return out;
  }
  const span = hi - lo, step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const start = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let t = start; t <= hi + 1e-9; t += step) out.push(Math.round(t / step) * step);
  return out;
}
