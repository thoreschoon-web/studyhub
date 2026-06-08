"use client";

import Link from "next/link";
import type { SubjectMeta } from "@/lib/types";
import { useStore, isDue } from "@/lib/store";
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
  const n = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/${meta.id}`}
      style={{ "--accent": meta.accent, animationDelay: `${index * 70}ms` } as React.CSSProperties}
      className="reveal card-print group relative flex flex-col rounded-[var(--radius)] border border-line bg-surface/55 p-6 transition-colors duration-200 hover:border-[color:color-mix(in_oklab,var(--accent)_55%,var(--color-line))] hover:bg-surface-2/60"
    >
      {/* top row — index numeral · subject glyph */}
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2.5">
          <span className="numeral font-mono text-sm" style={{ color: meta.accent }}>{n}</span>
          <span className="h-2.5 w-2.5 translate-y-[1px] rounded-[2px]" style={{ background: meta.accent }} aria-hidden />
        </div>
        {empty ? (
          <ArrowUpRight size={18} className="text-faint transition-colors group-hover:text-text" />
        ) : (
          <span className="numeral font-mono text-xs text-faint">{quizPct}%</span>
        )}
      </div>

      <h3 className="font-display mt-7 flex items-center gap-2.5 text-[1.4rem] font-semibold leading-tight tracking-tight text-heading">
        <span className="text-[1.15em] leading-none" style={{ color: meta.accent }} aria-hidden>{meta.icon}</span>
        {meta.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{meta.tagline}</p>

      {/* progress bar */}
      {!empty && (
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${quizPct}%`, background: meta.accent }}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1 label-mono">
        <span>{counts.topics} Themen</span>
        <span aria-hidden>·</span>
        <span>{counts.quiz} Quiz</span>
        <span aria-hidden>·</span>
        <span>{counts.exercises} Aufgaben</span>
        <span aria-hidden>·</span>
        <span>{counts.flashcards} Karten</span>
      </div>

      {empty ? (
        <div className="mt-4 rounded-[var(--radius)] border border-dashed border-line px-3 py-2 text-center text-xs text-faint">
          Inhalte werden gerade erstellt…
        </div>
      ) : (
        due > 0 && (
          <div
            className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-[3px] px-2 py-1 text-xs font-medium"
            style={{ color: meta.accent, background: `color-mix(in oklab, ${meta.accent} 12%, transparent)` }}
          >
            <Layers size={12} /> {due} Karten fällig
          </div>
        )
      )}
    </Link>
  );
}
