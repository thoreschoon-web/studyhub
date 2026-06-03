"use client";

import { useCallback, useSyncExternalStore } from "react";

/* ============================================================================
   Local persistence: progress, quiz results, spaced-repetition (SM-2), exams.
   Everything lives in localStorage — no backend, fully private to this browser.
============================================================================ */

const KEY = "studyhub.v1";

export interface SrsCard {
  reps: number;
  ease: number; // easiness factor
  interval: number; // days
  due: number; // epoch ms
}

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
  selfScore: number; // 0..100
}

export interface StoreState {
  topics: Record<string, TopicProgress>;
  srs: Record<string, SrsCard>;
  exams: ExamAttempt[];
}

const EMPTY: StoreState = { topics: {}, srs: {}, exams: [] };

let state: StoreState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): StoreState {
  if (loaded) return state;
  loaded = true;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    state = EMPTY;
  }
  return state;
}

function persist() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }
  listeners.forEach((l) => l());
}

function setState(updater: (s: StoreState) => StoreState) {
  state = updater(load());
  persist();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return load();
}
const SERVER: StoreState = EMPTY;

export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(load()), [selector]),
    useCallback(() => selector(SERVER), [selector]),
  );
}

/* ---------- topic helpers ---------- */
function ensureTopic(s: StoreState, id: string): TopicProgress {
  return (
    s.topics[id] ?? {
      sectionsRead: [],
      quizSeen: [],
      quizCorrect: [],
      exercisesDone: [],
      lastSeen: 0,
    }
  );
}

export const actions = {
  markSection(topicId: string, sectionId: string) {
    setState((s) => {
      const t = ensureTopic(s, topicId);
      if (t.sectionsRead.includes(sectionId)) return s;
      return {
        ...s,
        topics: { ...s.topics, [topicId]: { ...t, sectionsRead: [...t.sectionsRead, sectionId], lastSeen: Date.now() } },
      };
    });
  },
  recordQuiz(topicId: string, questionId: string, correct: boolean) {
    setState((s) => {
      const t = ensureTopic(s, topicId);
      const seen = t.quizSeen.includes(questionId) ? t.quizSeen : [...t.quizSeen, questionId];
      let cor = t.quizCorrect;
      if (correct && !cor.includes(questionId)) cor = [...cor, questionId];
      if (!correct) cor = cor.filter((q) => q !== questionId);
      return { ...s, topics: { ...s.topics, [topicId]: { ...t, quizSeen: seen, quizCorrect: cor, lastSeen: Date.now() } } };
    });
  },
  toggleExercise(topicId: string, exId: string) {
    setState((s) => {
      const t = ensureTopic(s, topicId);
      const done = t.exercisesDone.includes(exId)
        ? t.exercisesDone.filter((e) => e !== exId)
        : [...t.exercisesDone, exId];
      return { ...s, topics: { ...s.topics, [topicId]: { ...t, exercisesDone: done, lastSeen: Date.now() } } };
    });
  },
  gradeCard(cardId: string, quality: number) {
    setState((s) => {
      const prev = s.srs[cardId] ?? { reps: 0, ease: 2.5, interval: 0, due: 0 };
      const next = sm2(prev, quality);
      return { ...s, srs: { ...s.srs, [cardId]: next } };
    });
  },
  addExam(a: ExamAttempt) {
    setState((s) => ({ ...s, exams: [a, ...s.exams].slice(0, 100) }));
  },
  resetSubject(prefix: string) {
    setState((s) => ({
      ...s,
      topics: Object.fromEntries(Object.entries(s.topics).filter(([k]) => !k.startsWith(prefix))),
    }));
  },
};

/* ---------- SM-2 spaced repetition ---------- */
const DAY = 86_400_000;

export function sm2(card: SrsCard, q: number): SrsCard {
  let { reps, ease, interval } = card;
  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }
  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease < 1.3) ease = 1.3;
  return { reps, ease, interval, due: Date.now() + interval * DAY };
}

export function isDue(card: SrsCard | undefined): boolean {
  if (!card) return true; // never studied
  return card.due <= Date.now();
}
