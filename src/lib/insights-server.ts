import "server-only";
import { db } from "@/lib/db";
import { getAllTopics } from "@/lib/content";
import type { SubjectId } from "@/lib/types";

export type WeakTopic = {
  topicId: string;
  subjectId: SubjectId;
  title: string;
  accuracy: number; // 0..1
  answered: number;
};

export type SubjectReadiness = {
  subjectId: SubjectId;
  percent: number; // 0..100
  topicsTouched: number;
  topicsTotal: number;
};

export type Insights = {
  dueCards: number;
  weakTopics: WeakTopic[];
  readiness: SubjectReadiness[];
};

const parseIds = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

/**
 * Lern-Insights fürs Dashboard: fällige Karten, schwache Themen (Quiz-Quote < 60 %
 * bei ≥ 5 beantworteten Fragen) und ein Bereitschafts-Score pro Fach.
 * Score pro Thema: 40 % gelesene Abschnitte, 40 % Quiz (Abdeckung × Trefferquote),
 * 20 % erledigte Aufgaben — gemittelt über ALLE Themen des Fachs (Unberührtes zählt 0).
 */
export async function getInsights(userId: string): Promise<Insights> {
  const [dueCards, progress] = await Promise.all([
    db.srsCard.count({ where: { userId, due: { lte: new Date() } } }),
    db.topicProgress.findMany({ where: { userId } }),
  ]);

  const topics = getAllTopics();
  const progressByTopic = new Map(progress.map((p) => [p.topicId, p]));

  const weakTopics: WeakTopic[] = [];
  const bySubject = new Map<SubjectId, { sum: number; total: number; touched: number }>();

  for (const t of topics) {
    const agg = bySubject.get(t.subjectId) ?? { sum: 0, total: 0, touched: 0 };
    agg.total += 1;

    const p = progressByTopic.get(t.id);
    if (p) {
      agg.touched += 1;
      const read = parseIds(p.sectionsRead).length;
      const seen = parseIds(p.quizSeen).length;
      const correct = parseIds(p.quizCorrect).length;
      const done = parseIds(p.exercisesDone).length;

      const accuracy = seen > 0 ? correct / seen : 0;
      if (seen >= 5 && accuracy < 0.6) {
        weakTopics.push({ topicId: t.id, subjectId: t.subjectId, title: t.title, accuracy, answered: seen });
      }

      const readShare = t.sections.length ? Math.min(1, read / t.sections.length) : 0;
      const quizShare = t.quiz.length ? Math.min(1, seen / t.quiz.length) * accuracy : 0;
      const exShare = t.exercises.length ? Math.min(1, done / t.exercises.length) : 0;
      agg.sum += 0.4 * readShare + 0.4 * quizShare + 0.2 * exShare;
    }
    bySubject.set(t.subjectId, agg);
  }

  weakTopics.sort((a, b) => a.accuracy - b.accuracy);

  const readiness: SubjectReadiness[] = [...bySubject.entries()].map(([subjectId, a]) => ({
    subjectId,
    percent: a.total ? Math.round((a.sum / a.total) * 100) : 0,
    topicsTouched: a.touched,
    topicsTotal: a.total,
  }));

  return { dueCards, weakTopics: weakTopics.slice(0, 3), readiness };
}
