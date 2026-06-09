import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { OPERATOR, SERVICE_NAME } from "@/lib/legal";

export const metadata: Metadata = { title: `Datenschutzerklärung · ${SERVICE_NAME}` };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <LegalSection title="1. Verantwortlicher">
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO): {OPERATOR.name}, {OPERATOR.street},{" "}
          {OPERATOR.city}, E-Mail: {OPERATOR.email}.
        </p>
      </LegalSection>

      <LegalSection title="2. Überblick">
        <p>
          {SERVICE_NAME} ist eine Lernplattform. Wir verarbeiten personenbezogene Daten nur, soweit dies für den Betrieb
          der Plattform erforderlich ist. Es werden <strong className="text-text">keine Analyse- oder Tracking-Dienste</strong>{" "}
          (z. B. Google Analytics) eingesetzt und keine Daten zu Werbezwecken verarbeitet oder weitergegeben.
        </p>
      </LegalSection>

      <LegalSection title="3. Hosting (Vercel)">
        <p>
          Die Plattform wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) gehostet. Beim Aufruf der
          Seite verarbeitet Vercel technisch notwendige Verbindungsdaten (IP-Adresse, Zeitpunkt, aufgerufene Seite,
          User-Agent) in Server-Logs. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren,
          stabilen Betrieb). Mit Vercel besteht ein Auftragsverarbeitungsvertrag; die Übermittlung in die USA stützt
          sich auf das EU-US Data Privacy Framework bzw. EU-Standardvertragsklauseln.
        </p>
      </LegalSection>

      <LegalSection title="4. Datenbank (Supabase)">
        <p>
          Konto- und Lerndaten werden in einer PostgreSQL-Datenbank bei Supabase Inc. gespeichert (Region: EU). Mit
          Supabase besteht ein Auftragsverarbeitungsvertrag.
        </p>
      </LegalSection>

      <LegalSection title="5. Registrierung und Konto">
        <p>Bei der Registrierung verarbeiten wir:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>E-Mail-Adresse (Login-Kennung, Verifizierung, Passwort-Zurücksetzen)</li>
          <li>Passwort (ausschließlich als bcrypt-Hash — niemals im Klartext)</li>
          <li>optional Name und Profilbild (bei Anmeldung über Google)</li>
          <li>Lernfortschritt (gelesene Abschnitte, Quiz-Ergebnisse, Karteikarten-Lernstand, Klausur-Versuche)</li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Die Daten bleiben gespeichert, bis du dein
          Konto löschst (jederzeit unter „Konto" möglich); damit werden alle Konto- und Lerndaten unwiderruflich
          entfernt.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          Wir verwenden ausschließlich ein technisch notwendiges Session-Cookie für den Login (Art. 6 Abs. 1 lit. b
          DSGVO, § 25 Abs. 2 Nr. 2 TDDDG). Es werden keine Marketing- oder Statistik-Cookies gesetzt — daher ist kein
          Cookie-Banner erforderlich. Die Theme-Einstellung (hell/dunkel) wird nur lokal in deinem Browser gespeichert.
        </p>
      </LegalSection>

      <LegalSection title="7. Anmeldung über Google (optional)">
        <p>
          Wenn du dich mit deinem Google-Konto anmeldest, erhalten wir von Google deine E-Mail-Adresse, deinen Namen und
          ggf. dein Profilbild. Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="8. Bezahlung (Stripe)">
        <p>
          Käufe werden über Stripe abgewickelt (Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Dublin,
          Irland). Zahlungsdaten (z. B. Kartendaten) werden direkt von Stripe erhoben und verarbeitet — sie erreichen
          unsere Server nicht. Wir speichern lediglich eine Stripe-Kundenreferenz und den Status deines Zugangs.
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Informationen zum Datenschutz bei Stripe:{" "}
          <a className="underline hover:text-text" href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer">
            stripe.com/de/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. KI-Tutor (Anthropic)">
        <p>
          Der KI-Tutor wird über die API von Anthropic, PBC (San Francisco, USA) betrieben. Wenn du den Tutor nutzt,
          werden deine Chat-Nachrichten und der Kontext des aktuellen Themas an Anthropic übermittelt und dort zur
          Erzeugung der Antwort verarbeitet. Sende daher keine sensiblen personenbezogenen Daten im Chat.
          Chat-Verläufe werden von uns nicht dauerhaft gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; die
          Übermittlung in die USA stützt sich auf EU-Standardvertragsklauseln.
        </p>
      </LegalSection>

      <LegalSection title="10. Transaktions-E-Mails (Resend)">
        <p>
          Für den Versand technischer E-Mails (Verifizierungslink, Passwort-Zurücksetzen) nutzen wir Resend, Inc. (USA).
          Dabei wird deine E-Mail-Adresse verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO; Übermittlung auf
          Basis von EU-Standardvertragsklauseln. Es werden keine Newsletter oder Werbe-E-Mails versendet.
        </p>
      </LegalSection>

      <LegalSection title="11. Schutz vor Missbrauch (Rate-Limiting)">
        <p>
          Zum Schutz vor Überlastung und Missbrauch begrenzen wir die Anzahl der Anfragen pro Konto. Dafür wird eine
          pseudonyme Konto-Kennung kurzzeitig in einem Zwischenspeicher (Upstash, Inc.) verarbeitet. Rechtsgrundlage:
          Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </LegalSection>

      <LegalSection title="12. Deine Rechte">
        <p>Du hast nach der DSGVO insbesondere das Recht auf:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Auskunft (Art. 15) — Export deiner Daten jederzeit unter „Konto" möglich</li>
          <li>Berichtigung (Art. 16)</li>
          <li>Löschung (Art. 17) — Konto-Löschung jederzeit unter „Konto" möglich</li>
          <li>Einschränkung der Verarbeitung (Art. 18)</li>
          <li>Datenübertragbarkeit (Art. 20)</li>
          <li>Widerspruch gegen Verarbeitungen auf Basis von Art. 6 Abs. 1 lit. f (Art. 21)</li>
          <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77)</li>
        </ul>
        <p>Zur Ausübung genügt eine E-Mail an {OPERATOR.email}.</p>
      </LegalSection>

      <LegalSection title="13. Stand">
        <p>Diese Datenschutzerklärung hat den Stand Juni 2026 und wird bei Änderungen der Plattform aktualisiert.</p>
      </LegalSection>
    </LegalPage>
  );
}
