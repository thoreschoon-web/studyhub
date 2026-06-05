"use client";

import Link from "next/link";
import type { TopicHeader } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ProgressRing } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ListChecks, FileText, Layers, ChevronRight } from "lucide-react";

export function TopicList({ headers }: { headers: TopicHeader[] }) {
  const groups = new Map<string, TopicHeader[]>();
  for (const h of headers) {
    const g = h.group ?? "";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(h);
  }

  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([group, items]) => (
        <div key={group}>
          {group && <h2 className="label-mono mb-3">{group}</h2>}
          <div className="space-y-2.5">
            {items.map((h, i) => (
              <TopicRow key={h.id} h={h} index={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicRow({ h, index }: { h: TopicHeader; index: number }) {
  const tp = useStore((s) => s.topics[h.id]);
  const quizPct = h.counts.quiz ? Math.round(((tp?.quizCorrect.length ?? 0) / h.counts.quiz) * 100) : 0;

  return (
    <Link
      href={`/${h.subjectId}/${h.id}`}
      className="card-print group flex items-center gap-4 rounded-xl border border-line bg-surface/50 px-4 py-3.5 transition-all hover:border-[color:color-mix(in_oklab,var(--accent)_45%,var(--color-line))] hover:bg-surface-2/60"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-semibold tabular-nums text-muted">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display truncate text-[1.1rem] font-medium text-heading">{h.title}</div>
        <div className="mt-0.5 line-clamp-1 text-xs text-muted">{h.summary}</div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.7rem] text-faint">
          {h.counts.quiz > 0 && <span className="inline-flex items-center gap-1"><ListChecks size={12} /> {h.counts.quiz}</span>}
          {h.counts.exercises > 0 && <span className="inline-flex items-center gap-1"><FileText size={12} /> {h.counts.exercises}</span>}
          {h.counts.flashcards > 0 && <span className="inline-flex items-center gap-1"><Layers size={12} /> {h.counts.flashcards}</span>}
          {h.estMinutes ? <span>· {h.estMinutes} min</span> : null}
        </div>
      </div>
      {h.counts.quiz > 0 && (
        <ProgressRing value={quizPct} size={38} stroke={3.5}>
          <span className={cn(quizPct === 100 && "text-ok")}>{quizPct}</span>
        </ProgressRing>
      )}
      <ChevronRight size={18} className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
