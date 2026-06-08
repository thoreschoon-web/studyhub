# Deployment — StudyHub (Supabase + Vercel)

Von lokal (SQLite) auf öffentlich (Postgres @ Supabase, gehostet @ Vercel).
Reihenfolge einhalten — manche Schritte brauchen deine Logins.

## 1. Supabase-Projekt anlegen (du)
1. https://supabase.com → anmelden → **New project**.
2. Name z. B. `studyhub`, **DB-Passwort** wählen (gut merken!), Region **EU (Frankfurt)** (nah an dt. Vercel-Edge).
3. Warten, bis das Projekt bereit ist (~2 Min).
4. **Settings → Database → Connection string**:
   - **Transaction** (Port 6543) → das ist `DATABASE_URL`. Hänge `?pgbouncer=true&connection_limit=1` an.
   - **Direct connection** (Port 5432) → das ist `DIRECT_URL`.
   - `[YOUR-PASSWORD]` in beiden durch dein DB-Passwort ersetzen.
5. Beide Strings an Claude geben (oder selbst in `.env` eintragen).

## 2. Schema in die Supabase-DB migrieren (Claude, lokal)
```bash
# .env mit DATABASE_URL + DIRECT_URL (Supabase) füllen, dann:
rm -rf prisma/migrations            # alte SQLite-Migration verwerfen
npx prisma migrate dev --name init  # frische Postgres-Migration + anwenden
npx prisma generate
npm run build                       # Prod-Build lokal gegen Postgres verifizieren
```

## 3. Nach GitHub pushen (Claude)
Privates Repo via `gh repo create`. Secrets sind durch `.gitignore` geschützt
(`.env*`, `*.db` werden NIE committet).

## 4. Vercel-Deploy (du, Claude führt)
1. https://vercel.com → mit GitHub anmelden → **Add New… → Project** → das Repo importieren.
2. Framework wird als **Next.js** erkannt → keine Build-Config nötig.
3. **Environment Variables** setzen (Production):
   - `DATABASE_URL`, `DIRECT_URL` (Supabase, wie oben)
   - `AUTH_SECRET` (`npx auth secret` → neuen, eigenen für Prod!)
   - `AUTH_URL` = `https://DEIN-PROJEKT.vercel.app`
   - `OWNER_EMAIL` = deine unbegrenzte Konto-Mail
   - optional erst später: `AUTH_GOOGLE_*`, `STRIPE_*`, `ANTHROPIC_API_KEY`
4. **Deploy** klicken. Nach ~2 Min ist die App unter `*.vercel.app` live.

## 5. Verifizieren
- `/login` → registrieren mit `OWNER_EMAIL` → unbegrenzter Zugriff.
- Ein paar Seiten/Quiz testen, Fortschritt prüft Persistenz in Supabase.

## Später: eigene Domain
Vercel → Project → **Settings → Domains** → Domain eintragen → angezeigte
DNS-Records (A/CNAME) beim Registrar setzen. Danach `AUTH_URL` auf die neue
Domain anpassen (und ggf. Google-OAuth-Redirect-URI).

## Heads-ups
- **Vercel Hobby = nicht-kommerziell.** Stripe bleibt Testmodus → ok. Echtes Abrechnen → Vercel Pro.
- **Anthropic-Key in Prod = du zahlst jede Tutor-Anfrage.** Erst weglassen (Tutor zeigt 503), später bewusst aktivieren.
- **Supabase Free** pausiert nach ~1 Woche Inaktivität (1 Klick reaktiviert).
