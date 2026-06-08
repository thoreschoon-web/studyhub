/**
 * Unit-Test für die E-Mail-Kanonisierung & Wegwerf-Erkennung.
 * Lauf:  node scripts/test-email.ts   (Node 24 strippt die TS-Typen)
 */
import { normalizeEmail, isDisposableEmail } from "../src/lib/email.ts";

let pass = 0;
let fail = 0;

function eq(actual: unknown, expected: unknown, label: string) {
  if (actual === expected) {
    pass++;
  } else {
    fail++;
    console.error(`✗ ${label}\n    erwartet: ${JSON.stringify(expected)}\n    erhalten: ${JSON.stringify(actual)}`);
  }
}

// --- normalizeEmail ---
eq(normalizeEmail("thore@gmail.com"), "thore@gmail.com", "schlicht");
eq(normalizeEmail("  Thore@Gmail.com  "), "thore@gmail.com", "trim + lowercase");
eq(normalizeEmail("t.h.o.r.e@gmail.com"), "thore@gmail.com", "Gmail-Punkte entfernt");
eq(normalizeEmail("thore+klausur@gmail.com"), "thore@gmail.com", "Gmail +tag entfernt");
eq(normalizeEmail("t.hore+spam2@googlemail.com"), "thore@gmail.com", "googlemail→gmail + Punkte + tag");
eq(normalizeEmail("THORE+a.b@GoogleMail.com"), "thore@gmail.com", "alles kombiniert, case-insensitiv");
// Nicht-Gmail: +tag wird entfernt, Punkte bleiben erhalten
eq(normalizeEmail("max.mustermann+uni@outlook.com"), "max.mustermann@outlook.com", "Outlook: +tag weg, Punkte bleiben");
eq(normalizeEmail("foo@example.org"), "foo@example.org", "Fremd-Domain unverändert");
// Idempotenz
eq(normalizeEmail(normalizeEmail("t.h.ore+x@gmail.com")), normalizeEmail("t.h.ore+x@gmail.com"), "idempotent");
// Defensive Kanten
eq(normalizeEmail("nichtsmail"), "nichtsmail", "kein @ → unverändert");
eq(normalizeEmail("+tag@gmail.com"), "+tag@gmail.com", "leerer lokaler Teil → unverändert (kein leeres Konto)");

// --- isDisposableEmail ---
eq(isDisposableEmail("wer@mailinator.com"), true, "mailinator erkannt");
eq(isDisposableEmail("a@10minutemail.com"), true, "10minutemail erkannt");
eq(isDisposableEmail("a@Temp-Mail.org"), true, "case-insensitiv");
eq(isDisposableEmail("thore@gmail.com"), false, "gmail ist nicht disposable");
eq(isDisposableEmail("a@outlook.com"), false, "outlook ist nicht disposable");
eq(isDisposableEmail("keinemail"), false, "kein @ → false");

console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
process.exit(fail === 0 ? 0 : 1);
