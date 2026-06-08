import "server-only";
import { db } from "@/lib/db";
import { sm2 } from "@/lib/srs";
import { isUnlimited } from "@/lib/session";
import { FREE_LIMITS, type LimitKind } from "@/lib/limits";
import { getAllTopics, getSubjectTopics } from "@/lib/content";
import type { User } from "@prisma/client";

const parseArr = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export interface StoreStateDTO {
  topics: Record<string, { sectionsRead: string[]; quizSeen: string[]; quizCorrect: string[]; exercisesDone: string[]; lastSeen: number }>;
  srs: Record<string, { reps: number; ease: number; interval: number; due: number }>;
  exams: { id: string; subjectId: string; label: string; date: number; durationSec: number; selfScore: number }[];
}

export type ActionResult = { ok: true } | { limit: LimitKind };

/** Assemble the full client-shaped progress state for a user. */
export async function getUserStore(userId: string): Promise<StoreStateDTO> {
  const [tps, cards, exams] = await Promise.all([
    db.topicProgress.findMany({ where: { userId } }),
    db.srsCard.findMany({ where: { userId } }),
    db.examAttempt.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 100 }),
  ]);

  const topics: StoreStateDTO["topics"] = {};
  for (const t of tps)
    topics[t.topicId] = {
      sectionsRead: parseArr(t.sectionsRead),
      quizSeen: parseArr(t.quizSeen),
      quizCorrect: parseArr(t.quizCorrect),
      exercisesDone: parseArr(t.exercisesDone),
      lastSeen: t.lastSeen.getTime(),
    };

  const srs: StoreStateDTO["srs"] = {};
  for (const c of cards) srs[c.cardId] = { reps: c.reps, ease: c.ease, interval: c.interval, due: c.due.getTime() };

  return {
    topics,
    srs,
    exams: exams.map((e) => ({ id: e.id, subjectId: e.subjectId, label: e.label, date: e.date.getTime(), durationSec: e.durationSec, selfScore: e.selfScore })),
  };
}

/* ---------- helpers ---------- */
type TopicArrays = { sectionsRead: string[]; quizSeen: string[]; quizCorrect: string[]; exercisesDone: string[] };

async function loadTopic(userId: string, topicId: string): Promise<TopicArrays> {
  const t = await db.topicProgress.findUnique({ where: { userId_topicId: { userId, topicId } } });
  return t
    ? { sectionsRead: parseArr(t.sectionsRead), quizSeen: parseArr(t.quizSeen), quizCorrect: parseArr(t.quizCorrect), exercisesDone: parseArr(t.exercisesDone) }
    : { sectionsRead: [], quizSeen: [], quizCorrect: [], exercisesDone: [] };
}

async function saveTopic(userId: string, topicId: string, next: TopicArrays) {
  const data = {
    sectionsRead: JSON.stringify(next.sectionsRead),
    quizSeen: JSON.stringify(next.quizSeen),
    quizCorrect: JSON.stringify(next.quizCorrect),
    exercisesDone: JSON.stringify(next.exercisesDone),
    lastSeen: new Date(),
  };
  await db.topicProgress.upsert({ where: { userId_topicId: { userId, topicId } }, create: { userId, topicId, ...data }, update: data });
}

async function usageCount(userId: string, field: "flashcardsRead" | "exercisesDone" | "quizAnswered"): Promise<number> {
  const u = await db.usage.findUnique({ where: { userId } });
  return u ? (u[field] as number) : 0;
}

async function bumpUsage(userId: string, field: "flashcardsRead" | "exercisesDone" | "quizAnswered") {
  await db.usage.upsert({ where: { userId }, create: { userId, [field]: 1 }, update: { [field]: { increment: 1 } } });
}

/** Record opening a distinct topic page. Returns true if allowed, false if over the free page limit. */
export async function recordPageOpen(user: User, topicId: string): Promise<boolean> {
  if (isUnlimited(user)) return true;
  const u = await db.usage.findUnique({ where: { userId: user.id } });
  const opened = u ? parseArr(u.pagesOpened) : [];
  if (opened.includes(topicId)) return true; // free re-visit
  if (opened.length >= FREE_LIMITS.pages) return false;
  opened.push(topicId);
  await db.usage.upsert({ where: { userId: user.id }, create: { userId: user.id, pagesOpened: JSON.stringify(opened) }, update: { pagesOpened: JSON.stringify(opened) } });
  return true;
}

/* ---------- action dispatch (with free-tier enforcement) ---------- */
export async function applyAction(user: User, action: string, args: Record<string, unknown>): Promise<ActionResult> {
  const unlimited = isUnlimited(user);
  const uid = user.id;

  switch (action) {
    case "markSection": {
      const topicId = String(args.topicId), sectionId = String(args.sectionId);
      const cur = await loadTopic(uid, topicId);
      if (!cur.sectionsRead.includes(sectionId)) cur.sectionsRead.push(sectionId);
      await saveTopic(uid, topicId, cur);
      return { ok: true };
    }
    case "recordQuiz": {
      const topicId = String(args.topicId), questionId = String(args.questionId), correct = !!args.correct;
      const cur = await loadTopic(uid, topicId);
      const isNew = !cur.quizSeen.includes(questionId);
      if (isNew && !unlimited && (await usageCount(uid, "quizAnswered")) >= FREE_LIMITS.quiz) return { limit: "quiz" };
      if (isNew) cur.quizSeen.push(questionId);
      if (correct) {
        if (!cur.quizCorrect.includes(questionId)) cur.quizCorrect.push(questionId);
      } else {
        cur.quizCorrect = cur.quizCorrect.filter((q) => q !== questionId);
      }
      await saveTopic(uid, topicId, cur);
      if (isNew) await bumpUsage(uid, "quizAnswered");
      return { ok: true };
    }
    case "toggleExercise": {
      const topicId = String(args.topicId), exId = String(args.exId);
      const cur = await loadTopic(uid, topicId);
      const wasDone = cur.exercisesDone.includes(exId);
      if (!wasDone && !unlimited && (await usageCount(uid, "exercisesDone")) >= FREE_LIMITS.exercises) return { limit: "exercises" };
      cur.exercisesDone = wasDone ? cur.exercisesDone.filter((e) => e !== exId) : [...cur.exercisesDone, exId];
      await saveTopic(uid, topicId, cur);
      if (!wasDone) await bumpUsage(uid, "exercisesDone");
      return { ok: true };
    }
    case "gradeCard": {
      const cardId = String(args.cardId), quality = Number(args.quality);
      const existing = await db.srsCard.findUnique({ where: { userId_cardId: { userId: uid, cardId } } });
      if (!existing && !unlimited && (await usageCount(uid, "flashcardsRead")) >= FREE_LIMITS.flashcards) return { limit: "flashcards" };
      const prev = existing ? { reps: existing.reps, ease: existing.ease, interval: existing.interval, due: existing.due.getTime() } : { reps: 0, ease: 2.5, interval: 0, due: 0 };
      const next = sm2(prev, quality);
      await db.srsCard.upsert({
        where: { userId_cardId: { userId: uid, cardId } },
        create: { userId: uid, cardId, reps: next.reps, ease: next.ease, interval: next.interval, due: new Date(next.due) },
        update: { reps: next.reps, ease: next.ease, interval: next.interval, due: new Date(next.due) },
      });
      if (!existing) await bumpUsage(uid, "flashcardsRead");
      return { ok: true };
    }
    case "addExam": {
      const e = args.exam as { subjectId: string; label: string; date: number; durationSec: number; selfScore: number };
      await db.examAttempt.create({ data: { userId: uid, subjectId: e.subjectId, label: e.label, date: new Date(e.date || Date.now()), durationSec: e.durationSec, selfScore: e.selfScore } });
      return { ok: true };
    }
    case "resetTopic": {
      const topicId = String(args.topicId);
      const topic = getAllTopics().find((t) => t.id === topicId);
      const cardIds = topic ? topic.flashcards.map((c) => c.id) : [];
      await db.topicProgress.deleteMany({ where: { userId: uid, topicId } });
      if (cardIds.length) await db.srsCard.deleteMany({ where: { userId: uid, cardId: { in: cardIds } } });
      return { ok: true };
    }
    case "resetSubject": {
      const subjectId = String(args.prefix ?? args.subjectId);
      const topics = getSubjectTopics(subjectId as never);
      const topicIds = topics.map((t) => t.id);
      const cardIds = topics.flatMap((t) => t.flashcards.map((c) => c.id));
      if (topicIds.length) await db.topicProgress.deleteMany({ where: { userId: uid, topicId: { in: topicIds } } });
      if (cardIds.length) await db.srsCard.deleteMany({ where: { userId: uid, cardId: { in: cardIds } } });
      return { ok: true };
    }
    default:
      return { ok: true };
  }
}
