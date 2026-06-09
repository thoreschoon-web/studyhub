# StudyHub — Go-Live-Checkliste (Semester-Pass-Launch)

> Der Code ist launch-fertig (Stand: Juni 2026). Diese Liste enthält alles, was **nur du** erledigen kannst —
> in sinnvoller Reihenfolge. Geschätzter Aufwand: ~2–4 Stunden + Wartezeiten (Stripe-KYC, DNS).

## 0. Sofort (unabhängig voneinander, Wartezeiten anstoßen)

- [ ] **Vercel Pro** buchen (~20 $/Monat) — Account `thoreschoon-7381`. Hobby verbietet kommerzielle Nutzung.
- [ ] **Repo privat stellen**: `github.com/thoreschoon-web/studyhub` → Settings → Danger Zone. Mit Pro blockt Vercel
      private Repos nicht mehr. Danach einen Push machen und prüfen, dass das Deployment durchläuft.
- [ ] **Stripe-Live-Aktivierung starten** (KYC dauert 1–3 Tage): dashboard.stripe.com → Konto aktivieren
      (Identität, Bankkonto).
- [ ] **Domain kaufen** (z. B. studyhub-luh.de) — nötig für seriösen Checkout UND Resend-Mailversand
      (`*.vercel.app` kann keine Mails senden).
- [ ] **Gewerbe-/Steuerfrage klären** (Steuerberater oder Studierendenwerk-Beratung): Verkauf = gewerbliche
      Tätigkeit → Gewerbeanmeldung; Kleinunternehmerregelung § 19 UStG ja/nein. ⚠️ Falls NICHT Kleinunternehmer:
      `kleinunternehmer: false` in `src/lib/legal.ts` setzen (ändert Impressum/AGB-Texte).
- [ ] **Urheberrecht klären**: Inhalte sind aus LUH-Vorlesungsunterlagen abgeleitet. Vor dem Verkauf an
      Kommilitonen prüfen/klären (Lehrstuhl fragen oder Inhalte ausreichend eigenständig formulieren).
      **Größtes nicht-technisches Risiko.**

## 1. Rechtstexte finalisieren

- [ ] `src/lib/legal.ts`: alle `[PLATZHALTER]` ausfüllen (Name, Adresse, E-Mail).
- [ ] Impressum/Datenschutz/AGB/Widerruf auf /impressum etc. **durchlesen und prüfen** — die Texte sind
      sorgfältige Entwürfe, aber keine Rechtsberatung. Empfehlung: mit Generator (z. B. e-recht24) gegenprüfen.
- [ ] AV-Verträge (DPA) in den Dashboards akzeptieren: Vercel, Supabase, Stripe, Resend, Upstash, Sentry, Anthropic.
- [ ] Supabase-Projektregion prüfen (sollte EU sein — steht so in der Datenschutzerklärung).

## 2. Dienste provisionieren (je ~10 min)

- [ ] **Resend**: Account → Domain verifizieren (DNS-Records) → API-Key. Env: `RESEND_API_KEY`,
      `MAIL_FROM="StudyHub <mail@deine-domain.de>"`. Ohne das: kein Passwort-Reset/Verifizierung (Features
      deaktivieren sich selbst).
- [ ] **Upstash Redis**: Vercel-Dashboard → Storage → „Upstash for Redis" → mit Projekt verbinden. Env wird
      automatisch injiziert; danach Redeploy → hartes verteiltes Rate-Limit aktiv (vorher: In-Memory-Fallback).
- [ ] **Sentry**: Account → Next.js-Projekt → DSN. Env: `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`.
- [ ] **Anthropic**: console.anthropic.com → API-Key → **Monats-Spend-Limit setzen** (z. B. 25 €, zweite
      Kostenbremse neben dem 50-Nachrichten-Tagesbudget). Env: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL=claude-haiku-4-5`.

## 3. Stripe konfigurieren (nach KYC)

- [ ] Produkt „StudyHub Semester-Pass" mit **einmaligem** Preis anlegen (Empfehlung: 9–15 €; Preisanzeige
      zieht die App automatisch aus Stripe). → `STRIPE_PRICE_ID` (live).
- [ ] Live-Webhook anlegen: `https://<domain>/api/stripe/webhook`, Events: `checkout.session.completed`,
      `checkout.session.async_payment_succeeded`, `charge.refunded`, `charge.dispute.created` → `STRIPE_WEBHOOK_SECRET`.
- [ ] Stripe-Settings → Checkout: **AGB-URL** (`https://<domain>/agb`) hinterlegen (für die Consent-Checkbox).
- [ ] `STRIPE_SECRET_KEY` (live) in Vercel-Env.

## 4. Domain & Env in Vercel

- [ ] Domain im Vercel-Projekt verbinden, DNS umstellen.
- [ ] `AUTH_URL=https://<domain>` setzen (wichtig für Login + Mail-Links!).
- [ ] Alle Env-Vars aus Schritt 2/3 in Production setzen → Redeploy.

## 5. End-to-End-Probe (Live, mit echtem Geld)

- [ ] Konto mit privater E-Mail registrieren → Verifizierungs-Mail kommt an → Link klicken.
- [ ] „Passwort vergessen" einmal komplett durchspielen.
- [ ] Semester-Pass mit echter Karte kaufen → Zugang sofort frei, „gültig bis 30.09." korrekt, Rechnung per Mail.
- [ ] Im Stripe-Dashboard **Refund** auslösen → Zugang erlischt (paidUntil weg).
- [ ] KI-Tutor: Frage stellen (Streaming ok), Free-Konto sieht Teaser statt Input.
- [ ] Konto → Datenexport lädt JSON; Konto löschen funktioniert.

## 6. Beta (1 Woche, 3–5 Kommilitonen)

- [ ] Pässe manuell freischalten: `npx prisma studio` (gegen Prod-DB) → User → `paidUntil` = 2026-09-30.
      Alternativ Supabase-Dashboard → Table Editor.
- [ ] Täglich checken: Sentry (Fehler), Vercel-Logs, Anthropic-Spend, Supabase-Auslastung.
- [ ] Feedback einsammeln: Bugs, Inhaltsfehler, „Würdest du X € zahlen?"

## 7. Go-Live

- [ ] CI grün (GitHub Actions läuft bei jedem Push).
- [ ] Preis final, Beta-Feedback eingearbeitet.
- [ ] Link in die Semestergruppe. 🚀

---

### Laufende Kosten (Überblick)
| Dienst | Kosten |
|---|---|
| Vercel Pro | ~20 $/Monat |
| Domain | ~10–15 €/Jahr |
| Supabase Free | 0 € (Upgrade erst bei Wachstum nötig) |
| Resend Free | 0 € (3.000 Mails/Monat) |
| Upstash Free | 0 € |
| Sentry Free | 0 € |
| Anthropic | nutzungsabhängig, Haiku ≈ Cent-Beträge/Nutzer/Tag, Spend-Limit gesetzt |

### Wichtig im Betrieb
- Supabase Free pausiert die DB nach ~1 Woche Inaktivität — bei aktiven Nutzern kein Thema, in den Semesterferien prüfen.
- Backups: Supabase Free = 7 Tage daily. Bei nennenswertem Umsatz: Supabase Pro (PITR) erwägen.
- Kein Tracking/Analytics einbauen, ohne die Datenschutzerklärung zu erweitern (sonst Cookie-Banner-Pflicht).
