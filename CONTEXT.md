# StudyHub — Projekt-Kontext (Handoff für die nächste Session)

> Diese Datei bringt eine frische Claude-Session sofort auf Stand. Sie wird über `CLAUDE.md` automatisch geladen.
> **Zuerst lesen:** `AGENTS.md` — Next.js 16 hat Breaking Changes; vor Code-Änderungen die Docs unter `node_modules/next/dist/docs/` prüfen.

## TL;DR
**StudyHub** ist eine **lokal gehostete Lern-Plattform** (localhost) für die Uni-Klausuren von **Thore** (WiWi-Student, **kommuniziert auf Deutsch** → alle Inhalte/UI auf Deutsch). Vier Fächer: **Mathematik 2, Schließende Statistik, Privatrecht, BWL II (Marketing & Personal)**. Aus den Original-Unterlagen (PDFs im Elternordner `../`) wurden **51 Themen** mit Erklärungen, Quiz, Karteikarten und durchgerechneten Aufgaben erzeugt. Seit kurzem ist es eine **Mehrnutzer-Plattform mit Login, Konto-Fortschritt, Gratis-Limits und vorbereiteter Stripe-Bezahlung** (lokal-first).

## Tech-Stack
- **Next.js 16.2.7** (App Router, **Turbopack**), **React 19.2**, **TypeScript**, Alias `@/*` → `src/*`
- **Tailwind v4** (CSS-first: `@theme` in `src/app/globals.css`, KEINE tailwind.config)
- Inhalt/Render: **KaTeX**, **react-markdown** (+ remark-math/gfm, rehype-katex), **mermaid**, **mathjs**, **lucide-react**
- PDF: **html-to-image + jspdf** · Utils: clsx, tailwind-merge
- **Auth.js v5** (`next-auth@5 beta`), **Prisma 6 + SQLite**, **bcryptjs**, **zod**, **Stripe** (Testmodus), **@anthropic-ai/sdk** (KI-Tutor)
- ⚠️ **Next 16 Besonderheiten:** `params`/`searchParams` sind **Promises** (`await`); `middleware` heißt jetzt **`proxy`** (Node-Runtime); `cookies()/headers()` async; Turbopack default.

## Verzeichnis-/Architektur-Überblick
```
content/<fach>/<thema>.json   # 51 Lerninhalte (JSON), gelesen via src/lib/content.ts (fs, server)
data/                         # corpus-map.json (Themen-Landkarte), genmap-*.json (pro Fach), gen-topics.json
prisma/schema.prisma          # User/Account/Session + TopicProgress/SrsCard/ExamAttempt/Usage (SQLite)
scripts/                      # audit.mjs (Inhalts-Check), e2e.mjs (Auth/Limit-Tests), content-gen-instructions.md, prep-gen.mjs, merge-extra.mjs
src/
  app/
    layout.tsx                # async: auth() → zeigt Sidebar nur eingeloggt; SessionProvider + ProgressBootstrap + UpgradeModal; Theme-Init-Script
    page.tsx                  # Dashboard
    [subject]/page.tsx        # Fach-Übersicht (+ CTA "Querbeet"/Klausur)
    [subject]/[topic]/page.tsx# Themenseite (Tabs Lernen/Quiz/Karten/Aufgaben) + Seiten-Limit-Gate + PDF-Export-Container
    [subject]/quer/page.tsx   # "Querbeet" — Quiz/Karten/Aufgaben ALLER Themen eines Fachs gemischt
    karteikarten/ klausur/ tutor/ upgrade/ login/ register/
    api/{chat,progress,auth/[...nextauth],stripe/{checkout,webhook}}/route.ts
  auth.ts                     # NextAuth (Credentials + Google optional); KEIN Prisma-Adapter (s. Gotchas); jwt-Callback upsertet Google-User
  auth.config.ts             # edge-/proxy-safe Config (Provider-Liste, authorized/jwt/session-Callbacks, OHNE Prisma)
  auth.proxy.ts              # leichte NextAuth-Instanz nur für den Proxy
  proxy.ts                   # MUSS in src/ liegen! `export { auth as proxy } from "@/auth.proxy"` + matcher (gated alles außer /api,/login,/register,_next)
  lib/
    content.ts types.ts subjects.ts   # Inhalts-Loader, Typen, 4 Fach-Metadaten
    db.ts                    # Prisma-Singleton
    session.ts               # getCurrentUser()/requireUser()/isUnlimited()  (server-only)
    progress-server.ts       # Server-Datenzugriff getUserStore + applyAction (MUTATIONEN MIT Limit-Erzwingung) + recordPageOpen
    store.tsx                # Client-Store (gleiche API wie früher: useStore/actions/isDue/sm2), jetzt servergestützt (optimistisch + Rollback gegen /api/progress)
    srs.ts limits.ts stripe.ts utils.ts stats.ts
  components/
    learn/ (QuizEngine, FlashcardDeck, ExerciseList, TabsShell)
    content/ (Markdown, SectionView, Callout, Figure, MermaidClient, plots/*)
    auth/ (AuthForm, SessionProvider) · billing/ (UpgradeModal, Paywall, UpgradeButton) · progress/ (ProgressBootstrap)
    layout/ (Sidebar [+Account/Logout], MobileTopBar, ThemeToggle) · dashboard/ · subject/ · tutor/ · karteikarten/ · klausur/ · ui/
    PdfButton.tsx SubjectTheme.tsx
```

## Inhalte (Stand: 51 Themen · 608 Quiz · 969 Karteikarten · 191 Aufgaben)
- **Content-Modell** in `src/lib/types.ts`: `Topic{ id, subjectId, title, summary, order, group?, sections[], flashcards[], quiz[], exercises[] }`. `sections` = Markdown+LaTeX (`$...$`), optional `callouts` & `figures`. `quiz` = 4 Typen: **mc** (options/correct[]), **truefalse** (answer:bool), **numeric** (answer/tolerance), **freetext** (sampleAnswer/keywords). `figures`: **function-plot** (mathjs-fn), **distribution** (normal/t/chi2/f/binomial/poisson), **mermaid**, **table**, **image**.
- **Audit sauber:** `node scripts/audit.mjs` → 0 Fehler.
- **Generierungs-Pipeline:** Inhalte wurden von parallelen Sub-Agenten (Sonnet; Mathe teils Opus) erzeugt, die ihre JSON-Datei selbst schrieben + per `jq` selbst validierten. Anleitung: `scripts/content-gen-instructions.md`. Per-Fach-Maps: `data/genmap-<fach>.json`. Zusatzkarten/-quiz: per Sub-Agent in `data/extra/*.json` → mit `scripts/merge-extra.mjs` eingemischt.

## Features
- **Lernen:** editoriale Themenseiten (nummerierte Abschnitte, Initial, KaTeX, Plots, Mermaid, Callouts).
- **Quiz** (Sofort-Feedback, alle 4 Typen), **Karteikarten** (Spaced-Repetition SM-2, `src/lib/srs.ts`), **Aufgaben** (aufklappbare Lösungen), **Klausur-Simulator** (Timer), **Querbeet** (`/[subject]/quer`, alles gemischt).
- **Karopapier-Look** in Mathe & Statistik: `.math-karo`-Klasse auf der Seite → display-math & `.solution-box` auf kariertem Papier (theme-aware via `--karo-*`).
- **Echter PDF-Download** (`PdfButton`): erfasst einen Off-Screen-Container `#pdf-export-root` (immer gerendert) via html-to-image, paginiert nach A4 — kein Drucken-Dialog.
- **Themes:** Dunkel (default) + **White-Mode**. Token-System: dunkle Defaults in `@theme`, `html[data-theme="light"]`-Override aller Farben; Umschalter in Sidebar/MobileTopBar; flackerfreies Init-Script in `layout.tsx` (localStorage `studyhub.theme`).
- **KI-Tutor** (`/api/chat`, Anthropic-Streaming): Modell **`claude-haiku-4-5-20251001`** = kleinstes/günstigstes; hinter Login; ohne Key → 503-Hinweis.

## Mehrnutzer-Plattform (lokal-first)
- **Login-Pflicht:** ausgeloggt → Redirect `/login` (via `src/proxy.ts`). Primär **E-Mail+Passwort** (bcrypt, sofort nutzbar, keine externen Dienste); **Google optional** (env-gated, erscheint nur mit Keys).
- **DB (Prisma 6 + SQLite):** `prisma/schema.prisma`. JSON-Felder als **String** (SQLite kann kein Json/Array), `due` als `DateTime`↔ms an der Grenze. Migration liegt unter `prisma/migrations/`.
- **Fortschritt pro Konto:** früher localStorage → jetzt DB. `src/lib/store.tsx` behält die alte Public-API (deshalb 0 Pflicht-Edits an den Verbraucher-Komponenten), fetcht einmal `/api/progress` (`ProgressBootstrap`), Mutationen optimistisch + Rollback.
- **Gratis-Limits (serverseitig, total über die App):** **5 Themenseiten · 3 Karteikarten · 1 Aufgabe · 3 Quizfragen** → dann Paywall/UpgradeModal. Erzwungen in `progress-server.ts` (Interaktionen) + Topic-Page (`recordPageOpen` → `Paywall`). `pagesOpened` zählt **distinkte** Seiten (Re-Besuch frei). **`OWNER_EMAIL`-Konto & `plan="paid"` = unbegrenzt** (`isUnlimited`).
- **Anti-Abuse der Limits (`src/lib/email.ts`):** `normalizeEmail()` kollabiert Gmail-Tricks auf EIN Konto (Punkte entfernt, `+tags` abgeschnitten, googlemail→gmail) — angewandt bei Registrierung **und** Login-`authorize` **und** Google-Upsert (sonst findet der Login das Konto nicht). `isDisposableEmail()` blockt bekannte Wegwerf-Domains bei der Registrierung. Reiner Code, keine externen Dienste. Test: `node scripts/test-email.ts` (Node-24-Type-Stripping; aus tsconfig excluded). Google-User bekommen `emailVerified` gesetzt. **Noch offen:** echte E-Mail-Verifizierung (Bestätigungslink) — braucht einen Mail-Versand-Dienst (z. B. Resend), daher env-gated wie Stripe nachzurüsten.
- **Stripe (Testmodus, vorbereitet):** `src/lib/stripe.ts` (null ohne Key → graceful), `/api/stripe/checkout` + `/api/stripe/webhook` (setzt `plan="paid"`), `/upgrade`-Seite. Ohne Keys No-Op.
- **Verifiziert:** `node scripts/e2e.mjs` testet Gating, Persistenz, alle Limits, Paywall, Paid=unbegrenzt, Konto-Isolation, KI-Gate (legt Test-Konten an + löscht sie).

## Wichtige Konventionen & Gotchas (teuer gelernt)
1. **`src/proxy.ts`** (nicht Projekt-Root, weil `src/`-Dir!) muss eine **Funktion** exportieren → Re-Export-Muster `export { auth as proxy } from "@/auth.proxy"`. Bei „Could not parse module proxy.ts" / stale Verhalten: **`.next` löschen** (`rm -rf .next`) und Dev neu starten.
2. **Kein Prisma-Adapter in `auth.ts`** — `@auth/prisma-adapter` + Auth.js v5 beta warf `TypeError: adapterFn is not a function` beim `auth()` im Server-Component. Credentials+JWT braucht keinen Adapter (User selbst verwaltet). Google-User werden im **`jwt`-Callback** upsertet.
3. **`plan` immer aus der DB lesen** (nicht aus dem JWT) → Upgrades wirken sofort. `session/jwt`-Callbacks tragen nur `id`.
4. **`force-dynamic`** auf datengetriebenen Seiten beibehalten (kein statisches Caching von Nutzerdaten).
5. **Content-Generierung:** häufige JSON-Killer = deutsche Komma-Dezimalzahlen (`1,5` statt `1.5`) in numerischen Werten + typografische `„…"` mit ASCII-Endquote. Sub-Agenten daher IMMER per `jq empty` selbst validieren lassen; Dateien < ~75 KB (sonst Output-Limit); aufgabenreiche Themen (KKT/Simplex) sparsam PDF lesen (sonst Kontext-Limit).
6. **CSS:** modernes `color-mix(in oklab, …)`/CSS-Vars überall → für PDF html-to-image (rendert das korrekt), NICHT html2canvas. SVG-Plot-Farben via inline `style={{stroke:"var(--…)"}}` (Attribut-`var()` ist unzuverlässig).
7. Env liegt in **`.env`** (DATABASE_URL, von Prisma+Next gelesen) und **`.env.local`** (Secrets). Beide gitignored; `dev.db` gitignored.

## Env-Variablen (`.env.local`; Vorlage: `.env.local.example`)
Pflicht: `AUTH_SECRET` (`npx auth secret`), `AUTH_URL=http://localhost:3000`, `OWNER_EMAIL` (= dein unbegrenztes Konto), `DATABASE_URL=file:./dev.db` (in `.env`).
Optional (Feature schaltet sich frei): `AUTH_GOOGLE_ID/_SECRET` · `STRIPE_SECRET_KEY/_PRICE_ID/_WEBHOOK_SECRET` · `ANTHROPIC_API_KEY` (`ANTHROPIC_MODEL` default Haiku).

## Starten & Verifizieren
```bash
npm install
npx prisma migrate dev          # erstellt dev.db (falls noch nicht da) + Prisma-Client
npm run dev                     # http://localhost:3000  → /login → registrieren (OWNER_EMAIL = unbegrenzt)
npm run build                   # Prod-Build (fängt Next-16/Edge/Node-Fehler)
node scripts/audit.mjs          # Inhalts-Check (erwartet 0 Fehler)
node scripts/e2e.mjs            # Auth/Limit-E2E (Dev-Server muss laufen)
```

## Git-Historie (main)
`Initial CNA → Gerüst+Editorial-Dark → 51 Themen Inhalte → White-Mode → Querbeet+Karopapier+PDF → ≥200 Karten/≥100 Quiz → Mehrnutzer-Plattform (Login/Limits/Stripe) → Anti-Abuse (E-Mail-Norm) → Deploy-Prep (Postgres/Supabase) → Bugfixes (PDF/Zurück-Nav)`. Aktuell: Commit `e8e981d`.

## Aktueller Stand (Session 08.06.2026)

**Bugfixes (committet `e8e981d`, Build ✓):**
1. **PDF-Export → weiße Leerseiten behoben.** `html-to-image` rastert moderne CSS-Farben (`oklab`/`color-mix`, in Tailwind v4 überall) über den SVG-`foreignObject`-Pfad nicht → nur Hintergrund-Füllung, im White-Mode ≈ weiß. Umgestellt auf **`html2canvas-pro`** (`src/components/PdfButton.tsx`, gleiche UX, kein Druckdialog). *Visuelle Prüfung steht noch aus — Thore testet lokal.* (Alte `html-to-image`-Dep noch in package.json, ungenutzt; Aufräumen = `npm uninstall html-to-image`, aber ACHTUNG: löst `prisma generate` aus → siehe ⚠️ unten.)
2. **Zurück-Navigation ergänzt:** „Zurück"-Button in `QuizEngine` (`prev()`) + `FlashcardDeck` (`back()`), beim ersten Element ausgegraut.

**Anti-Abuse der Gratis-Limits (`src/lib/email.ts`):** Gmail-Tricks (Punkte/`+tags`/googlemail) kollabieren auf EIN Konto, Wegwerf-Domains geblockt. Test: `node scripts/test-email.ts`. Details im Mehrnutzer-Abschnitt oben.

**Deployment (IN ARBEIT) → Schritt-für-Schritt in `DEPLOY.md`.** Ziel: Supabase (Postgres) + Vercel + vorerst `*.vercel.app`, privates Repo.
- ✅ **Phase A:** Prisma `sqlite`→`postgresql` (`directUrl` für Pooling/Migrationen; JSON-Felder bleiben `String` → keine App-Code-Änderung), `.env.local.example` erweitert; privates Repo **`github.com/thoreschoon-web/studyhub`** erstellt & gepusht (`gh`-Account `thoreschoon-web`).
- ✅ **MCP-Server eingerichtet** (beide **local scope** in `~/.claude.json`, projektgebunden, **NICHT im Repo**; Tools erst ab Claude-Code-**Neustart** verfügbar):
  - **supabase:** `claude mcp add supabase … --read-only` → `claude mcp list` ✓ Connected.
  - **github:** offizieller Remote-Server `https://api.githubcopilot.com/mcp/` (HTTP/OAuth). Endpoint verifiziert (401=OAuth-geschützt, live). **Muss noch per `/mcp` → github → OAuth-Login** authentifiziert werden (Health-Check zeigt bis dahin „Failed to connect" = normal). `gh`-CLI bleibt zusätzlich nutzbar.
- ⏳ **Phase C (direkt als Nächstes):** Connection-Strings in gitignored `.env` (Transaction 6543 → `DATABASE_URL`, Direct 5432 → `DIRECT_URL`) → `rm -rf prisma/migrations` → `npx prisma migrate dev --name init` gegen Supabase → `npm run build` verifizieren → committen.
- ⏳ **Phase D/E:** Vercel-Import + Env-Vars (`DATABASE_URL`,`DIRECT_URL`,`AUTH_SECRET` *neu* für Prod,`AUTH_URL`,`OWNER_EMAIL`); später eigene Domain. Vercel Hobby = nicht-kommerziell; `ANTHROPIC_API_KEY` in Prod erst weglassen.
- ⚠️ **Lokales Dev läuft NOCH auf SQLite** (generierter Prisma-Client ist noch `sqlite`, `.env` zeigt auf `file:./dev.db`). Sobald `prisma generate`/`migrate` gegen Postgres läuft, ist SQLite-Dev weg — also nicht versehentlich `npm install`/`prisma generate` ausführen, bevor `.env` auf Supabase zeigt.
- 🔒 **Secrets** (DB-Passwort, `sbp_`-Token) liegen lokal in `.env` bzw. `~/.claude.json` — **niemals** in CONTEXT.md/Memory/Repo.

## Offene / mögliche nächste Schritte
- **Deployment fortsetzen** — Stand & Schritte siehe „Aktueller Stand" oben + `DEPLOY.md`.
- Google-Login / Stripe-Live / Anthropic-Key **aktivieren** (Anleitungen in `.env.local.example`) — der Nutzer hatte noch keine dieser Zugänge.
- Optional: harte Mathe-Lösungen (KKT/Simplex) mit Opus gegenprüfen; WebR-Sandbox (Statistik); Gutachtenstil-Trainer (Privatrecht); Klausur-Simulator auch ans Limit hängen; „Fortschritt zurücksetzen"-Buttons im UI prominenter; optional Alt-localStorage-Import beim ersten Login.
