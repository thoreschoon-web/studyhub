"use client";

import { useMemo, useState } from "react";
import type { Flashcard } from "@/lib/types";
import { actions, useStore, isDue } from "@/lib/store";
import { Markdown } from "@/components/content/Markdown";
import { shuffle } from "@/lib/utils";
import { RotateCw, Check, ChevronLeft } from "lucide-react";

const GRADES = [
  { q: 1, label: "Nochmal", hint: "< 1 Tag", color: "#ef4444" },
  { q: 3, label: "Schwer", hint: "", color: "#f59e0b" },
  { q: 4, label: "Gut", hint: "", color: "#38bdf8" },
  { q: 5, label: "Leicht", hint: "", color: "#22c55e" },
];

export function FlashcardDeck({ cards, dueOnly = false }: { cards: Flashcard[]; dueOnly?: boolean }) {
  const srs = useStore((s) => s.srs);
  const [seed, setSeed] = useState(1);

  const deck = useMemo(() => {
    const pool = dueOnly ? cards.filter((c) => isDue(srs[c.id])) : cards;
    return shuffle(pool, seed * 104729);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, dueOnly, seed]);

  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (!cards.length) return <p className="text-sm text-muted">Keine Karteikarten vorhanden.</p>;
  if (!deck.length)
    return (
      <div className="rounded-2xl border border-line bg-surface/50 p-8 text-center">
        <Check size={26} className="mx-auto mb-2 text-ok" />
        <p className="text-sm text-muted">Alles wiederholt – für heute nichts fällig. 🎉</p>
      </div>
    );

  const card = deck[Math.min(i, deck.length - 1)];

  function grade(q: number) {
    actions.gradeCard(card.id, q);
    setReviewed((r) => r + 1);
    if (i + 1 >= deck.length) {
      setSeed((s) => s + 1);
      setI(0);
    } else setI(i + 1);
    setFlipped(false);
  }

  function back() {
    if (i === 0) return;
    setI(i - 1);
    setFlipped(false);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-3">
          <button
            onClick={back}
            disabled={i === 0}
            aria-label="Vorherige Karte"
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 transition-colors hover:text-text disabled:cursor-default disabled:opacity-30 disabled:hover:text-muted"
          >
            <ChevronLeft size={14} /> Zurück
          </button>
          <span>Karte {i + 1} / {deck.length}{dueOnly ? " fällig" : ""}</span>
        </div>
        <span>{reviewed} wiederholt</span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="group relative grid min-h-[230px] w-full place-items-center overflow-hidden rounded-2xl border border-line bg-surface/70 p-8 text-center transition-colors hover:border-[color:color-mix(in_oklab,var(--accent)_45%,var(--color-line))]"
      >
        <div className="absolute left-4 top-3 text-[0.7rem] uppercase tracking-wide text-faint">
          {flipped ? "Antwort" : "Frage"}
        </div>
        <div className="text-[1.1rem] leading-relaxed [&_.prose]:my-0 [&_.prose]:text-[1.05rem]">
          <Markdown>{flipped ? card.back : card.front}</Markdown>
        </div>
        {!flipped && (
          <div className="absolute bottom-3 flex items-center gap-1.5 text-[0.7rem] text-faint">
            <RotateCw size={12} /> Klicken zum Umdrehen
          </div>
        )}
      </button>

      {flipped ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GRADES.map((g) => (
            <button
              key={g.q}
              onClick={() => grade(g.q)}
              className="rounded-xl border py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
              style={{ borderColor: `color-mix(in oklab, ${g.color} 40%, var(--color-line))`, color: g.color, background: `color-mix(in oklab, ${g.color} 8%, transparent)` }}
            >
              {g.label}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-medium text-white"
          style={{ background: "var(--accent)" }}
        >
          Antwort zeigen
        </button>
      )}
    </div>
  );
}
