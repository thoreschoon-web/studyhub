import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Stable slug from arbitrary text. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Fisher–Yates shuffle returning a new array (seedable for stable order). */
export function shuffle<T>(arr: T[], seed = Math.floor(Date.now() / 86400000)): T[] {
  const a = [...arr];
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}
