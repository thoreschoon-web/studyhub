import { getCurrentUser } from "@/lib/session";
import { getUserStore, applyAction } from "@/lib/progress-server";
import { rateLimit } from "@/lib/rate-limit";
import { PROGRESS_LIMITS, PROGRESS_ACTIONS } from "@/lib/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(await getUserStore(user.id));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // Reject pathological payloads + rate limit (defense-in-depth).
  const len = Number(req.headers.get("content-length") || 0);
  if (len > 50_000) return Response.json({ error: "too_large" }, { status: 413 });
  const rl = rateLimit(`prog:${user.id}`, PROGRESS_LIMITS.rate.limit, PROGRESS_LIMITS.rate.windowMs);
  if (!rl.ok) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let body: { action?: unknown; args?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Strict action allowlist (never trust the client's action string).
  const action = typeof body.action === "string" ? body.action : "";
  if (!PROGRESS_ACTIONS.includes(action)) return Response.json({ error: "bad_action" }, { status: 400 });

  const args = body.args && typeof body.args === "object" && !Array.isArray(body.args) ? (body.args as Record<string, unknown>) : {};
  if (JSON.stringify(args).length > PROGRESS_LIMITS.maxPayloadChars) {
    return Response.json({ error: "too_large" }, { status: 413 });
  }

  const result = await applyAction(user, action, args);
  return Response.json(result);
}
