import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Gemeinsames Layout + Typografie für die Rechtsseiten (Impressum, Datenschutz, AGB, Widerruf). */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 lg:py-16">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Übersicht
      </Link>
      <h1 className="font-display text-3xl font-medium text-heading">{title}</h1>
      <div className="legal-prose mt-8 space-y-6 text-sm leading-relaxed text-text">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-heading">{title}</h2>
      <div className="space-y-2.5 text-muted">{children}</div>
    </section>
  );
}
