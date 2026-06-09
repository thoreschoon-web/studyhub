import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";
import { normalizeEmail } from "@/lib/email";

export const metadata: Metadata = { title: "E-Mail bestätigen · StudyHub" };
export const dynamic = "force-dynamic";

export default async function VerifizierenPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email: rawEmail, token } = await searchParams;
  const email = normalizeEmail(rawEmail ?? "");

  let ok = false;
  if (email && token) {
    ok = await consumeToken("verify", email, token);
    if (ok) {
      await db.user.updateMany({ where: { email, emailVerified: null }, data: { emailVerified: new Date() } });
    }
  }

  return (
    <div className="grid min-h-[80vh] place-items-center px-5 text-center">
      <div className="w-full max-w-sm">
        <div className="label-mono mb-2">StudyHub</div>
        {ok ? (
          <>
            <h1 className="font-display text-2xl font-semibold text-heading">E-Mail bestätigt ✓</h1>
            <p className="mt-2 text-sm text-muted">Dein Konto ist jetzt verifiziert.</p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-[var(--radius)] px-5 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--accent)" }}
            >
              Weiter zu StudyHub
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-heading">Link ungültig</h1>
            <p className="mt-2 text-sm text-muted">
              Der Bestätigungslink ist ungültig oder abgelaufen. Melde dich an und fordere einen neuen Link an.
            </p>
            <Link href="/login" className="mt-4 inline-block font-medium" style={{ color: "var(--accent)" }}>
              Zur Anmeldung
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
