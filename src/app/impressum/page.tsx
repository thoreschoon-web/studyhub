import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { OPERATOR, SERVICE_NAME } from "@/lib/legal";

export const metadata: Metadata = { title: `Impressum · ${SERVICE_NAME}` };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <LegalSection title="Angaben gemäß § 5 DDG">
        <p>
          {OPERATOR.name}
          <br />
          {OPERATOR.street}
          <br />
          {OPERATOR.city}
          <br />
          {OPERATOR.country}
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail: <a className="underline hover:text-text" href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
        </p>
      </LegalSection>

      <LegalSection title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}
        </p>
      </LegalSection>

      {OPERATOR.kleinunternehmer && (
        <LegalSection title="Umsatzsteuer">
          <p>Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer ausgewiesen.</p>
        </LegalSection>
      )}

      <LegalSection title="Streitbeilegung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a className="underline hover:text-text" href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
