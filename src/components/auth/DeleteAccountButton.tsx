"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/app/actions/account";

/** Zweistufige Bestätigung: erst aufklappen, dann "löschen" tippen. */
export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [pending, startTransition] = useTransition();
  const armed = phrase.trim().toLowerCase() === "löschen";

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-bad/40 px-4 py-2 text-sm font-medium text-bad transition-colors hover:bg-bad/10"
      >
        <Trash2 size={15} /> Konto löschen …
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-[var(--radius)] border border-bad/40 bg-bad/5 p-4">
      <p className="text-sm text-muted">
        Das löscht dein Konto und <strong className="text-text">alle Lerndaten unwiderruflich</strong> — auch einen
        aktiven Semester-Pass (keine Erstattung). Tippe <strong className="text-text">löschen</strong> zur Bestätigung:
      </p>
      <input
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="löschen"
        className="w-full rounded-[6px] border border-line bg-surface-2 px-3 py-2 text-sm focus:border-bad focus:outline-none"
      />
      <div className="flex gap-2">
        <button
          disabled={!armed || pending}
          onClick={() => startTransition(() => deleteAccountAction())}
          className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-bad px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Endgültig löschen
        </button>
        <button
          onClick={() => {
            setConfirming(false);
            setPhrase("");
          }}
          className="rounded-[var(--radius)] border border-line px-4 py-2 text-sm text-muted hover:text-text"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
