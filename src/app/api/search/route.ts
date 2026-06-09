import { getAllTopics } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchHit = {
  topicId: string;
  subjectId: string;
  title: string;
  summary: string;
  /** Treffer-Kontext: passende Abschnitts-Überschrift (falls der Treffer dort lag). */
  heading?: string;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ß/g, "ss");

/**
 * Themen-Suche über Titel, Zusammenfassung und Abschnitts-Überschriften.
 * Läuft über den In-Memory-Content-Cache — kein Index, keine DB. Öffentlich
 * (liefert nur Titel/Metadaten, keine Inhalte).
 */
export async function GET(req: Request) {
  const q = norm((new URL(req.url).searchParams.get("q") ?? "").trim()).slice(0, 100);
  if (q.length < 2) return Response.json({ hits: [] }, { headers: { "Cache-Control": "no-store" } });

  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { score: number; hit: SearchHit }[] = [];

  for (const t of getAllTopics()) {
    const title = norm(t.title);
    const summary = norm(t.summary ?? "");
    let score = 0;
    let heading: string | undefined;

    for (const term of terms) {
      if (title.includes(term)) {
        score += title.startsWith(term) ? 5 : 3;
      } else if (summary.includes(term)) {
        score += 1;
      } else {
        const sec = t.sections?.find((s) => norm(s.heading).includes(term));
        if (sec) {
          score += 2;
          heading ??= sec.heading;
        } else {
          score = 0; // jeder Begriff muss irgendwo treffen (UND-Suche)
          break;
        }
      }
    }

    if (score > 0) {
      scored.push({ score, hit: { topicId: t.id, subjectId: t.subjectId, title: t.title, summary: t.summary ?? "", heading } });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return Response.json({ hits: scored.slice(0, 20).map((s) => s.hit) }, { headers: { "Cache-Control": "no-store" } });
}
