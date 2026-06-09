"use client";

import { useState } from "react";
import { TutorChat } from "./TutorChat";
import { Sparkles, X } from "lucide-react";

export function TutorDock({
  context,
  subject,
  topic,
  suggestions,
  locked,
}: {
  context?: string;
  subject?: string;
  topic?: string;
  suggestions?: string[];
  locked?: "login" | "upgrade";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tutor-dock no-print">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-xl transition-transform hover:scale-105"
          style={{ background: "var(--accent)" }}
        >
          <Sparkles size={17} /> KI-Tutor
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col rounded-t-2xl border border-line bg-bg-soft p-4 shadow-2xl lg:bottom-5 lg:right-5 lg:h-[640px] lg:w-[420px] lg:rounded-2xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles size={16} style={{ color: "var(--accent)" }} /> KI-Tutor
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface" aria-label="Schließen">
                <X size={18} />
              </button>
            </div>
            <TutorChat context={context} subject={subject} topic={topic} suggestions={suggestions} locked={locked} className="flex-1 min-h-0" />
          </div>
        </>
      )}
    </div>
  );
}
