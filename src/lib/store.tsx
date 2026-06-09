"use client";

import { useCallback, useSyncExternalStore } from "react";
import { sm2, type SrsCard } from "@/lib/srs";

export { sm2, isDue } from "@/lib/srs";
export type { SrsCard } from "@/lib/srs";

/* ============================================================================
   Per-account progress — server-backed (DB), with the SAME public API the
   components already use. Optimistic updates with rollback on a free-tier
   limit (dispatches a "studyhub:limit" event the UpgradeModal listens for).
============================================================================ */

export interface TopicProgress {
  sectionsRead: string[];
  quizSeen: string[];
  quizCorrect: string[];
  exercisesDone: string[];
  lastSeen: number;
}

export interface ExamAttempt {
  id: string;
  subjectId: string;
  label: string;
  date: number;
  durationSec: number;
  selfScore: number;
  /** Pro Frage: Frage-ID, Topic-ID, korrekt — Basis für die Themen-Auswertung. */
  detail?: { q: string; t: string; ok: boolean }[];
}

export interface StoreState {
  topics: Record<string, TopicProgress>;
  srs: Record<string, SrsCard>;
  exams: ExamAttempt[];
}

const EMPTY: StoreState = { topics: {}, srs: {}, exams: [] };
const SERVER: StoreState = EMPTY;

let state: StoreState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function set(next: StoreState) {
  state = next;
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(state), [selector]),
    useCallback(() => selector(SERVER), [selector]),
  );
}

/** Load the signed-in user's progress once (called by <ProgressBootstrap/>). */
export async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const r = await fetch("/api/progress");
    if (r.ok) {
      const d = (await r.json()) as Partial<StoreState>;
      set({ topics: d.topics ?? {}, srs: d.srs ?? {}, exams: d.exams ?? [] });
    }
  } catch {
    // offline: keep empty
  }
}

function ensure(s: StoreState, id: string): TopicProgress {
  return s.topics[id] ?? { sectionsRead: [], quizSeen: [], quizCorrect: [], exercisesDone: [], lastSeen: 0 };
}

// Optimistic reducer — mirrors the server logic so the UI updates instantly.
function reduce(s: StoreState, action: string, a: Record<string, unknown>): StoreState {
  switch (action) {
    case "markSection": {
      const t = ensure(s, a.topicId as string);
      if (t.sectionsRead.includes(a.sectionId as string)) return s;
      return { ...s, topics: { ...s.topics, [a.topicId as string]: { ...t, sectionsRead: [...t.sectionsRead, a.sectionId as string], lastSeen: Date.now() } } };
    }
    case "recordQuiz": {
      const t = ensure(s, a.topicId as string);
      const qid = a.questionId as string;
      const seen = t.quizSeen.includes(qid) ? t.quizSeen : [...t.quizSeen, qid];
      let cor = t.quizCorrect;
      if (a.correct && !cor.includes(qid)) cor = [...cor, qid];
      if (!a.correct) cor = cor.filter((q) => q !== qid);
      return { ...s, topics: { ...s.topics, [a.topicId as string]: { ...t, quizSeen: seen, quizCorrect: cor, lastSeen: Date.now() } } };
    }
    case "toggleExercise": {
      const t = ensure(s, a.topicId as string);
      const exId = a.exId as string;
      const done = t.exercisesDone.includes(exId) ? t.exercisesDone.filter((e) => e !== exId) : [...t.exercisesDone, exId];
      return { ...s, topics: { ...s.topics, [a.topicId as string]: { ...t, exercisesDone: done, lastSeen: Date.now() } } };
    }
    case "gradeCard": {
      const prev = s.srs[a.cardId as string] ?? { reps: 0, ease: 2.5, interval: 0, due: 0 };
      return { ...s, srs: { ...s.srs, [a.cardId as string]: sm2(prev, a.quality as number) } };
    }
    case "addExam":
      return { ...s, exams: [a.exam as ExamAttempt, ...s.exams].slice(0, 100) };
    case "resetTopic": {
      const rest = { ...s.topics };
      delete rest[a.topicId as string];
      return { ...s, topics: rest };
    }
    default:
      return s;
  }
}

async function dispatch(action: string, args: Record<string, unknown>) {
  const prev = state;
  const next = reduce(prev, action, args);
  if (next !== prev) set(next);
  try {
    const r = await fetch("/api/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, args }) });
    if (r.ok) {
      const j = (await r.json()) as { limit?: string };
      if (j?.limit) {
        set(prev); // roll back the optimistic change
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("studyhub:limit", { detail: j.limit }));
      }
    }
    if (action === "resetSubject" || action === "resetTopic") {
      hydrated = false;
      await hydrate();
    }
  } catch {
    // offline: keep optimistic state
  }
}

export const actions = {
  markSection: (topicId: string, sectionId: string) => dispatch("markSection", { topicId, sectionId }),
  recordQuiz: (topicId: string, questionId: string, correct: boolean) => dispatch("recordQuiz", { topicId, questionId, correct }),
  toggleExercise: (topicId: string, exId: string) => dispatch("toggleExercise", { topicId, exId }),
  gradeCard: (cardId: string, quality: number) => dispatch("gradeCard", { cardId, quality }),
  addExam: (exam: ExamAttempt) => dispatch("addExam", { exam }),
  resetSubject: (prefix: string) => dispatch("resetSubject", { prefix }),
  resetTopic: (topicId: string) => dispatch("resetTopic", { topicId }),
};
