"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Question, SubjectId } from "@/lib/types";
import { Markdown } from "@/components/content/Markdown";
import { actions } from "@/lib/store";
import { cn, shuffle } from "@/lib/utils";
import { Clock, Check, X, ChevronLeft, ChevronRight, Flag, RotateCcw, Target } from "lucide-react";

export interface Pool {
  subjectId: SubjectId;
  title: string;
  short: string;
  accent: string;
  icon: string;
  questions: Question[];
}

type Answer = { value: number | number[] | boolean | string | null };

export function ExamSimulator({ pools, topicTitles = {} }: { pools: Pool[]; topicTitles?: Record<string, string> }) {
  const available = pools.filter((p) => p.questions.length);
  const [phase, setPhase] = useState<"setup" | "running" | "done">("setup");
  const [pool, setPool] = useState<Pool | null>(available[0] ?? null);
  const [count, setCount] = useState(10);
  const [minutes, setMinutes] = useState(20);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [cur, setCur] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const remaining = Math.max(0, Math.round((deadline - now) / 1000));
  useEffect(() => {
    if (phase === "running" && minutes > 0 && remaining === 0 && now > 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  function start() {
    if (!pool) return;
    const qs = shuffle(pool.questions, Date.now() % 100000).slice(0, Math.min(count, pool.questions.length));
    setQuestions(qs);
    setAnswers({});
    setCur(0);
    startRef.current = Date.now();
    setDeadline(Date.now() + minutes * 60_000);
    setNow(Date.now());
    setPhase("running");
  }

  function finish() {
    setPhase("done");
    const detail = questions.map((q) => ({ q: q.id, t: q.topicId, ok: grade(q, answers[q.id]?.value ?? null) }));
    const correct = detail.filter((d) => d.ok).length;
    const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    actions.addExam({
      id: `${pool?.subjectId}-${startRef.current}`,
      subjectId: pool?.subjectId ?? "",
      label: `${pool?.short} · ${questions.length} Fragen`,
      date: startRef.current,
      durationSec: Math.round((Date.now() - startRef.current) / 1000),
      selfScore: score,
      detail,
    });
  }

  if (!available.length)
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
        Sobald Quizfragen generiert sind, kannst du hier Klausuren unter Zeitdruck simulieren.
      </div>
    );

  if (phase === "setup")
    return (
      <div className="rounded-2xl border border-line bg-surface/50 p-6" style={{ "--accent": pool?.accent } as React.CSSProperties}>
        <h2 className="mb-4 text-lg font-semibold">Klausur konfigurieren</h2>
        <Field label="Fach">
          <div className="flex flex-wrap gap-2">
            {available.map((p) => (
              <button
                key={p.subjectId}
                onClick={() => setPool(p)}
                className={cn("rounded-full border px-3 py-1.5 text-sm", pool?.subjectId === p.subjectId ? "text-text" : "text-muted")}
                style={pool?.subjectId === p.subjectId ? { borderColor: p.accent, background: `color-mix(in oklab, ${p.accent} 14%, transparent)`, color: p.accent } : { borderColor: "var(--color-line)" }}
              >
                {p.icon} {p.short} · {p.questions.length}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Anzahl Fragen">
          <Segmented value={count} onChange={setCount} options={[10, 20, 30].filter((n) => n <= (pool?.questions.length ?? 0) || n === 10)} />
        </Field>
        <Field label="Zeit">
          <Segmented value={minutes} onChange={setMinutes} options={[10, 20, 40, 0]} render={(v) => (v === 0 ? "ohne" : `${v} min`)} />
        </Field>
        <button onClick={start} className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white" style={{ background: pool?.accent }}>
          Klausur starten
        </button>
      </div>
    );

  if (phase === "done") {
    const correct = questions.filter((q) => grade(q, answers[q.id]?.value ?? null)).length;
    const score = Math.round((correct / questions.length) * 100);

    // Themen-Auswertung: Trefferquote pro Topic, schwächste zuerst.
    const byTopic = new Map<string, { ok: number; total: number }>();
    for (const q of questions) {
      const agg = byTopic.get(q.topicId) ?? { ok: 0, total: 0 };
      agg.total += 1;
      if (grade(q, answers[q.id]?.value ?? null)) agg.ok += 1;
      byTopic.set(q.topicId, agg);
    }
    const topicRows = [...byTopic.entries()]
      .map(([topicId, a]) => ({ topicId, ...a, pct: Math.round((a.ok / a.total) * 100) }))
      .sort((a, b) => a.pct - b.pct);

    return (
      <div style={{ "--accent": pool?.accent } as React.CSSProperties}>
        <div className="mb-6 rounded-2xl border border-line bg-surface/60 p-6 text-center">
          <div className="text-4xl font-semibold tabular-nums" style={{ color: pool?.accent }}>{score}%</div>
          <p className="mt-1 text-sm text-muted">{correct} von {questions.length} richtig · {Math.round((Date.now() - startRef.current) / 60000)} min</p>
          <button onClick={() => setPhase("setup")} className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium">
            <RotateCcw size={15} /> Neue Klausur
          </button>
        </div>

        {topicRows.length > 1 && (
          <div className="mb-6 rounded-2xl border border-line bg-surface/40 p-5">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-heading">
              <Target size={15} style={{ color: pool?.accent }} /> Auswertung nach Thema
            </div>
            <ul className="space-y-2">
              {topicRows.map((row) => (
                <li key={row.topicId} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/${pool?.subjectId}/${row.topicId}`} className="line-clamp-1 text-text hover:underline">
                    {topicTitles[row.topicId] ?? row.topicId}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="numeral font-mono text-xs text-muted">{row.ok}/{row.total}</span>
                    <span className={cn("numeral w-12 text-right font-mono text-xs", row.pct < 60 ? "text-bad" : "text-ok")}>{row.pct} %</span>
                  </span>
                </li>
              ))}
            </ul>
            {topicRows[0] && topicRows[0].pct < 60 && (
              <Link
                href={`/${pool?.subjectId}/${topicRows[0].topicId}`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ background: pool?.accent }}
              >
                Gezielt üben: {topicTitles[topicRows[0].topicId] ?? topicRows[0].topicId}
              </Link>
            )}
          </div>
        )}

        <div className="space-y-3">
          {questions.map((q, i) => {
            const given = answers[q.id]?.value ?? null;
            const ok = grade(q, given);
            return (
              <div key={q.id} className="rounded-xl border border-line bg-surface/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={cn("grid h-5 w-5 place-items-center rounded-full", ok ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad")}>
                      {ok ? <Check size={13} /> : <X size={13} />}
                    </span>
                    Frage {i + 1}
                  </div>
                  <span className="line-clamp-1 text-xs text-faint">{topicTitles[q.topicId] ?? ""}</span>
                </div>
                <div className="text-sm [&_.prose]:my-0 [&_.prose]:text-sm"><Markdown>{q.prompt}</Markdown></div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className={cn("rounded-lg border p-3 text-sm", ok ? "border-ok/30 bg-ok/5" : "border-bad/30 bg-bad/5")}>
                    <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Deine Antwort</div>
                    <span className="[&_.prose]:my-0 [&_.prose]:text-sm"><Markdown>{givenLabel(q, given)}</Markdown></span>
                  </div>
                  <div className="rounded-lg border border-line bg-surface/50 p-3 text-sm">
                    <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Richtige Antwort</div>
                    <span className="[&_.prose]:my-0 [&_.prose]:text-sm"><Markdown>{correctLabel(q)}</Markdown></span>
                  </div>
                </div>
                {q.explanation && (
                  <div className="mt-2 rounded-lg border border-line bg-surface/50 p-3 text-sm [&_.prose]:text-sm">
                    <Markdown>{q.explanation}</Markdown>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // running
  const q = questions[cur];
  return (
    <div style={{ "--accent": pool?.accent } as React.CSSProperties}>
      <div className="sticky top-0 z-10 mb-5 flex items-center justify-between rounded-xl border border-line bg-bg-soft/90 px-4 py-2.5 backdrop-blur">
        <span className="text-sm text-muted">Frage {cur + 1} / {questions.length}</span>
        {minutes > 0 && (
          <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium tabular-nums", remaining < 60 && "text-bad")}>
            <Clock size={15} /> {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
          </span>
        )}
        <button onClick={finish} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ background: pool?.accent }}>
          <Flag size={14} /> Abgeben
        </button>
      </div>

      <div className="mb-4 text-[1.05rem] font-medium [&_.prose]:my-0"><Markdown>{q.prompt}</Markdown></div>
      <ExamInput q={q} answer={answers[q.id]} onChange={(value) => setAnswers((a) => ({ ...a, [q.id]: { value } }))} />

      <div className="mt-6 flex items-center justify-between">
        <button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={cur === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm disabled:opacity-40">
          <ChevronLeft size={15} /> Zurück
        </button>
        {cur + 1 < questions.length ? (
          <button onClick={() => setCur((c) => c + 1)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm">
            Weiter <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={finish} className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: pool?.accent }}>
            <Flag size={14} /> Abgeben
          </button>
        )}
      </div>
    </div>
  );
}

function ExamInput({ q, answer, onChange }: { q: Question; answer?: Answer; onChange: (v: Answer["value"]) => void }) {
  if (q.kind === "mc") {
    const multiple = q.multiple ?? q.correct.length > 1;
    const picked = (Array.isArray(answer?.value) ? answer.value : []) as number[];
    return (
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const sel = picked.includes(i);
          return (
            <button
              key={i}
              onClick={() => onChange(multiple ? (sel ? picked.filter((x) => x !== i) : [...picked, i]) : [i])}
              className={cn("flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm", sel ? "border-[color:var(--accent)] bg-surface-2" : "border-line hover:bg-surface-2")}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-semibold">{String.fromCharCode(65 + i)}</span>
              <span className="[&_.prose]:my-0 [&_.prose]:text-sm"><Markdown>{opt}</Markdown></span>
            </button>
          );
        })}
      </div>
    );
  }
  if (q.kind === "truefalse")
    return (
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <button key={String(v)} onClick={() => onChange(v)} className={cn("flex-1 rounded-xl border px-4 py-3 text-sm font-medium", answer?.value === v ? "border-[color:var(--accent)] bg-surface-2" : "border-line")}>
            {v ? "Wahr" : "Falsch"}
          </button>
        ))}
      </div>
    );
  if (q.kind === "numeric")
    return (
      <input
        value={(answer?.value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        placeholder="Ergebnis…"
        className="w-48 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm tabular-nums focus:border-[color:var(--accent)] focus:outline-none"
      />
    );
  return (
    <textarea
      value={(answer?.value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      placeholder="Antwort…"
      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
    />
  );
}

/** Antwort des Nutzers als lesbarer Text (für das Review). */
function givenLabel(q: Question, v: Answer["value"]): string {
  if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return "_keine Antwort_";
  if (q.kind === "mc") {
    const picked = (Array.isArray(v) ? v : []) as number[];
    return picked
      .slice()
      .sort((a, b) => a - b)
      .map((i) => `**${String.fromCharCode(65 + i)})** ${q.options[i] ?? ""}`)
      .join(" · ");
  }
  if (q.kind === "truefalse") return v ? "Wahr" : "Falsch";
  return String(v);
}

/** Musterlösung als lesbarer Text (für das Review). */
function correctLabel(q: Question): string {
  if (q.kind === "mc") {
    return q.correct
      .slice()
      .sort((a, b) => a - b)
      .map((i) => `**${String.fromCharCode(65 + i)})** ${q.options[i] ?? ""}`)
      .join(" · ");
  }
  if (q.kind === "truefalse") return q.answer ? "Wahr" : "Falsch";
  if (q.kind === "numeric") return `${q.answer}${q.unit ? ` ${q.unit}` : ""}${q.tolerance ? ` (±${q.tolerance})` : ""}`;
  return q.sampleAnswer;
}

export function grade(q: Question, value: Answer["value"]): boolean {
  if (value == null) return false;
  if (q.kind === "mc") {
    const v = (Array.isArray(value) ? value : []) as number[];
    return v.length === q.correct.length && v.every((x) => q.correct.includes(x));
  }
  if (q.kind === "truefalse") return value === q.answer;
  if (q.kind === "numeric") {
    const n = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) && Math.abs(n - q.answer) <= q.tolerance;
  }
  const text = String(value).toLowerCase();
  return q.keywords.length > 0 && q.keywords.filter((k) => text.includes(k.toLowerCase())).length / q.keywords.length >= 0.5;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">{label}</div>
      {children}
    </div>
  );
}

function Segmented<T extends number>({ value, onChange, options, render }: { value: T; onChange: (v: T) => void; options: T[]; render?: (v: T) => string }) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn("rounded-md px-3 py-1.5 text-sm transition-colors", value === o ? "text-white" : "text-muted hover:text-text")}
          style={value === o ? { background: "var(--accent)" } : undefined}
        >
          {render ? render(o) : o}
        </button>
      ))}
    </div>
  );
}
