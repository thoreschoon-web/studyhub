"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { requestPasswordResetAction, resetPasswordAction, type AuthState } from "@/app/actions/auth";

const inputCls =
  "w-full rounded-[6px] border border-line bg-surface-2 px-3 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none";
const buttonCls =
  "flex w-full items-center justify-center gap-2 rounded-[var(--radius)] py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60";

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="label-mono mb-2">StudyHub</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-heading">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-[var(--radius)] border border-line bg-surface/60 p-6">{children}</div>
        <p className="mt-5 text-center text-sm text-muted">
          <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
            Zurück zur Anmeldung
          </Link>
        </p>
      </div>
    </div>
  );
}

function Feedback({ state }: { state: AuthState }) {
  if (state.error) {
    return <div className="rounded-[6px] border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{state.error}</div>;
  }
  if (state.message) {
    return <div className="rounded-[6px] border border-ok/30 bg-ok/10 px-3 py-2 text-sm text-ok">{state.message}</div>;
  }
  return null;
}

/** Schritt 1: E-Mail eingeben → Reset-Link anfordern. */
export function RequestResetForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(requestPasswordResetAction, { error: "" });
  return (
    <Shell title="Passwort vergessen?" subtitle="Wir schicken dir einen Link zum Zurücksetzen.">
      <form action={formAction} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">E-Mail</label>
          <input name="email" type="email" autoComplete="email" required placeholder="du@beispiel.de" className={inputCls} />
        </div>
        <Feedback state={state} />
        {!state.message && (
          <button type="submit" disabled={pending} className={buttonCls} style={{ background: "var(--accent)" }}>
            {pending && <Loader2 size={15} className="animate-spin" />}
            Link anfordern
          </button>
        )}
      </form>
    </Shell>
  );
}

/** Schritt 2 (aus dem Mail-Link): neues Passwort setzen. */
export function ResetPasswordForm({ email, token }: { email: string; token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(resetPasswordAction, { error: "" });
  return (
    <Shell title="Neues Passwort" subtitle={`Für ${email}`}>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Neues Passwort</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="mindestens 6 Zeichen"
            className={inputCls}
          />
        </div>
        <Feedback state={state} />
        {!state.message && (
          <button type="submit" disabled={pending} className={buttonCls} style={{ background: "var(--accent)" }}>
            {pending && <Loader2 size={15} className="animate-spin" />}
            Passwort speichern
          </button>
        )}
      </form>
    </Shell>
  );
}
