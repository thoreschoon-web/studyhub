import "server-only";

type Result = { ok: boolean; retryAfter: number };

/* ---------------- In-memory fallback (per serverless instance) ---------------- */
const store = new Map<string, number[]>();
const MAX_AGE = 3_600_000; // 1h — longest tracked window; bounds memory
let lastPrune = Date.now();

function memRateLimit(key: string, limit: number, windowMs: number): Result {
  const now = Date.now();
  if (now - lastPrune > 60_000) {
    lastPrune = now;
    for (const [k, v] of store) {
      const kept = v.filter((t) => now - t < MAX_AGE);
      if (kept.length) store.set(k, kept);
      else store.delete(k);
    }
    if (store.size > 20_000) store.clear();
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

/* ---------------- Distributed limiter via Upstash Redis REST (no SDK) ---------------- */
// Supports both the Vercel KV (KV_REST_API_*) and Upstash (UPSTASH_REDIS_REST_*) env names.
function kvCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function kvRateLimit(key: string, limit: number, windowMs: number): Promise<Result | null> {
  const creds = kvCreds();
  if (!creds) return null; // not configured → caller uses in-memory
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const k = `rl:${key}`;
  try {
    // Atomic fixed-window: start the window+expiry once (SET ... NX), then INCR; read TTL for Retry-After.
    const res = await fetch(`${creds.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${creds.token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SET", k, "0", "EX", String(windowSec), "NX"],
        ["INCR", k],
        ["TTL", k],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(1000), // never let the limiter stall a request
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    const count = Number(data?.[1]?.result ?? NaN);
    const ttl = Number(data?.[2]?.result ?? windowSec);
    if (!Number.isFinite(count) || count <= 0) return null; // unexpected → fall back
    if (count > limit) return { ok: false, retryAfter: ttl > 0 ? ttl : windowSec };
    return { ok: true, retryAfter: 0 };
  } catch {
    return null; // network/timeout/JSON error → caller falls back (fail-open, never blocks legit users)
  }
}

/**
 * Per-key rate limit. Uses Upstash Redis (distributed, hard cross-instance guarantee)
 * when KV_REST_API_URL/TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) are set; otherwise falls
 * back to a best-effort in-memory limiter. Resilient: any KV error or >1s timeout falls
 * back rather than blocking the request.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<Result> {
  const kv = await kvRateLimit(key, limit, windowMs);
  return kv ?? memRateLimit(key, limit, windowMs);
}

/** Which limiter backend is active (for diagnostics). */
export function rateLimitBackend(): "kv" | "memory" {
  return kvCreds() ? "kv" : "memory";
}
