/**
 * Anbieterdaten für Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung.
 * ⚠️ VOR LAUNCH AUSFÜLLEN — alle [PLATZHALTER] ersetzen. Die Rechtstexte sind
 * Entwürfe und müssen vom Betreiber geprüft werden (z. B. via e-recht24-Generator).
 */
export const OPERATOR = {
  /** Vollständiger Name des Betreibers (Impressumspflicht, § 5 DDG). */
  name: "[VOR- UND NACHNAME]",
  /** Ladungsfähige Anschrift — kein Postfach. */
  street: "[STRASSE HAUSNUMMER]",
  city: "[PLZ ORT]",
  country: "Deutschland",
  /** Kontakt-E-Mail (muss erreichbar sein). */
  email: "[KONTAKT@EMAIL.DE]",
  /** true = Kleinunternehmer nach § 19 UStG (keine USt. ausgewiesen). */
  kleinunternehmer: true,
} as const;

export const SERVICE_NAME = "StudyHub";

/** Ob noch Platzhalter offen sind — im Dev-Modus als Warnung nutzbar. */
export const LEGAL_PLACEHOLDERS_OPEN = OPERATOR.name.startsWith("[");
