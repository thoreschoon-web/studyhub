"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { actions } from "@/lib/store";
import { Markdown } from "@/components/content/Markdown";
import { cn, shuffle } from "@/lib/utils";
import { Check, X, RotateCcw, ChevronRight, Trophy } from "lucide-react";

export function QuizEngine({ questions, topicId }: { questions: Question[]; topicId: string }) {
  const [seed, setSeed] = useState(1);
  const ordered = useMemo(() => shuffle(questions, seed * 7919), [questions, seed]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  if (!questions.length)
    return <p className="text-sm text-muted">Für dieses Thema sind noch keine Quizfragen hinterlegt.</p>;

  const q = ordered[i];
  const total = ordered.length;
  const correctCount = Object.values(results).filter(Boolean).length;

  function handleAnswer(correct: boolean) {
    setResults((r) => ({ ...r, [q.id]: correct }));
    actions.recordQuiz(q.topicId || topicId, q.id, correct);
  }

  function next() {
    if (i + 1 >= total) setDone(true);
    else setI(i + 1);
  }

  function restart() {
    setSeed((s) => s + 1);
    setI(0);
    setDone(false);
    setResults({});
  }

  if (done) {
    const pctScore = Math.round((correctCount / total) * 100);
    return (
      <div className="animate-fade-in-up rounded-2xl border border-line bg-surface/60 p-8 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full" style={{ background: "color-mix(in oklab, var(--accent) 18%, transparent)" }}>
          <Trophy size={26} style={{ color: "var(--accent)" }} />
        </div>
        <div className="text-3xl font-semibold tabular-nums">{pctScore}%</div>
        <p className="mt-1 text-sm text-muted">
          {correctCount} von {total} richtig
        </p>
        <button
          onClick={restart}
          className="mx-auto mt-5 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-surface-3"
        >
          <RotateCcw size={15} /> Nochmal üben
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span>
          Frage {i + 1} / {total}
        </span>
        <span className="tabular-nums">
          ✓ {correctCount} richtig
        </span>
      </div>
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${(i / total) * 100}%`, background: "var(--accent)" }} />
      </div>

      <QuestionCard key={q.id} q={q} onAnswer={handleAnswer} onNext={next} last={i + 1 >= total} />
    </div>
  );
}

function QuestionCard({
  q,
  onAnswer,
  onNext,
  last,
}: {
  q: Question;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  last: boolean;
}) {
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  function submit(isCorrect: boolean) {
    if (answered) return;
    setAnswered(true);
    setCorrect(isCorrect);
    onAnswer(isCorrect);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-1 flex items-center gap-2">
        <DiffBadge d={q.difficulty} />
        <span className="text-[0.7rem] uppercase tracking-wide text-faint">{kindLabel(q.kind)}</span>
      </div>
      <div className="mb-4 text-[1.05rem] font-medium leading-relaxed [&_.prose]:my-0">
        <Markdown>{q.prompt}</Markdown>
      </div>

      {q.kind === "mc" && <MC q={q} answered={answered} onSubmit={submit} />}
      {q.kind === "truefalse" && <TF q={q} answered={answered} onSubmit={submit} />}
      {q.kind === "numeric" && <Numeric q={q} answered={answered} onSubmit={submit} />}
      {q.kind === "freetext" && <FreeText q={q} answered={answered} onSubmit={submit} />}

      {answered && (
        <div className="animate-fade-in-up mt-4">
          <div
            className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", correct ? "text-ok" : "text-bad")}
          >
            {correct ? <Check size={17} /> : <X size={17} />}
            {correct ? "Richtig!" : "Nicht ganz."}
          </div>
          <div className="rounded-xl border border-line bg-surface/50 p-4 text-sm [&_.prose]:text-sm">
            <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Erklärung</div>
            <Markdown>{q.explanation}</Markdown>
          </div>
          <button
            onClick={onNext}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--accent)" }}
          >
            {last ? "Auswertung" : "Weiter"} <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- input types ---------- */

function MC({ q, answered, onSubmit }: { q: Extract<Question, { kind: "mc" }>; answered: boolean; onSubmit: (c: boolean) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const multiple = q.multiple ?? q.correct.length > 1;

  function choose(idx: number) {
    if (answered) return;
    if (multiple) setPicked((p) => (p.includes(idx) ? p.filter((x) => x !== idx) : [...p, idx]));
    else {
      setPicked([idx]);
      onSubmit(q.correct.includes(idx) && q.correct.length === 1);
    }
  }
  function check() {
    const ok = picked.length === q.correct.length && picked.every((p) => q.correct.includes(p));
    onSubmit(ok);
  }

  return (
    <div className="space-y-2">
      {q.options.map((opt, idx) => {
        const isCorrect = q.correct.includes(idx);
        const isPicked = picked.includes(idx);
        return (
          <button
            key={idx}
            onClick={() => choose(idx)}
            disabled={answered}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
              !answered && "hover:border-[color:var(--accent)] hover:bg-surface-2",
              !answered && isPicked && "border-[color:var(--accent)] bg-surface-2",
              answered && isCorrect && "border-ok/50 bg-ok/10",
              answered && !isCorrect && isPicked && "border-bad/50 bg-bad/10",
              answered && !isCorrect && !isPicked && "opacity-50",
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-semibold",
                multiple ? "rounded-md" : "rounded-full",
              )}
            >
              {answered && isCorrect ? <Check size={13} /> : answered && isPicked ? <X size={13} /> : String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1 [&_.prose]:my-0 [&_.prose]:text-sm">
              <Markdown>{opt}</Markdown>
            </span>
          </button>
        );
      })}
      {multiple && !answered && (
        <button
          onClick={check}
          disabled={!picked.length}
          className="mt-1 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Antwort prüfen
        </button>
      )}
    </div>
  );
}

function TF({ q, answered, onSubmit }: { q: Extract<Question, { kind: "truefalse" }>; answered: boolean; onSubmit: (c: boolean) => void }) {
  const [picked, setPicked] = useState<boolean | null>(null);
  return (
    <div className="flex gap-3">
      {[true, false].map((val) => {
        const isPicked = picked === val;
        const isCorrect = q.answer === val;
        return (
          <button
            key={String(val)}
            onClick={() => {
              if (answered) return;
              setPicked(val);
              onSubmit(val === q.answer);
            }}
            disabled={answered}
            className={cn(
              "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
              !answered && "hover:border-[color:var(--accent)] hover:bg-surface-2",
              answered && isCorrect && "border-ok/50 bg-ok/10 text-ok",
              answered && isPicked && !isCorrect && "border-bad/50 bg-bad/10 text-bad",
              answered && !isPicked && !isCorrect && "opacity-50",
            )}
          >
            {val ? "Wahr" : "Falsch"}
          </button>
        );
      })}
    </div>
  );
}

function Numeric({ q, answered, onSubmit }: { q: Extract<Question, { kind: "numeric" }>; answered: boolean; onSubmit: (c: boolean) => void }) {
  const [val, setVal] = useState("");
  function check() {
    const n = parseFloat(val.replace(",", "."));
    onSubmit(Number.isFinite(n) && Math.abs(n - q.answer) <= q.tolerance);
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !answered && check()}
          disabled={answered}
          placeholder="Ergebnis…"
          className="w-44 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm tabular-nums focus:border-[color:var(--accent)] focus:outline-none"
        />
        {q.unit && <span className="text-sm text-muted">{q.unit}</span>}
      </div>
      {!answered ? (
        <button onClick={check} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
          Prüfen
        </button>
      ) : (
        <span className="text-sm text-muted">
          Lösung: <span className="font-semibold text-text tabular-nums">{q.answer}{q.unit ? ` ${q.unit}` : ""}</span>
        </span>
      )}
    </div>
  );
}

function FreeText({ q, answered, onSubmit }: { q: Extract<Question, { kind: "freetext" }>; answered: boolean; onSubmit: (c: boolean) => void }) {
  const [val, setVal] = useState("");
  function check() {
    const text = val.toLowerCase();
    const hits = q.keywords.filter((k) => text.includes(k.toLowerCase())).length;
    onSubmit(q.keywords.length > 0 && hits / q.keywords.length >= 0.5);
  }
  return (
    <div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={answered}
        rows={4}
        placeholder="Deine Antwort in Stichpunkten…"
        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm focus:border-[color:var(--accent)] focus:outline-none"
      />
      {!answered ? (
        <button onClick={check} disabled={!val.trim()} className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40" style={{ background: "var(--accent)" }}>
          Selbst prüfen
        </button>
      ) : (
        <div className="mt-3 rounded-xl border border-line bg-surface/50 p-4 text-sm [&_.prose]:text-sm">
          <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">Musterlösung</div>
          <Markdown>{q.sampleAnswer}</Markdown>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {q.keywords.map((k) => (
              <span key={k} className="rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[0.7rem] text-muted">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DiffBadge({ d }: { d: Question["difficulty"] }) {
  const map = { leicht: "text-ok", mittel: "text-warn", schwer: "text-bad" };
  return <span className={cn("text-[0.7rem] font-semibold uppercase tracking-wide", map[d])}>{d}</span>;
}

function kindLabel(k: Question["kind"]) {
  return { mc: "Multiple Choice", truefalse: "Wahr / Falsch", numeric: "Rechnen", freetext: "Freitext" }[k];
}
