/**
 * E-Mail-Kanonisierung & Anti-Abuse für Gratis-Konten.
 *
 * Hintergrund: Das Gratis-Limit lässt sich trivial umgehen, indem man sich mit
 * "neuen" E-Mail-Adressen registriert, die in Wahrheit dieselbe Inbox treffen
 * (Gmail ignoriert Punkte und `+tags`) oder mit Wegwerf-Mail-Diensten.
 *
 * `normalizeEmail` bildet solche Varianten auf EINE kanonische Adresse ab, die
 * dann als eindeutiger Konto-Schlüssel dient — `t.hore+klausur@gmail.com` und
 * `thore@gmail.com` werden so zum selben Konto. `isDisposableEmail` blockt
 * bekannte Wegwerf-Domains bei der Registrierung.
 *
 * Reiner, abhängigkeitsfreier Code — keine externen Dienste nötig.
 */

// Gmail und Googlemail sind dieselbe Mailbox; Punkte im lokalen Teil ignoriert Gmail.
const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/**
 * Bildet eine E-Mail auf ihre kanonische Form ab (lowercase, getrimmt):
 *  - `+tag`-Subadressierung wird überall entfernt (de-facto-Standard, landet in der Basis-Inbox)
 *  - bei Gmail/Googlemail werden Punkte entfernt und die Domain auf `gmail.com` vereinheitlicht
 *
 * Idempotent: `normalizeEmail(normalizeEmail(x)) === normalizeEmail(x)`.
 */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at <= 0) return email; // kein/leerer lokaler Teil → unverändert (Validierung erfolgt separat)

  let local = email.slice(0, at);
  let domain = email.slice(at + 1);

  // +tag-Subadressierung abschneiden (Gmail, Outlook, Fastmail, ProtonMail, iCloud …).
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);

  // Gmail-Spezifika: Punkte sind bedeutungslos, googlemail == gmail.
  if (GMAIL_DOMAINS.has(domain)) {
    const noDots = local.replace(/\./g, "");
    if (noDots) local = noDots; // nur übernehmen, wenn nicht leer (z. B. "...@gmail.com")
    domain = "gmail.com";
  }

  return `${local}@${domain}`;
}

/**
 * Bekannte Wegwerf-/Temp-Mail-Domains. Kein Anspruch auf Vollständigkeit —
 * deckt die geläufigsten Dienste ab und ist leicht erweiterbar. Die echte
 * Hürde entsteht zusammen mit `normalizeEmail`: danach braucht ein Farmer eine
 * echte, eigene Mailbox pro Konto.
 */
export const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamailblock.com", "sharklasers.com", "grr.la", "spam4.me",
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "30minutemail.com",
  "temp-mail.org", "tempmail.com", "tempmail.net", "tempmailo.com", "temp-mail.io",
  "tempr.email", "tmpmail.org", "tmpmail.net", "tmail.com", "tmailor.com",
  "throwawaymail.com", "throwawaymail.net", "trashmail.com", "trashmail.de",
  "trashmail.net", "trash-mail.com", "wegwerfmail.de", "wegwerfmail.net",
  "wegwerfmail.org", "yopmail.com", "yopmail.net", "yopmail.fr",
  "getnada.com", "nada.email", "maildrop.cc", "dispostable.com", "fakeinbox.com",
  "fakemail.net", "mailnesia.com", "mailcatch.com", "mintemail.com",
  "mohmal.com", "moakt.com", "mytemp.email", "emailondeck.com", "discard.email",
  "discardmail.com", "spambog.com", "spamgourmet.com", "maileater.com",
  "mailexpire.com", "incognitomail.com", "jetable.org", "33mail.com",
  "burnermail.io", "tempinbox.com", "anonbox.net", "0wnd.net", "0wnd.org",
  "instant-mail.de", "byom.de", "luxusmail.org", "spambox.us", "binkmail.com",
  "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu", "gustr.com",
  "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us", "armyspy.com",
]);

/** True, wenn die Domain der Adresse als Wegwerf-/Temp-Mail-Dienst bekannt ist. */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}
