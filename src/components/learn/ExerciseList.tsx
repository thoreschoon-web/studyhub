"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import { actions, useStore } from "@/lib/store";
import { Markdown } from "@/components/content/Markdown";
import { cn } from "@/lib/utils";
import { ChevronDown, Eye, EyeOff, Lightbulb, CheckCircle2, Circle } from "lucide-react";

const TYPE_LABEL: Record<Exercise["type"], string> = {
  uebung: "Übung",
  klausur: "Klausur",
  fall: "Fall",
  zusatzaufgabe: "Zusatzaufgabe",
  beispiel: "Beispiel",
};

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  if (!exercises.length) return <p className="text-sm text-muted">Noch keine Aufgaben hinterlegt.</p>;
  return (
    <div className="space-y-3">
      {exercises.map((ex) => (
        <ExerciseItem key={ex.id} ex={ex} />
      ))}
    </div>
  );
}

function ExerciseItem({ ex }: { ex: Exercise }) {
  const [open, setOpen] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const done = useStore((s) => s.topics[ex.topicId]?.exercisesDone.includes(ex.id) ?? false);

  return (
    <div className="card-print overflow-hidden rounded-xl border border-line bg-surface/50">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            actions.toggleExercise(ex.topicId, ex.id);
          }}
          className={cn("shrink-0 transition-colors", done ? "text-ok" : "text-faint hover:text-muted")}
          aria-label="Als erledigt markieren"
        >
          {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-3 text-left">
          <div className="flex-1">
            <div className="text-sm font-medium">{ex.label}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[0.7rem] text-faint">
              <span className="rounded border border-line px-1.5 py-0.5">{TYPE_LABEL[ex.type]}</span>
              <span className="truncate">{ex.source}</span>
              {ex.hasOfficialSolution && <span className="text-ok/70">offizielle Lösung</span>}
            </div>
          </div>
          <ChevronDown size={17} className={cn("shrink-0 text-faint transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-line px-4 py-4">
          <div className="text-sm [&_.prose]:text-sm">
            <Markdown>{ex.prompt}</Markdown>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ex.hint && (
              <button
                onClick={() => setShowHint((h) => !h)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
              >
                <Lightbulb size={14} /> {showHint ? "Tipp verbergen" : "Tipp"}
              </button>
            )}
            <button
              onClick={() => setShowSol((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              {showSol ? <EyeOff size={14} /> : <Eye size={14} />}
              {showSol ? "Lösung verbergen" : "Lösung anzeigen"}
            </button>
          </div>

          {showHint && ex.hint && (
            <div className="animate-fade-in mt-3 rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm text-muted">
              {ex.hint}
            </div>
          )}

          {showSol && (
            <div className="solution-box animate-fade-in-up mt-4 rounded-xl border border-line bg-plot/60 p-4">
              <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-faint">
                Lösungsweg
              </div>
              <div className="text-sm [&_.prose]:text-sm">
                <Markdown>{ex.solution}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
