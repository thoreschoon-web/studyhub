"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Markdown } from "@/components/content/Markdown";
import { Send, Sparkles, KeyRound, Loader2, Lock } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function TutorChat({
  context,
  subject,
  topic,
  suggestions = [],
  className,
  locked,
}: {
  context?: string;
  subject?: string;
  topic?: string;
  suggestions?: string[];
  className?: string;
  /** Teaser-Modus: "login" (anonym) oder "upgrade" (Free-Konto) — Eingabe gesperrt, CTA sichtbar. */
  locked?: "login" | "upgrade";
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy || locked) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-20), context, subject, topic }),
      });
      if (res.status === 503) {
        setNoKey(true);
        setMessages((m) => m.slice(0, -1));
        return;
      }
      if (res.status === 402) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "_Der KI-Tutor ist Teil des Semester-Passes. [Jetzt freischalten →](/upgrade)_",
          };
          return copy;
        });
        return;
      }
      if (res.status === 429) {
        const err = await res.json().catch(() => null);
        const daily = err?.error === "daily_limit";
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: daily
              ? "_Dein Tageslimit ist erreicht — morgen geht's weiter. (Das Limit deckelt die KI-Kosten für alle.)_"
              : "_Zu viele Anfragen — bitte einen kurzen Moment warten und erneut versuchen._",
          };
          return copy;
        });
        return;
      }
      if (!res.ok) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "_Die Anfrage konnte nicht verarbeitet werden (zu lang oder ungültig)._" };
          return copy;
        });
        return;
      }
      if (!res.body) throw new Error("Keine Antwort");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `_Fehler: ${String((e as Error).message)}_` };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={"flex h-full flex-col " + (className ?? "")}>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {messages.length === 0 && !noKey && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}>
              <Sparkles size={20} style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-sm text-muted">
              Frag mich alles {topic ? <>zu <span className="text-text">{topic}</span></> : "zu deinem Stoff"}.
            </p>
            {suggestions.length > 0 && (
              <div className="mt-4 flex flex-col items-stretch gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={!!locked}
                    className="rounded-xl border border-line bg-surface/60 px-3 py-2 text-left text-sm text-muted transition-colors hover:border-[color:var(--accent)] hover:text-text disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {locked && <LockedNotice kind={locked} />}
          </div>
        )}

        {noKey && <NoKeyNotice />}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white"
                  : "max-w-full rounded-2xl rounded-bl-md border border-line bg-surface/70 px-4 py-1 text-sm [&_.prose]:text-sm"
              }
              style={m.role === "user" ? { background: "var(--accent)" } : undefined}
            >
              {m.role === "user" ? m.content : m.content ? <Markdown>{m.content}</Markdown> : <Loader2 size={15} className="my-2 animate-spin text-muted" />}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-2 flex items-end gap-2 border-t border-line pt-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          disabled={!!locked}
          placeholder={locked ? "Mit dem Semester-Pass freischalten" : "Frage stellen…  (Enter zum Senden)"}
          className="max-h-32 flex-1 resize-none rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim() || !!locked}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)" }}
        >
          {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

function LockedNotice({ kind }: { kind: "login" | "upgrade" }) {
  return (
    <div className="mx-auto mt-4 max-w-sm rounded-xl border border-line bg-surface/60 p-4 text-center">
      <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-heading">
        <Lock size={15} style={{ color: "var(--accent)" }} />
        {kind === "login" ? "Anmelden, um den Tutor zu nutzen" : "Teil des Semester-Passes"}
      </div>
      <p className="text-sm text-muted">
        {kind === "login"
          ? "Erstelle ein kostenloses Konto, um StudyHub zu nutzen."
          : "Der KI-Tutor beantwortet deine Fragen direkt zum Kursstoff — enthalten im Semester-Pass."}
      </p>
      <Link
        href={kind === "login" ? "/login" : "/upgrade"}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        <Sparkles size={15} /> {kind === "login" ? "Anmelden" : "Semester-Pass ansehen"}
      </Link>
    </div>
  );
}

function NoKeyNotice() {
  return (
    <div className="rounded-xl border border-warn/40 bg-warn/5 p-4 text-sm">
      <div className="mb-2 flex items-center gap-2 font-semibold text-warn">
        <KeyRound size={16} /> KI-Tutor noch nicht aktiviert
      </div>
      <p className="text-muted">
        Lege im Projektordner eine Datei <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">.env.local</code> an mit:
      </p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-plot p-3 text-xs text-text">
        ANTHROPIC_API_KEY=sk-ant-...
      </pre>
      <p className="mt-2 text-muted">
        Key gibt&apos;s unter <span className="text-text">console.anthropic.com</span>. Danach den Dev-Server neu starten.
      </p>
    </div>
  );
}
