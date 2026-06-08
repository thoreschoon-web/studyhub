import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export function Paywall({ title }: { title?: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}>
        <Lock size={30} style={{ color: "var(--accent)" }} />
      </div>
      <h1 className="font-display text-2xl font-medium text-heading">Gratis-Limit erreicht</h1>
      <p className="mt-3 text-muted">
        Du hast mit deinem kostenlosen Konto bereits 5 Themenseiten geöffnet
        {title ? <> und möchtest „{title}" ansehen</> : null}. In der kostenlosen Version ist hier Schluss.
      </p>
      <p className="mt-2 text-muted">
        Mit <strong className="text-text">StudyHub Pro</strong> bekommst du <strong className="text-text">unbegrenzten Zugang</strong> zu allen
        Themen, Karteikarten, Aufgaben und Quizfragen.
      </p>
      <Link
        href="/upgrade"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        <Sparkles size={17} /> Auf Pro upgraden
      </Link>
      <div className="mt-4">
        <Link href="/" className="text-sm text-muted hover:text-text">
          Zurück zur Übersicht
        </Link>
      </div>
    </div>
  );
}
