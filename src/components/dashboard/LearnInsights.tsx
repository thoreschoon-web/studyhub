import Link from "next/link";
import { getInsights } from "@/lib/insights-server";
import { SUBJECT_MAP } from "@/lib/subjects";
import { Layers, TrendingDown, Target, ArrowUpRight } from "lucide-react";

/** Dashboard-Lernstand (nur eingeloggt): fällige Karten, schwache Themen, Klausur-Bereitschaft. */
export async function LearnInsights({ userId }: { userId: string }) {
  const { dueCards, weakTopics, readiness } = await getInsights(userId);
  const touchedAnything = dueCards > 0 || weakTopics.length > 0 || readiness.some((r) => r.percent > 0);

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between">
        <span className="label-mono">Dein Lernstand</span>
        <span className="label-mono">heute</span>
      </div>
      <div className="rule mt-3" />

      {!touchedAnything ? (
        <p className="mt-5 text-sm text-muted">
          Noch keine Lernaktivität — öffne ein Thema, beantworte Quizfragen oder lerne Karteikarten, dann erscheint hier
          dein Fortschritt.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Fällige Karteikarten */}
          <Link
            href="/karteikarten"
            className="group flex flex-col rounded-[var(--radius)] border border-line bg-surface/40 p-5 transition-colors hover:border-line-soft hover:bg-surface-2/60"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-muted"><Layers size={15} /> Fällige Karten</span>
              <ArrowUpRight size={15} className="text-faint transition-colors group-hover:text-text" />
            </div>
            <div className="numeral mt-4 font-mono text-4xl font-semibold text-heading">{dueCards}</div>
            <p className="mt-1 text-xs text-muted">
              {dueCards === 0 ? "Alles gelernt — stark!" : "warten heute auf ihre Wiederholung"}
            </p>
          </Link>

          {/* Schwache Themen */}
          <div className="flex flex-col rounded-[var(--radius)] border border-line bg-surface/40 p-5">
            <span className="inline-flex items-center gap-2 text-muted"><TrendingDown size={15} /> Schwache Themen</span>
            {weakTopics.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Keine Schwachstellen erkannt (Quiz-Quote ≥ 60 %).</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {weakTopics.map((w) => (
                  <li key={w.topicId}>
                    <Link href={`/${w.subjectId}/${w.topicId}`} className="group flex items-center justify-between gap-3 text-sm">
                      <span className="line-clamp-1 text-text group-hover:underline">{w.title}</span>
                      <span className="numeral shrink-0 font-mono text-xs text-bad">{Math.round(w.accuracy * 100)} %</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Klausur-Bereitschaft */}
          <div className="flex flex-col rounded-[var(--radius)] border border-line bg-surface/40 p-5">
            <span className="inline-flex items-center gap-2 text-muted"><Target size={15} /> Klausur-Bereitschaft</span>
            <ul className="mt-4 space-y-2.5">
              {readiness.map((r) => {
                const meta = SUBJECT_MAP[r.subjectId];
                if (!meta) return null;
                return (
                  <li key={r.subjectId}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-text">{meta.short}</span>
                      <span className="numeral font-mono text-faint">{r.percent} %</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full" style={{ width: `${r.percent}%`, background: meta.accent }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
