"use client";

import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import { useStore, isDue } from "@/lib/store";
import { ProgressRing } from "@/components/ui";
import { Layers, ArrowUpRight } from "lucide-react";

export function SubjectCard({
  meta,
  topicIds,
  totalQuiz,
  cardIds,
  counts,
  index = 0,
}: {
  meta: SubjectMeta;
  topicIds: string[];
  totalQuiz: number;
  cardIds: string[];
  counts: { topics: number; exercises: number; flashcards: number; quiz: number };
  index?: number;
}) {
  const topics = useStore((s) => s.topics);
  const srs = useStore((s) => s.srs);

  const correct = topicIds.reduce((n, tid) => n + (topics[tid]?.quizCorrect.length ?? 0), 0);
  const quizPct = totalQuiz ? Math.round((correct / totalQuiz) * 100) : 0;
  const due = cardIds.filter((id) => isDue(srs[id])).length;
  const empty = counts.topics === 0;

  return (
    <Link
      href={`/${meta.id}`}
      style={{ "--accent": meta.accent, animationDelay: `${index * 80}ms` } as React.CSSProperties}
      className="reveal card-print group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/55 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:color-mix(in_oklab,var(--accent)_55%,var(--color-line))] hover:bg-surface-2/60"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-[0.18] blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: meta.accent }}
      />

      <div className="flex items-start justify-between">
        <div
          className="font-display grid h-14 w-14 place-items-center rounded-2xl border text-3xl"
          style={{
            color: meta.accent,
            borderColor: `color-mix(in oklab, ${meta.accent} 38%, transparent)`,
            background: `color-mix(in oklab, ${meta.accent} 11%, transparent)`,
          }}
        >
          {meta.icon}
        </div>
        {!empty ? (
          <div style={{ "--accent": meta.accent } as React.CSSProperties}>
            <ProgressRing value={quizPct} size={46}>{quizPct}%</ProgressRing>
          </div>
        ) : (
          <ArrowUpRight size={20} className="text-faint transition-colors group-hover:text-text" />
        )}
      </div>

      <h3 className="font-display mt-5 text-[1.45rem] font-medium leading-tight tracking-tight text-heading">
        {meta.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{meta.tagline}</p>

      <div className="mt-5 h-px w-full origin-left scale-x-100" style={{ background: `color-mix(in oklab, ${meta.accent} 28%, var(--color-line))` }} />

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 label-mono">
        <span>{counts.topics} Themen</span>
        <span>·</span>
        <span>{counts.quiz} Quiz</span>
        <span>·</span>
        <span>{counts.exercises} Aufgaben</span>
        <span>·</span>
        <span>{counts.flashcards} Karten</span>
      </div>

      {empty ? (
        <div className="mt-4 rounded-lg border border-dashed border-line px-3 py-2 text-center text-xs text-faint">
          Inhalte werden gerade erstellt…
        </div>
      ) : (
        due > 0 && (
          <div
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: meta.accent, background: `color-mix(in oklab, ${meta.accent} 12%, transparent)` }}
          >
            <Layers size={12} /> {due} Karten fällig
          </div>
        )
      )}
    </Link>
  );
}
