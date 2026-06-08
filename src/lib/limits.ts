/** Free-tier usage limits (total across the whole app). Owner & paid bypass these. */
export const FREE_LIMITS = {
  pages: 5,
  flashcards: 3,
  exercises: 1,
  quiz: 3,
} as const;

export type LimitKind = keyof typeof FREE_LIMITS;
