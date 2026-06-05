# Auftrag: Tiefe Lerninhalte als JSON-Datei erzeugen

Du erzeugst für GENAU EIN Thema einer Uni-Veranstaltung eine vollständige, **maximal anfängerfreundliche** JSON-Lerninhaltsdatei und schreibst sie mit dem **Write-Tool**. Fach, Thema, Slug, Pfade und der zu beachtende Fach-Block stehen in deinem konkreten Auftrag. Alles auf **Deutsch**.

## 1. Format (verbindlich — exakt einhalten)
Lies zuerst die EXAKTE Vorlage: `/Users/thore/Desktop/UNI semester 2/lernplattform/data/topic-format-reference.json`. Deine Datei MUSS dieselben Feldnamen und dieselbe Struktur nutzen:

```
{ id, subjectId, title, summary, order, estMinutes, group?, sections[], flashcards[], quiz[], exercises[] }
```
- **sections[]**: `{ id, heading, body, callouts?, figures? }` — `body` ist Markdown mit LaTeX: inline `$...$`, abgesetzt `$$...$$`.
  - **callouts[]**: `{ kind, title?, body }`, `kind` ∈ `info|warning|tip|merksatz|beispiel|definition|formel`
- **flashcards[]**: `{ id, topicId, front, back }`
- **quiz[]** — vier Typen, Feldnamen EXAKT so:
  - `{ "kind":"mc", id, topicId, difficulty, prompt, options:[..], correct:[int..], multiple?:bool, explanation }`
  - `{ "kind":"truefalse", id, topicId, difficulty, prompt, answer:bool, explanation }`
  - `{ "kind":"numeric", id, topicId, difficulty, prompt, answer:number, tolerance:number, unit?, explanation }`
  - `{ "kind":"freetext", id, topicId, difficulty, prompt, sampleAnswer, keywords:[..], explanation }`
  - `difficulty` ∈ `leicht|mittel|schwer`
- **exercises[]**: `{ id, topicId, label, source, type, difficulty?, prompt, hint?, solution, hasOfficialSolution }`
  - `type` ∈ `uebung|klausur|fall|zusatzaufgabe|beispiel`; `solution` = Markdown, Schritt-für-Schritt.
- **figures[]** (optional, nur wo sie wirklich helfen):
  - `{ "kind":"function-plot", id, title, caption, functions:[{ fn:"mathjs-Ausdruck z.B. x^2-3*x", label, color?, dashed? }], domain:[a,b], range?:[lo,hi], points?:[{x,y,label}] }`
  - `{ "kind":"distribution", id, title, caption, dist:"normal"|"t"|"chi2"|"f"|"binomial"|"poisson", params:{…}, shade?:{from?,to?,tail?:"left"|"right"|"two"}, markers?:[{x,label}] }` — params z.B. `{mu,sigma}` / `{df}` / `{d1,d2}` / `{n,p}` / `{lambda}`
  - `{ "kind":"mermaid", id, title, caption, code:"graph TD; A[..]-->B[..]" }`
  - `{ "kind":"table", id, title, headers:[..], rows:[[..],[..]] }`

**JSON-Hygiene:** valides JSON. In LaTeX Backslashes DOPPELT escapen (`\\frac`, `\\lambda`, `\\sum`). `id` = der vorgegebene Slug; alle `topicId` in flashcards/quiz/exercises = derselbe Slug. `subjectId`, `order`, ggf. `group` exakt wie im Auftrag.

## 2. Recherche
- Öffne die im Auftrag genannte **Map-Datei** und lies den Knoten `topics[INDEX]` → `subtopics`, `keyConcepts`, `formulas`, `figureIdeas`. Das ist dein inhaltliches Gerüst.
- Finde in derselben Map ALLE `exercises` mit `topicRef == REF`. Lies für JEDE die `sourceFile` (PDF) mit dem Read-Tool, um den EXAKTEN Aufgabentext zu bekommen.
- Vorlesungs-/Skript-Material nur **selektiv** lesen (Inhaltsverzeichnis/relevante Seiten), keine kompletten Großdokumente.

## 3. Tiefe — „erklär es wie einem absoluten Anfänger"
Setze NULL Vorwissen voraus. Für JEDES Konzept beantworte: **(1) Was ist es? (2) Wozu / was ist das Ziel? (3) Anschauung/Intuition (4) Wie macht/berechnet man es — Schritt für Schritt (5) ein konkret durchgerechnetes Beispiel mit Zahlen.** Jeden Fachbegriff beim ersten Auftreten erklären. Lieber ausführlich als knapp. **4–7 sections.**

## 4. Umfang
- **flashcards:** 5–8. **quiz:** 8–12 (Typen gemischt). **exercises:** ALLE mit `topicRef==REF` aus der Map — jede mit **vollständiger, korrekter, nachvollziehbarer Schritt-für-Schritt-Lösung** (selbst nachrechnen/-prüfen!). `hasOfficialSolution=true` nur, wenn eine Musterlösung in den Materialien existiert.

## 5. Fachspezifische Hinweise (beachte NUR deinen zugewiesenen Block)

### [STATISTIK]  subjectId="statistik" — „Schließende Statistik"
Lecture: `/Users/thore/Desktop/UNI semester 2/Schließende Statistik/Skript_Schließende_Statistik_SoSe26.pdf`, Formelsammlung `SchlSt_FS.pdf`, Tabellen `Tabellen.pdf`. R-Skripte: `…/R_Übung/Statistik_I_Beispiele.R`, `Statistik_II_nora.R`.
- Nutze **distribution-Figuren** intensiv: Normal-/t-/Chi²-/F-Verteilung, Ablehnbereiche via `shade`/`tail`, Konfidenzintervalle via `markers`. `function-plot` für Regressionsgeraden/Streudiagramme; `table` für Test-Übersichten.
- Mind. **3 numeric**-Quizfragen. Erkläre das **Ablesen aus Verteilungstabellen** (in der Klausur erlaubt) und den Umgang mit der Formelsammlung.
- Beim **R-Thema**: R-Code in ` ```r … ``` `-Blöcken; nutze die Datensätze (Covid19ICU.xlsx, DataRegression.xlsx, PosTests.xlsx, Treibhausgasemissionen.csv) und Funktionen `dbinom, pnorm/qnorm, qt, t.test(), lm()`.

### [PRIVATRECHT]  subjectId="privatrecht" — „Privatrecht (BGB)"
Material-Ordner: `/Users/thore/Desktop/UNI semester 2/Privatrecht/` (`PR_-_Theorieteil/*`, `PR_-_Methodikteil/*`, `PR_-_Praxisteil/*` = durchgerechnete FÄLLE+Lösungen, `PR_-_Folien/*`).
- **KEINE** Mathe-Plots. Nutze **mermaid** für Prüfungs-/Anspruchsschemata (z.B. Vertragsschluss §§145 ff., Anfechtung §§119 ff., Stellvertretung §§164 ff.; „Anspruch entstanden → nicht erloschen → durchsetzbar"). `table` für Übersichten (Einwendungen vs. Einreden, Willensmängel).
- Aufgaben sind **FÄLLE** (type "fall"): Lösung strikt im **GUTACHTENSTIL** — Obersatz („A könnte gegen B einen Anspruch auf … aus § … BGB haben.") → Voraussetzungen/Definition → Subsumtion → Zwischen-/Endergebnis. Mit präzisen **§§-Zitaten**.
- Quiz: schwerpunktmäßig mc/truefalse zu Definitionen & §§, plus 1–2 freetext-Fallfragen; numeric optional. Erkläre jeden juristischen Begriff laienverständlich.

### [BWL]  subjectId="bwl" — „BWL II (Marketing & Personal)"  (setze `group` = "Marketing" ODER "Personal" laut Auftrag)
Marketing-Lecture: `/Users/thore/Desktop/UNI semester 2/BWL/marketing/PoM__VL_*.pdf`. Personal-Lecture: `/Users/thore/Desktop/UNI semester 2/BWL/Personal/Vorlesung_Personal__SoSe_2026.pdf` + `HBR_*.pdf` + `Personal_Artikel_SoSe_2026.pdf`.
- **Marketing** ist rechenlastig: `function-plot` für Preisabsatzfunktion p(x), Gewinnfunktion, Preiselastizität, CLV; `table` für Matrizen (Fluktuations-/Übergangsmatrix, BCG, Ansoff); `mermaid` für Prozesse (Kaufentscheidungsprozess EKB, STP, AIDA). Mind. **2–3 numeric**-Quizfragen + Rechenaufgaben mit Lösungsweg.
- **Personal** ist konzeptlastig: mehr mc/truefalse/freetext; `mermaid`/`table` für Frameworks. HBR-Cases als `beispiel`-exercises (Kernaussage + Bezug zur Vorlesung). Englische Fachbegriffe kurz übersetzen.

### [MATHE]  subjectId="mathe-2" — „Mathematik 2"
Lecture: `/Users/thore/Desktop/UNI semester 2/Mathe 2/Mathematik2_WiWi_SoSe26_Folien.pdf`.
- `function-plot` für Graphen; `mermaid` für Ablauf-/Entscheidungsdiagramme (KKT-Fallunterscheidung, Simplex-Ablauf); `table` für Tableaus. Rechenweg in Lösungen zwingend. Mind. **3 numeric**-Quizfragen.

## 6. Schreiben & SELBST VALIDIEREN (Pflicht)
Schreibe die **vollständige, valide** JSON-Datei mit dem Write-Tool an den im Auftrag genannten Zielpfad (überschreibe NUR diese eine Datei).

**Danach ZWINGEND mit dem Bash-Tool prüfen:** `jq empty "<zielpfad>"`.
- Gibt es einen Fehler → die häufigste Ursache sind **einfache statt doppelte Backslashes** in LaTeX (`\frac` statt `\\frac`). Korrigiere und schreibe erneut, **wiederhole bis `jq empty` fehlerfrei** durchläuft.
- **Größe begrenzen:** Halte die Datei **unter ~75 KB** (sonst überschreitet die Schreib-Antwort das Output-Limit). Lieber etwas straffer formulieren (5–6 sections, prägnante Lösungen) als die Datei sprengen.

Antworte erst danach mit GENAU EINER Zeile:
`<slug>: ok — sections=N quiz=N cards=N exercises=N`
