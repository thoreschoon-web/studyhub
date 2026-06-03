import type { Section } from "@/lib/types";
import { Markdown } from "./Markdown";
import { Callout } from "./Callout";
import { Figure } from "./Figure";
import { cn } from "@/lib/utils";

export function SectionView({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-12">
      {sections.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={cn("reveal scroll-mt-24", i === 0 && "section-lead")}
          style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}
        >
          <div className="mb-4 flex items-center gap-4">
            <span className="label-mono shrink-0" style={{ color: "var(--accent)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="h-px flex-1" style={{ background: "color-mix(in oklab, var(--accent) 22%, var(--color-line))" }} />
          </div>
          <h2 className="font-display mb-4 text-[1.7rem] font-medium leading-tight tracking-tight text-white">
            {s.heading}
          </h2>
          <Markdown>{s.body}</Markdown>
          {s.figures?.map((f) => (
            <Figure key={f.id} figure={f} />
          ))}
          {s.callouts?.map((c, ci) => (
            <Callout key={ci} callout={c} />
          ))}
        </section>
      ))}
    </div>
  );
}
