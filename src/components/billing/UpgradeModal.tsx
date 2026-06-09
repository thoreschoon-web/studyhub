"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, X, Sparkles } from "lucide-react";

const LABELS: Record<string, string> = {
  pages: "Du hast 5 Themenseiten geöffnet",
  flashcards: "Du hast 3 Karteikarten gelernt",
  exercises: "Du hast 1 Aufgabe gemacht",
  quiz: "Du hast 3 Quizfragen beantwortet",
};

export function UpgradeModal() {
  const [kind, setKind] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setKind((e as CustomEvent).detail || "limit");
    window.addEventListener("studyhub:limit", handler as EventListener);
    return () => window.removeEventListener("studyhub:limit", handler as EventListener);
  }, []);

  if (!kind) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setKind(null)} />
      <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl border border-line bg-bg-soft p-7 text-center shadow-2xl">
        <button onClick={() => setKind(null)} className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:text-text" aria-label="Schließen">
          <X size={18} />
        </button>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}>
          <Lock size={26} style={{ color: "var(--accent)" }} />
        </div>
        <h2 className="font-display text-xl font-medium text-heading">Gratis-Limit erreicht</h2>
        <p className="mt-2 text-sm text-muted">
          {LABELS[kind] ?? "Dein kostenloses Kontingent ist aufgebraucht"} — das ist das Limit der kostenlosen Version.
          Mit dem <strong className="text-text">Semester-Pass</strong> lernst du unbegrenzt: alle Themen, Karteikarten,
          Aufgaben & Quizze — einmal zahlen, fürs ganze Semester.
        </p>
        <Link
          href="/upgrade"
          onClick={() => setKind(null)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          <Sparkles size={16} /> Semester-Pass ansehen
        </Link>
        <button onClick={() => setKind(null)} className="mt-2 w-full rounded-xl py-2 text-sm text-muted hover:text-text">
          Später
        </button>
      </div>
    </div>
  );
}
