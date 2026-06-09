"use client";

import { useEffect, useState } from "react";
import { X, BookOpen, ListChecks, Layers } from "lucide-react";

const KEY = "studyhub.onboarded";

/** Einmaliger 3-Schritte-Hinweis nach dem ersten Login (localStorage-Flag, dismissbar). */
export function OnboardingHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        // Einmaliger Post-Hydration-Sync aus localStorage (SSR kennt das Flag nicht).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShow(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <div className="relative mt-10 rounded-[var(--radius)] border border-line bg-surface/50 p-5">
      <button onClick={dismiss} className="absolute right-3 top-3 rounded-lg p-1.5 text-faint hover:text-text" aria-label="Hinweis schließen">
        <X size={16} />
      </button>
      <div className="label-mono mb-3">So startest du</div>
      <ol className="grid gap-3 text-sm sm:grid-cols-3">
        <li className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs text-muted">1</span>
          <span className="text-muted">
            <BookOpen size={14} className="mb-0.5 mr-1 inline text-text" />
            <strong className="text-text">Fach wählen</strong> und das erste Thema im „Lernen“-Tab lesen.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs text-muted">2</span>
          <span className="text-muted">
            <ListChecks size={14} className="mb-0.5 mr-1 inline text-text" />
            <strong className="text-text">Quiz beantworten</strong> — so merkst du sofort, was sitzt.
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs text-muted">3</span>
          <span className="text-muted">
            <Layers size={14} className="mb-0.5 mr-1 inline text-text" />
            <strong className="text-text">Karteikarten täglich</strong> wiederholen — der Algorithmus plant für dich.
          </span>
        </li>
      </ol>
    </div>
  );
}
