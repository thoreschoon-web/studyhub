import "server-only";

/**
 * Tiny in-memory sliding-window rate limiter, keyed by an arbitrary string
 * (e.g. `chat:b:<userId>`). Best-effort on serverless: state is per-instance and
 * resets on cold start. Combined with auth gating, input caps and capped
 * max_tokens it makes API-token-cost abuse impractical. For hard, cross-instance
 * guarantees, back this with Upstash/Vercel KV (drop-in replacement).
 */
const store = new Map<string, number[]>();
const MAX_AGE = 3_600_000; // 1h — the longest window we track; bounds memory
let lastPrune = Date.now();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();

  // Periodically drop stale entries so the map can't grow unbounded.
  if (now - lastPrune > 60_000) {
    lastPrune = now;
    for (const [k, v] of store) {
      const kept = v.filter((t) => now - t < MAX_AGE);
      if (kept.length) store.set(k, kept);
      else store.delete(k);
    }
    if (store.size > 20_000) store.clear(); // hard safety cap
  }

  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    store.set(key, hits);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  store.set(key, hits);
  return { ok: true, retryAfter: 0 };
}
