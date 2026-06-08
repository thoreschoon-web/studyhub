"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function UpgradeButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/stripe/checkout", { method: "POST" });
      const j = await r.json();
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setErr("Checkout ist gerade nicht verfügbar.");
    } catch {
      setErr("Netzwerkfehler. Bitte erneut versuchen.");
    }
    setBusy(false);
  }

  return (
    <div>
      <button
        onClick={go}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: "var(--accent)" }}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
        {busy ? "Weiterleitung zu Stripe…" : "Auf Pro upgraden"}
      </button>
      {err && <p className="mt-2 text-center text-sm text-bad">{err}</p>}
    </div>
  );
}
