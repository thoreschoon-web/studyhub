import Link from "next/link";
import { requireUser, isUnlimited } from "@/lib/session";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { currentSemesterEnd, formatSemesterEnd } from "@/lib/billing";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { Check, Sparkles, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

const PERKS = [
  "Alle 51 Themen & Erklärungen",
  "Unbegrenzt Karteikarten (Spaced Repetition)",
  "Alle Aufgaben mit Schritt-für-Schritt-Lösungen",
  "Unbegrenzt Quizfragen & Klausur-Simulator",
  "KI-Tutor (tägliches Kontingent)",
];

/** Preis des Semester-Passes aus Stripe (für die Anzeige; der Checkout nutzt die Price-ID direkt). */
async function getPriceLabel(): Promise<string | null> {
  if (!stripe || !process.env.STRIPE_PRICE_ID) return null;
  try {
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
    if (price.unit_amount == null) return null;
    return (price.unit_amount / 100).toLocaleString("de-DE", { style: "currency", currency: price.currency.toUpperCase() });
  } catch {
    return null;
  }
}

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status } = await searchParams;
  const unlimited = isUnlimited(user);
  const isOwner = user.plan === "owner";
  const passActive = !!user.paidUntil && user.paidUntil > new Date();
  const passExpired = !!user.paidUntil && user.paidUntil <= new Date() && !unlimited;
  const semesterEnd = formatSemesterEnd(currentSemesterEnd());
  const priceLabel = await getPriceLabel();

  return (
    <div className="mx-auto max-w-lg px-5 py-12 lg:py-16">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Übersicht
      </Link>

      {status === "success" && (
        <div className="mb-6 rounded-xl border border-ok/30 bg-ok/10 p-4 text-sm text-ok">
          Zahlung erfolgreich – dein Semester-Pass wird aktiviert. Lade die Seite ggf. in ein paar Sekunden neu.
        </div>
      )}
      {status === "cancel" && (
        <div className="mb-6 rounded-xl border border-line bg-surface/50 p-4 text-sm text-muted">Vorgang abgebrochen – kein Problem.</div>
      )}

      <div className="rounded-2xl border border-line bg-surface/60 p-7">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
          <Sparkles size={16} /> Semester-Pass
        </div>
        <h1 className="font-display mt-2 text-2xl font-medium text-heading">Unbegrenzt lernen — das ganze Semester</h1>
        <p className="mt-1 text-sm text-muted">
          {priceLabel ? (
            <>
              <strong className="text-text">{priceLabel} einmalig</strong> · gültig bis {semesterEnd} · kein Abo, keine
              automatische Verlängerung
            </>
          ) : (
            <>Einmalzahlung · gültig bis {semesterEnd} · kein Abo, keine automatische Verlängerung</>
          )}
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
          {isOwner ? (
            <div className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-center text-sm font-medium text-ok">
              ✓ Owner-Konto — unbegrenzter Zugang.
            </div>
          ) : passActive ? (
            <div className="rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-center text-sm font-medium text-ok">
              ✓ Dein Semester-Pass ist aktiv — gültig bis {formatSemesterEnd(user.paidUntil!)}.
            </div>
          ) : stripeEnabled ? (
            <>
              {passExpired && (
                <p className="mb-3 text-center text-sm text-muted">
                  Dein Semester-Pass ist am {formatSemesterEnd(user.paidUntil!)} abgelaufen — hol dir den Pass fürs neue
                  Semester.
                </p>
              )}
              <UpgradeButton />
              <p className="mt-3 text-center text-xs text-faint">
                Abwicklung über Stripe · mit dem Kauf akzeptierst du die{" "}
                <Link href="/agb" className="underline hover:text-muted">AGB</Link> ·{" "}
                <Link href="/widerruf" className="underline hover:text-muted">Widerrufsbelehrung</Link>
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm text-muted">
              <p className="mb-1 font-medium text-warn">Bezahlung noch nicht konfiguriert.</p>
              Hinterlege <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">STRIPE_SECRET_KEY</code> und{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">STRIPE_PRICE_ID</code> in <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">.env.local</code>,
              dann erscheint hier der Kauf-Button (Stripe-Testmodus).
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <div className="label-mono mb-3">Häufige Fragen</div>
        <div className="space-y-2">
          <Faq q="Was passiert nach Semesterende?">
            Dein Pass läuft automatisch aus — es gibt kein Abo und keine automatische Abbuchung. Dein Lernfortschritt
            bleibt gespeichert; fürs neue Semester holst du dir einfach einen neuen Pass.
          </Faq>
          <Faq q="Habe ich ein Widerrufsrecht?">
            Ja, grundsätzlich 14 Tage. Da der Zugang sofort freigeschaltet wird, stimmst du beim Kauf der sofortigen
            Bereitstellung zu — damit erlischt das Widerrufsrecht (§ 356 Abs. 5 BGB). Details in der{" "}
            <Link href="/widerruf" className="underline hover:text-text">Widerrufsbelehrung</Link>.
          </Faq>
          <Faq q="Bekomme ich eine Rechnung?">
            Ja — nach dem Kauf erhältst du Beleg und Rechnung automatisch per E-Mail von unserem Zahlungsdienstleister
            Stripe.
          </Faq>
          <Faq q="Was kann ich kostenlos testen?">
            Mit einem kostenlosen Konto kannst du 5 Themenseiten lesen sowie je ein paar Quizfragen, Karteikarten und
            eine Aufgabe ausprobieren — genug, um zu sehen, ob StudyHub zu dir passt.
          </Faq>
        </div>
      </div>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-line bg-surface/40 px-4 py-3">
      <summary className="cursor-pointer list-none text-sm font-medium text-text marker:hidden">
        <span className="mr-2 inline-block text-faint transition-transform group-open:rotate-90">›</span>
        {q}
      </summary>
      <p className="mt-2 pl-5 text-sm leading-relaxed text-muted">{children}</p>
    </details>
  );
}
