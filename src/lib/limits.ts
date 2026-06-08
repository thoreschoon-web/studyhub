/** Free-tier usage limits (total across the whole app). Owner & paid bypass these. */
export const FREE_LIMITS = {
  pages: 5,
  flashcards: 3,
  exercises: 1,
  quiz: 3,
} as const;

export type LimitKind = keyof typeof FREE_LIMITS;

/**
 * KI-Tutor (/api/chat) guardrails against API-token cost abuse.
 * Each call is bounded (input + output), and per-user rate limits cap volume.
 */
export const CHAT_LIMITS = {
  maxMessages: 24, // history is trimmed to the last N before sending
  maxCharsPerMessage: 16000, // rejects pathological single-message pastes
  maxTotalChars: 100000, // rejects pathological total payloads
  maxContextChars: 12000, // topic source material is sliced to this
  maxOutputTokens: 1500, // caps output cost per call
  burst: { limit: 8, windowMs: 30_000 }, // per user: anti-spam burst
  hourly: { limit: 60, windowMs: 3_600_000 }, // per user: volume cap
} as const;

/** Progress API (/api/progress) input guardrails (defense-in-depth; Prisma already prevents SQLi). */
export const PROGRESS_LIMITS = {
  maxPayloadChars: 4000,
  rate: { limit: 150, windowMs: 60_000 },
} as const;

/** Only these actions are accepted by /api/progress. */
export const PROGRESS_ACTIONS: string[] = [
  "markSection",
  "recordQuiz",
  "toggleExercise",
  "gradeCard",
  "addExam",
  "resetTopic",
  "resetSubject",
];
