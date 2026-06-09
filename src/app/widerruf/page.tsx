import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { OPERATOR, SERVICE_NAME } from "@/lib/legal";

export const metadata: Metadata = { title: `Widerrufsbelehrung · ${SERVICE_NAME}` };

export default function WiderrufPage() {
  return (
    <LegalPage title="Widerrufsbelehrung">
      <LegalSection title="Widerrufsrecht">
        <p>
          Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
          Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
        </p>
        <p>
          Um dein Widerrufsrecht auszuüben, musst du uns ({OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}, E-Mail:{" "}
          {OPERATOR.email}) mittels einer eindeutigen Erklärung (z. B. per E-Mail) über deinen Entschluss, diesen
          Vertrag zu widerrufen, informieren. Du kannst dafür das beigefügte Muster-Widerrufsformular verwenden, das
          jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die
          Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
        </p>
      </LegalSection>

      <LegalSection title="Folgen des Widerrufs">
        <p>
          Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich
          und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf
          dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du
          bei der ursprünglichen Transaktion eingesetzt hast; in keinem Fall werden dir wegen dieser Rückzahlung
          Entgelte berechnet.
        </p>
      </LegalSection>

      <LegalSection title="Erlöschen des Widerrufsrechts bei digitalen Inhalten">
        <p>
          Das Widerrufsrecht erlischt bei einem Vertrag über die Bereitstellung von nicht auf einem körperlichen
          Datenträger befindlichen digitalen Inhalten gemäß § 356 Abs. 5 BGB, wenn wir mit der Vertragserfüllung
          begonnen haben, nachdem du ausdrücklich zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist mit der
          Vertragserfüllung beginnen, und du deine Kenntnis davon bestätigt hast, dass du durch deine Zustimmung mit
          Beginn der Vertragserfüllung dein Widerrufsrecht verlierst. Diese Zustimmung holen wir beim Kauf des
          Semester-Passes ein, da der Zugang unmittelbar nach Zahlung freigeschaltet wird.
        </p>
      </LegalSection>

      <LegalSection title="Muster-Widerrufsformular">
        <div className="rounded-xl border border-line bg-surface/60 p-4">
          <p className="mb-2">
            (Wenn du den Vertrag widerrufen willst, fülle bitte dieses Formular aus und sende es zurück.)
          </p>
          <p>
            An: {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}, E-Mail: {OPERATOR.email}
          </p>
          <p className="mt-2">
            Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden
            Waren (*) / die Erbringung der folgenden Dienstleistung (*):
          </p>
          <p className="mt-2">
            — Bestellt am (*) / erhalten am (*): _______________
            <br />— Name des/der Verbraucher(s): _______________
            <br />— Anschrift des/der Verbraucher(s): _______________
            <br />— Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _______________
            <br />— Datum: _______________
          </p>
          <p className="mt-2">(*) Unzutreffendes streichen.</p>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
