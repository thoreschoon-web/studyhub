import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, isUnlimited } from "@/lib/session";
import { DeleteAccountButton } from "@/components/auth/DeleteAccountButton";
import { ArrowLeft, Download, ShieldCheck, MailWarning } from "lucide-react";

export const metadata: Metadata = { title: "Konto · StudyHub" };
export const dynamic = "force-dynamic";

export default async function KontoPage() {
  const user = await requireUser();
  const unlimited = isUnlimited(user);

  return (
    <div className="mx-auto max-w-lg px-5 py-12 lg:py-16">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Übersicht
      </Link>

      <h1 className="font-display text-2xl font-medium text-heading">Konto</h1>

      <div className="mt-6 space-y-4">
        <section className="rounded-2xl border border-line bg-surface/60 p-6">
          <div className="label-mono mb-3">Profil</div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">E-Mail</dt>
              <dd className="truncate font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Status</dt>
              <dd className="inline-flex items-center gap-1.5 font-medium">
                {user.emailVerified ? (
                  <>
                    <ShieldCheck size={14} className="text-ok" /> verifiziert
                  </>
                ) : (
                  <>
                    <MailWarning size={14} className="text-warn" /> nicht verifiziert
                  </>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Zugang</dt>
              <dd className="font-medium">{unlimited ? "Unbegrenzt" : "Kostenlos (Testzugang)"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Mitglied seit</dt>
              <dd className="font-medium">{user.createdAt.toLocaleDateString("de-DE")}</dd>
            </div>
          </dl>
          {!unlimited && (
            <Link href="/upgrade" className="mt-4 inline-block text-sm font-medium" style={{ color: "var(--accent)" }}>
              Semester-Pass holen →
            </Link>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface/60 p-6">
          <div className="label-mono mb-3">Deine Daten</div>
          <p className="text-sm text-muted">
            Lade alle zu deinem Konto gespeicherten Daten als JSON herunter (Art. 20 DSGVO).
          </p>
          {/* Datei-Download von einer API-Route — bewusst <a> statt <Link> (kein Client-Routing). */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/account/export"
            className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius)] border border-line bg-surface-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-3"
          >
            <Download size={15} /> Daten exportieren
          </a>
        </section>

        <section className="rounded-2xl border border-line bg-surface/60 p-6">
          <div className="label-mono mb-3">Konto löschen</div>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  );
}
