import Link from "next/link";
import { requireUser, isUnlimited } from "@/lib/session";
import { stripeEnabled } from "@/lib/stripe";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { Check, Sparkles, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const PERKS = ["Unbegrenzt Themenseiten", "Unbegrenzt Karteikarten", "Alle Aufgaben & Lösungen", "Unbegrenzt Quizfragen", "Klausur-Simulator & KI-Tutor"];

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status } = await searchParams;
  const unlimited = isUnlimited(user);

  return (
    <div className="mx-auto max-w-lg px-5 py-12 lg:py-16">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Übersicht
      </Link>

      {status === "success" && (
        <div className="mb-6 rounded-xl border border-ok/30 bg-ok/10 p-4 text-sm text-ok">
          Zahlung erfolgreich – dein Pro-Zugang wird aktiviert. Lade die Seite ggf. in ein paar Sekunden neu.
        </div>
      )}
      {status === "cancel" && (
        <div className="mb-6 rounded-xl border border-line bg-surface/50 p-4 text-sm text-muted">Vorgang abgebrochen – kein Problem.</div>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-7">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
          <Sparkles size={16} /> StudyHub Pro
        </div>
        <h1 className="font-display mt-2 text-2xl font-medium text-heading">Unbegrenzt lernen</h1>
        <p className="mt-1 text-sm text-muted">
          Dein aktueller Plan: <strong className="text-text">{user.plan}</strong>
        </p>

        <ul className="mt-5 space-y-2.5">
          {PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ok/15 text-ok"><Check size={13} /></span>
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          {unlimited ? (
            <div className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-center text-sm font-medium text-ok">
              ✓ Du hast bereits unbegrenzten Zugang.
            </div>
          ) : stripeEnabled ? (
            <UpgradeButton />
          ) : (
            <div className="rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm text-muted">
              <p className="mb-1 font-medium text-warn">Bezahlung noch nicht konfiguriert.</p>
              Hinterlege <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">STRIPE_SECRET_KEY</code> und{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">STRIPE_PRICE_ID</code> in <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">.env.local</code>,
              dann erscheint hier der Upgrade-Button (Stripe-Testmodus).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
