"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/** Fängt Render-/Serverfehler unterhalb des Root-Layouts — deutsche Copy, keine Interna. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <div className="text-6xl font-bold text-faint">Ups.</div>
        <p className="mt-3 text-muted">Da ist etwas schiefgelaufen. Dein Lernfortschritt ist sicher gespeichert.</p>
        {error.digest && <p className="mt-1 font-mono text-xs text-faint">Fehler-Code: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-4 py-2 text-sm font-medium hover:bg-surface-3"
        >
          <RotateCcw size={15} /> Erneut versuchen
        </button>
      </div>
    </div>
  );
}
