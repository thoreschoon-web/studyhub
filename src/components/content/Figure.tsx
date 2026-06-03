import type { Figure as FigureT } from "@/lib/types";
import { FunctionPlot } from "./plots/FunctionPlot";
import { DistributionPlot } from "./plots/DistributionPlot";
import { MermaidClient } from "./MermaidClient";

export function Figure({ figure }: { figure: FigureT }) {
  switch (figure.kind) {
    case "function-plot":
      return (
        <FunctionPlot
          functions={figure.functions}
          domain={figure.domain}
          range={figure.range}
          points={figure.points}
          title={figure.title}
          caption={figure.caption}
        />
      );
    case "distribution":
      return (
        <DistributionPlot
          dist={figure.dist}
          params={figure.params}
          shade={figure.shade}
          markers={figure.markers}
          title={figure.title}
          caption={figure.caption}
        />
      );
    case "mermaid":
      return <MermaidClient code={figure.code} title={figure.title} caption={figure.caption} />;
    case "image":
      return (
        <figure className="my-5">
          {figure.title && <div className="mb-2 text-sm font-medium text-text">{figure.title}</div>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={figure.src} alt={figure.alt} className="rounded-xl border border-line" />
          {figure.caption && <figcaption className="mt-2 text-xs text-muted">{figure.caption}</figcaption>}
        </figure>
      );
    case "table":
      return (
        <figure className="my-5">
          {figure.title && <div className="mb-2 text-sm font-medium text-text">{figure.title}</div>}
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {figure.headers.map((h, i) => (
                    <th key={i} className="border-b border-line bg-surface-2 px-3 py-2 text-left font-semibold text-text">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {figure.rows.map((row, ri) => (
                  <tr key={ri} className="odd:bg-surface/40">
                    {row.map((c, ci) => (
                      <td key={ci} className="border-b border-line/60 px-3 py-2 text-muted">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {figure.caption && <figcaption className="mt-2 text-xs text-muted">{figure.caption}</figcaption>}
        </figure>
      );
  }
}
