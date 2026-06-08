# Deployment — StudyHub (Supabase + Vercel)

Von lokal (SQLite) auf öffentlich (Postgres @ Supabase, gehostet @ Vercel).
Stand: Repo ist **deploy-fertig**. Es fehlen nur noch die Schritte, die deine Logins brauchen.

## Was schon erledigt ist ✅
- **Supabase-Projekt „Study Hub"** angelegt (`yjyohgkjsuqdyojidzmv`, Region EU-Central, healthy).
- **Prisma auf Postgres** umgestellt; **Migration als Postgres-DDL** im Repo (`prisma/migrations/.../init`).
- **Auto-Migrate beim Deploy:** `package.json` → `"vercel-build": "prisma migrate deploy && next build"`.
  → Vercel legt die Tabellen beim **ersten Build automatisch** in Supabase an. Lokales `next build` bleibt SQLite.
- Privates Repo **`github.com/thoreschoon-web/studyhub`** (Branch `main`) ist aktuell.

## Schritt 1 — bei Vercel einloggen (du, einmalig)
Im Claude-Prompt eintippen (das `!` führt es in dieser Session aus):
```
! npx vercel@latest login
```
GitHub als Methode wählen → Browser bestätigen. Danach „melde dich zurück" — Claude macht den Rest.

## Schritt 2 — Projekt verknüpfen & Env-Vars (Claude führt, CLI)
Claude linkt das Projekt und setzt die Variablen. **Production-Env-Vars:**

| Variable | Wert |
|---|---|
| `DATABASE_URL` | Supabase **Transaction Pooler** (Port **6543**) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase **Session Pooler** (Port **5432**) — *nicht* „Direct connection" (die ist IPv6-only → Vercel-Build kann sie nicht erreichen) |
| `AUTH_SECRET` | `0aerHMxp093K2Ckfxe4SQB+qgnmWI25FFA0zYN6r3lZd` (frisch für Prod erzeugt) |
| `AUTH_URL` | `https://<projekt>.vercel.app` (nach dem ersten Deploy bekannt) |
| `OWNER_EMAIL` | `thoreschoon@gmail.com` (= dein unbegrenztes Konto) |

**Connection-Strings holen:** Supabase → Projekt → **Connect** (oben) → Tab *ORMs* bzw. *Connection string*:
- **Transaction pooler** (6543) → `DATABASE_URL`, `?pgbouncer=true&connection_limit=1` anhängen.
- **Session pooler** (5432) → `DIRECT_URL`.
- In beiden `[YOUR-PASSWORD]` durch dein Supabase-DB-Passwort ersetzen.

> Die beiden DB-Strings enthalten dein DB-Passwort → am sichersten **im Vercel-Dashboard** (Settings → Environment Variables, maskiert) eintragen. `AUTH_SECRET`/`OWNER_EMAIL` setzt Claude per CLI.

## Schritt 3 — Deploy (Claude führt)
```bash
npx vercel link --yes          # Projekt anlegen/verknüpfen
# ... Env-Vars setzen (s.o.) ...
npx vercel --prod              # Build (migrate deploy legt Tabellen an) + Deploy
```
Nach ~2 Min ist die App unter `https://<projekt>.vercel.app` live. Danach `AUTH_URL` auf genau diese URL setzen und einmal neu deployen.

## Schritt 4 — Verifizieren
- `/login` → mit `OWNER_EMAIL` registrieren → unbegrenzter Zugriff.
- Ein paar Seiten/Quiz → Fortschritt muss in Supabase persistieren (`Tabelle TopicProgress`/`Usage` füllt sich).

## Schritt 5 — eigene Domain (später, ~5 Min)
1. Domain besorgen (Registrar oder direkt bei Vercel → 0 DNS-Handarbeit).
2. Vercel → Project → **Settings → Domains** → Domain eintragen → angezeigte A/CNAME-Records beim Registrar setzen.
3. `AUTH_URL` auf die neue Domain ändern, neu deployen (und ggf. Google-OAuth-Redirect-URI).

## Heads-ups
- **Vercel Hobby = nicht-kommerziell.** Stripe bleibt Testmodus → ok. Echtes Abrechnen → Vercel Pro.
- **Anthropic-Key in Prod = du zahlst jede Tutor-Anfrage.** Erst weglassen (Tutor zeigt 503), später bewusst setzen.
- **Supabase Free** pausiert nach ~1 Woche Inaktivität (1 Klick reaktiviert).
- **Auth.js v5** vertraut auf Vercel automatisch dem Host (`VERCEL_URL`); `AUTH_URL` setzen wir trotzdem explizit für saubere Redirects.
