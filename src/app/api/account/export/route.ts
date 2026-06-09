import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

/** DSGVO Art. 20 — Export aller gespeicherten Konto- und Lerndaten als JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const [topicProgress, srsCards, examAttempts, usage] = await Promise.all([
    db.topicProgress.findMany({ where: { userId: user.id } }),
    db.srsCard.findMany({ where: { userId: user.id } }),
    db.examAttempt.findMany({ where: { userId: user.id } }),
    db.usage.findUnique({ where: { userId: user.id } }),
  ]);

  const parse = (s: string) => {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  };

  const data = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      plan: user.plan,
      createdAt: user.createdAt,
      // bewusst NICHT enthalten: passwordHash, Stripe-interne Referenzen
    },
    topicProgress: topicProgress.map((p) => ({
      topicId: p.topicId,
      sectionsRead: parse(p.sectionsRead),
      quizSeen: parse(p.quizSeen),
      quizCorrect: parse(p.quizCorrect),
      exercisesDone: parse(p.exercisesDone),
      lastSeen: p.lastSeen,
    })),
    srsCards,
    examAttempts,
    usage: usage ? { ...usage, pagesOpened: parse(usage.pagesOpened) } : null,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="studyhub-datenexport.json"',
      "Cache-Control": "no-store",
    },
  });
}
