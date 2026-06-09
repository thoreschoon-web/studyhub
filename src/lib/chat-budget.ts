import "server-only";
import { db } from "@/lib/db";
import { CHAT_LIMITS } from "@/lib/limits";

export type ChatBudget = { ok: boolean; remaining: number };

/**
 * Tagesbudget für den KI-Tutor (exakter DB-Zähler auf Usage, überlebt
 * Serverless-Instanzwechsel). Atomar: das bedingte updateMany verhindert,
 * dass parallele Requests über das Limit zählen.
 */
export async function consumeChatBudget(userId: string): Promise<ChatBudget> {
  const today = new Date().toISOString().slice(0, 10); // UTC-Tag
  const limit = CHAT_LIMITS.daily;

  // Normalfall: gleicher Tag, noch Budget → +1.
  const inc = await db.usage.updateMany({
    where: { userId, chatDay: today, chatMsgs: { lt: limit } },
    data: { chatMsgs: { increment: 1 } },
  });
  if (inc.count > 0) {
    const u = await db.usage.findUnique({ where: { userId }, select: { chatMsgs: true } });
    return { ok: true, remaining: Math.max(0, limit - (u?.chatMsgs ?? limit)) };
  }

  // Tageswechsel: Zähler auf den neuen Tag zurücksetzen (zählt diese Nachricht mit).
  const roll = await db.usage.updateMany({
    where: { userId, NOT: { chatDay: today } },
    data: { chatDay: today, chatMsgs: 1 },
  });
  if (roll.count > 0) return { ok: true, remaining: limit - 1 };

  // Usage-Zeile fehlt (ältere Konten) → anlegen.
  const existing = await db.usage.findUnique({ where: { userId } });
  if (!existing) {
    await db.usage.create({ data: { userId, chatDay: today, chatMsgs: 1 } });
    return { ok: true, remaining: limit - 1 };
  }

  // Gleicher Tag, Budget aufgebraucht.
  return { ok: false, remaining: 0 };
}
