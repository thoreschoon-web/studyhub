import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { OPERATOR, SERVICE_NAME } from "@/lib/legal";

export const metadata: Metadata = { title: `AGB · ${SERVICE_NAME}` };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen">
      <LegalSection title="§ 1 Geltungsbereich und Anbieter">
        <p>
          Diese AGB gelten für die Nutzung der Lernplattform {SERVICE_NAME}, betrieben von {OPERATOR.name},{" "}
          {OPERATOR.street}, {OPERATOR.city} („Anbieter“). Sie richten sich ausschließlich an Verbraucher.
        </p>
      </LegalSection>

      <LegalSection title="§ 2 Leistungsgegenstand">
        <p>
          {SERVICE_NAME} stellt digitale Lerninhalte für Studierende bereit (Erklärungen, Quizfragen, Karteikarten,
          Übungsaufgaben, Klausur-Simulator, KI-Tutor). Ein kostenloses Konto umfasst einen begrenzten Testzugang. Der
          kostenpflichtige <strong className="text-text">Semester-Pass</strong> schaltet sämtliche Inhalte und Funktionen
          bis zum Ende des jeweils laufenden Semesters frei (Sommersemester: 30. September, Wintersemester: 31. März).
          Das konkrete Enddatum wird vor dem Kauf angezeigt.
        </p>
        <p>
          Der Semester-Pass ist eine <strong className="text-text">Einmalzahlung — kein Abonnement</strong>. Es erfolgt
          keine automatische Verlängerung und keine wiederkehrende Abbuchung.
        </p>
      </LegalSection>

      <LegalSection title="§ 3 Vertragsschluss">
        <p>
          Der Vertrag über den Semester-Pass kommt zustande, indem du den Bezahlvorgang über unseren
          Zahlungsdienstleister Stripe abschließt und wir die Zahlung bestätigen. Voraussetzung ist ein registriertes
          Konto mit bestätigter E-Mail-Adresse.
        </p>
      </LegalSection>

      <LegalSection title="§ 4 Preise und Zahlung">
        <p>
          Es gilt der zum Zeitpunkt des Kaufs angezeigte Preis.
          {OPERATOR.kleinunternehmer && " Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen."} Die Zahlung erfolgt
          über Stripe mit den dort angebotenen Zahlungsmethoden.
        </p>
      </LegalSection>

      <LegalSection title="§ 5 Widerrufsrecht">
        <p>
          Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten ergeben sich aus der{" "}
          <Link href="/widerruf" className="underline hover:text-text">
            Widerrufsbelehrung
          </Link>
          . Beachte: Das Widerrufsrecht erlischt bei digitalen Inhalten, wenn du beim Kauf ausdrücklich zustimmst, dass
          wir vor Ablauf der Widerrufsfrist mit der Bereitstellung beginnen, und du deine Kenntnis vom Erlöschen des
          Widerrufsrechts bestätigst (§ 356 Abs. 5 BGB).
        </p>
      </LegalSection>

      <LegalSection title="§ 6 Nutzungsrechte und Pflichten">
        <p>
          Der Zugang ist persönlich und nicht übertragbar; die Weitergabe von Zugangsdaten ist untersagt. Die Inhalte
          sind urheberrechtlich geschützt und ausschließlich für das eigene Lernen bestimmt — Vervielfältigung,
          Weitergabe oder Veröffentlichung (auch auszugsweise) sind nicht gestattet. Bei missbräuchlicher Nutzung
          (z. B. Account-Sharing, automatisiertes Auslesen) kann der Anbieter den Zugang sperren.
        </p>
      </LegalSection>

      <LegalSection title="§ 7 Inhalte, Verfügbarkeit und Gewährleistung">
        <p>
          Die Lerninhalte werden mit großer Sorgfalt erstellt und geprüft; eine Garantie für Vollständigkeit,
          Fehlerfreiheit oder einen bestimmten Prüfungserfolg wird jedoch nicht übernommen. {SERVICE_NAME} ist ein
          privates Lernangebot und <strong className="text-text">kein offizielles Angebot einer Hochschule</strong>;
          maßgeblich für Prüfungen sind allein die offiziellen Veranstaltungsunterlagen. Der Anbieter bemüht sich um
          eine hohe Verfügbarkeit, schuldet aber keine bestimmte Verfügbarkeitsquote; Wartungsarbeiten und Störungen
          können den Zugang vorübergehend einschränken. Antworten des KI-Tutors werden automatisiert erzeugt und können
          Fehler enthalten.
        </p>
      </LegalSection>

      <LegalSection title="§ 8 Laufzeit, Kündigung, Kontolöschung">
        <p>
          Der Semester-Pass endet automatisch zum angegebenen Datum — eine Kündigung ist nicht erforderlich. Das
          kostenlose Konto kannst du jederzeit unter „Konto“ löschen; damit werden alle gespeicherten Daten entfernt.
          Eine Kontolöschung vor Ablauf eines bezahlten Semester-Passes begründet keinen Erstattungsanspruch.
        </p>
      </LegalSection>

      <LegalSection title="§ 9 Haftung">
        <p>
          Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie bei Verletzung von Leben, Körper
          und Gesundheit. Bei einfacher Fahrlässigkeit haftet der Anbieter nur für die Verletzung wesentlicher
          Vertragspflichten (Kardinalpflichten), begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Im Übrigen
          ist die Haftung ausgeschlossen.
        </p>
      </LegalSection>

      <LegalSection title="§ 10 Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts; gegenüber Verbrauchern
          gilt diese Rechtswahl nur, soweit ihnen dadurch nicht der Schutz zwingender Bestimmungen ihres
          Aufenthaltsstaates entzogen wird. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der
          übrigen unberührt.
        </p>
        <p>Stand: Juni 2026</p>
      </LegalSection>
    </LegalPage>
  );
}
