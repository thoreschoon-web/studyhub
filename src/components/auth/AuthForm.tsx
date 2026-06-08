"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, googleSignInAction, type AuthState } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "register"; googleEnabled: boolean }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, { error: "" });
  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-7 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-teal-400 text-xl font-bold text-white shadow-lg">
          ◆
        </span>
        <h1 className="font-display text-2xl font-medium tracking-tight text-heading">
          {isLogin ? "Willkommen zurück" : "Konto erstellen"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isLogin ? "Melde dich an, um weiterzulernen." : "Registriere dich, um StudyHub zu nutzen."}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface/60 p-6">
        {googleEnabled && (
          <>
            <form action={googleSignInAction}>
              <button className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-3">
                <span className="text-base">G</span> Mit Google fortfahren
              </button>
            </form>
            <div className="mb-3 flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-line" /> oder <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <form action={formAction} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">E-Mail</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="du@beispiel.de"
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Passwort</label>
            <input
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              placeholder="mindestens 6 Zeichen"
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none"
            />
          </div>

          {state.error && (
            <div className="rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-sm text-bad">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "var(--accent)" }}
          >
            {pending && <Loader2 size={15} className="animate-spin" />}
            {isLogin ? "Anmelden" : "Registrieren"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {isLogin ? (
          <>
            Noch kein Konto?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--accent)" }}>
              Registrieren
            </Link>
          </>
        ) : (
          <>
            Schon ein Konto?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
              Anmelden
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
