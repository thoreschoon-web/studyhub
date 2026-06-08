/** Spaced-repetition (SM-2) — framework-agnostic, reused by client store + server. */

export interface SrsCard {
  reps: number;
  ease: number; // easiness factor
  interval: number; // days
  due: number; // epoch ms
}

export const DAY = 86_400_000;

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
