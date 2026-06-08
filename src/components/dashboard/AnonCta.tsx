"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

/**
 * Discreet "Anmelden / Registrieren" bar shown atop the public dashboard for
 * anonymous visitors. Renders nothing for logged-in users.
 */
export function AnonCta() {
  const { status } = useSession();
  if (status !== "unauthenticated") return null; // hide while loading + when logged in

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-line bg-surface/50 px-4 py-3">
      <span className="text-sm text-muted">
        Schau dich frei um — <span className="text-text">melde dich an</span>, um Quiz, Karteikarten &amp; den KI-Tutor zu nutzen.
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <Link
          href="/register"
          className="rounded-[var(--radius)] px-3 py-1.5 text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          Registrieren
        </Link>
        <Link
          href="/login"
          className="rounded-[var(--radius)] border border-line px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          Anmelden
        </Link>
      </span>
    </div>
  );
}
