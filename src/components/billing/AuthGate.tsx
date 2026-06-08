"use client";

import Link from "next/link";
import { Lock, X, LogIn, UserPlus } from "lucide-react";

/**
 * Presentational sign-in gate card. Used inline (as tab/page content for
 * anonymous users) and inside AnonTopicGate's blocking overlay.
 * Styling mirrors src/components/billing/UpgradeModal.tsx.
 */
export function AuthGateCard({
  feature,
  title,
  body,
  onClose,
  footer,
}: {
  feature?: string;
  title?: string;
  body?: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl border border-line bg-bg-soft p-7 text-center shadow-2xl">
      {onClose && (
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:text-text" aria-label="Schließen">
          <X size={18} />
        </button>
      )}
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--accent) 16%, transparent)" }}>
        <Lock size={26} style={{ color: "var(--accent)" }} />
      </div>
      <h2 className="font-display text-xl font-medium text-heading">{title ?? "Melde dich an"}</h2>
      <p className="mt-2 text-sm text-muted">
        {body ?? (
          <>
            Um <strong className="text-text">{feature ?? "diese Funktion"}</strong> zu nutzen, brauchst du ein kostenloses Konto.
            Die Registrierung dauert nur Sekunden — die ersten Inhalte sind gratis.
          </>
        )}
      </p>
      <Link
        href="/register"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
        style={{ background: "var(--accent)" }}
      >
        <UserPlus size={16} /> Kostenlos registrieren
      </Link>
      <Link
        href="/login"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-sm font-medium text-muted transition-colors hover:text-text"
      >
        <LogIn size={16} /> Anmelden
      </Link>
      {footer}
    </div>
  );
}

/** Inline gate: a centered sign-in prompt rendered in place (tab content, tool page). */
export function AuthGate({ feature }: { feature?: string }) {
  return (
    <div className="grid place-items-center px-4 py-12">
      <AuthGateCard feature={feature} />
    </div>
  );
}
