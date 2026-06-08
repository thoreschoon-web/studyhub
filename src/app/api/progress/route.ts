import { getCurrentUser } from "@/lib/session";
import { getUserStore, applyAction } from "@/lib/progress-server";

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
  let body: { action?: string; args?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.action) return Response.json({ error: "no_action" }, { status: 400 });
  const result = await applyAction(user, body.action, body.args ?? {});
  return Response.json(result);
}
