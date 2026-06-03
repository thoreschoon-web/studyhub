# StudyHub – persönliche Lernplattform

Eine lokal gehostete Lern-Webapp für vier Fächer (Sommersemester 26):
**Mathematik 2**, **Schließende Statistik**, **Privatrecht**, **BWL II (Marketing & Personal)**.

Features: Themen-Erklärungen mit Formelsatz (KaTeX) & Grafiken, interaktive Quizze
(Multiple-Choice, Wahr/Falsch, numerische Eingabe, Freitext), Karteikarten mit
Spaced-Repetition (SM-2), durchgerechnete Aufgaben & Lösungen, Klausur-Simulator und
ein KI-Tutor, der die Kursunterlagen kennt.

## Starten

```bash
npm install      # einmalig
npm run dev      # → http://localhost:3000
```

## KI-Tutor aktivieren (optional)

```bash
cp .env.local.example .env.local
# ANTHROPIC_API_KEY=sk-ant-... eintragen, dann Dev-Server neu starten
```

Ohne Key funktioniert alles außer dem Live-Chat; der Tutor zeigt dann einen Hinweis.

## Inhalte

Lerninhalte liegen als JSON unter `content/<fach>/<thema>.json` und werden zur
Laufzeit geladen (`src/lib/content.ts`). Schema: `src/lib/types.ts`.
Die Themen-/Aufgaben-Landkarte aus den Originalunterlagen: `data/corpus-map.json`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · KaTeX · Mermaid ·
mathjs · @anthropic-ai/sdk. Fortschritt wird lokal im Browser (localStorage) gespeichert.
