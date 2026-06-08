import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatBody {
  messages: { role: "user" | "assistant"; content: string }[];
  context?: string; // optional source material for the current topic
  subject?: string;
  topic?: string;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "no_key" }, { status: 503 });
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

  const system = [
    "Du bist ein geduldiger, präziser Uni-Tutor für eine deutsche Wirtschaftswissenschafts-Studentin/einen Studenten.",
    "Antworte auf Deutsch, klar strukturiert und so, dass man es wirklich versteht. Nutze Markdown.",
    "Für Mathe/Statistik: schreibe Formeln in LaTeX mit $...$ (inline) bzw. $$...$$ (abgesetzt) und zeige den Rechenweg Schritt für Schritt.",
    "Für Privatrecht: arbeite im Gutachtenstil und nenne einschlägige Paragraphen (z.B. § 433 BGB).",
    "Sei konkret, erfinde nichts dazu. Wenn der bereitgestellte Kontext nicht reicht, sag es und gib trotzdem die beste fachliche Erklärung.",
    body.subject ? `Aktuelles Fach: ${body.subject}.` : "",
    body.topic ? `Aktuelles Thema: ${body.topic}.` : "",
    body.context ? `\n--- Auszug aus den Kursunterlagen (nutze ihn vorrangig) ---\n${body.context.slice(0, 12000)}\n--- Ende Auszug ---` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const mstream = await client.messages.create({
          model,
          max_tokens: 1800,
          system,
          messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        });
        for await (const event of mstream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n_⚠️ Fehler bei der Anfrage: ${String((e as Error).message)}_`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
