import { Markdown } from "./Markdown";
import type { Callout as CalloutT } from "@/lib/types";
import { Info, AlertTriangle, Lightbulb, BookMarked, FlaskConical, Sigma } from "lucide-react";

const STYLES: Record<CalloutT["kind"], { icon: React.ReactNode; label: string; color: string }> = {
  info: { icon: <Info size={16} />, label: "Hinweis", color: "#38bdf8" },
  warning: { icon: <AlertTriangle size={16} />, label: "Achtung", color: "#f59e0b" },
  tip: { icon: <Lightbulb size={16} />, label: "Tipp", color: "#22c55e" },
  merksatz: { icon: <BookMarked size={16} />, label: "Merksatz", color: "var(--accent)" },
  beispiel: { icon: <FlaskConical size={16} />, label: "Beispiel", color: "#a78bfa" },
  definition: { icon: <BookMarked size={16} />, label: "Definition", color: "var(--accent)" },
  formel: { icon: <Sigma size={16} />, label: "Formel", color: "#f472b6" },
};

export function Callout({ callout }: { callout: CalloutT }) {
  const s = STYLES[callout.kind] ?? STYLES.info;
  return (
    <div
      className="my-4 rounded-xl border bg-surface/40 p-4"
      style={{
        borderColor: `color-mix(in oklab, ${s.color} 35%, var(--color-line))`,
        background: `color-mix(in oklab, ${s.color} 7%, var(--color-surface))`,
      }}
    >
      <div className="mb-1.5 flex items-center gap-2 text-sm font-semibold" style={{ color: s.color }}>
        {s.icon}
        {callout.title ?? s.label}
      </div>
      <div className="text-sm [&_.prose]:text-sm">
        <Markdown>{callout.body}</Markdown>
      </div>
    </div>
  );
}
