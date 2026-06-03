import { SUBJECTS } from "@/lib/subjects";
import { getSubjectTopics } from "@/lib/content";
import { KarteikartenClient, type Deck } from "@/components/karteikarten/KarteikartenClient";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default function KarteikartenPage() {
  const decks: Deck[] = SUBJECTS.map((s) => ({
    subjectId: s.id,
    title: s.title,
    short: s.short,
    accent: s.accent,
    icon: s.icon,
    cards: getSubjectTopics(s.id).flatMap((t) => t.flashcards),
  }));

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <header className="mb-7">
        <h1 className="font-display flex items-center gap-3 text-3xl font-medium tracking-tight text-white">
          <Layers size={24} /> Karteikarten
        </h1>
        <p className="mt-1 text-sm text-muted">
          Spaced-Repetition (SM-2): bewerte ehrlich, wie gut du eine Karte konntest – die App plant die Wiederholung optimal.
        </p>
      </header>
      <KarteikartenClient decks={decks} />
    </div>
  );
}
