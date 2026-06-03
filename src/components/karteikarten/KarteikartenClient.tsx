"use client";

import { useState } from "react";
import type { Flashcard, SubjectId } from "@/lib/types";
import { FlashcardDeck } from "@/components/learn/FlashcardDeck";
import { useStore, isDue } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface Deck {
  subjectId: SubjectId;
  title: string;
  short: string;
  accent: string;
  icon: string;
  cards: Flashcard[];
}

export function KarteikartenClient({ decks }: { decks: Deck[] }) {
  const withCards = decks.filter((d) => d.cards.length);
  const [active, setActive] = useState<SubjectId | "all">(withCards[0]?.subjectId ?? "all");
  const [dueOnly, setDueOnly] = useState(false);

  const allCards = decks.flatMap((d) => d.cards);
  const current = active === "all" ? allCards : decks.find((d) => d.subjectId === active)?.cards ?? [];
  const accent = active === "all" ? "var(--color-mathe)" : decks.find((d) => d.subjectId === active)?.accent;

  if (!allCards.length)
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
        Karteikarten werden gerade aus deinen Unterlagen erstellt.
      </div>
    );

  return (
    <div style={{ "--accent": accent } as React.CSSProperties}>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chip active={active === "all"} onClick={() => setActive("all")} accent="var(--color-mathe)">
          Alle ({allCards.length})
        </Chip>
        {withCards.map((d) => (
          <Chip key={d.subjectId} active={active === d.subjectId} onClick={() => setActive(d.subjectId)} accent={d.accent}>
            {d.icon} {d.short} ({d.cards.length})
          </Chip>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} className="accent-[var(--accent)]" />
          Nur fällige
        </label>
      </div>

      <DueSummary cards={current} />
      <FlashcardDeck key={`${active}-${dueOnly}`} cards={current} dueOnly={dueOnly} />
    </div>
  );
}

function DueSummary({ cards }: { cards: Flashcard[] }) {
  const srs = useStore((s) => s.srs);
  const due = cards.filter((c) => isDue(srs[c.id])).length;
  return (
    <p className="mb-4 text-sm text-muted">
      <span className="font-semibold text-text tabular-nums">{due}</span> von {cards.length} Karten heute fällig.
    </p>
  );
}

function Chip({ active, onClick, accent, children }: { active: boolean; onClick: () => void; accent: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", active ? "text-text" : "text-muted hover:text-text")}
      style={active ? { borderColor: `color-mix(in oklab, ${accent} 45%, transparent)`, background: `color-mix(in oklab, ${accent} 14%, transparent)`, color: accent } : { borderColor: "var(--color-line)" }}
    >
      {children}
    </button>
  );
}
