import type { SubjectMeta, SubjectId } from "./types";

export const SUBJECTS: SubjectMeta[] = [
  {
    id: "mathe-2",
    title: "Mathematik 2",
    short: "Mathe 2",
    tagline: "Optimierung, Folgen & Reihen, lineare Programmierung",
    description:
      "Implizite Funktionen, Lagrange & KKT, Folgen/Reihen/Zinsen, Newton-Verfahren und lineare Optimierung (Simplex, graphisch, Dualität).",
    accent: "var(--color-mathe)",
    accentRgb: "99 102 241",
    icon: "∑",
    exam: {
      format: "Open-Book-Klausur (Skripte, Notizen, Bücher, Formelsammlungen – gebunden/geheftet erlaubt)",
      durationMin: 60,
      allowedAids: [
        "Skripte Mathematik 1 & 2",
        "Eigene Notizen, Übungen mit Lösungen, Bücher, Formelsammlungen (gebunden)",
        "Nicht-grafischer, nicht-programmierbarer Taschenrechner (zugelassene Modell-Liste)",
      ],
      structure:
        "4 Aufgaben à 50 Punkte: (1) Implizite Funktionen / Jacobi / Lagrange · (2) Karush-Kuhn-Tucker · (3) Folgen / Reihen / Zinsen / Newton · (4) Lineare Optimierung (Simplex + graphisch + dual)",
      notes: "Rechenweg zwingend – alle Ergebnisse müssen nachvollziehbar hergeleitet sein.",
    },
  },
  {
    id: "statistik",
    title: "Schließende Statistik",
    short: "Statistik",
    tagline: "Wahrscheinlichkeit, Schätzen, Testen, Regression",
    description:
      "Zufallsvariablen & Verteilungen, Punkt- und Intervallschätzung, Hypothesentests und Regression – inkl. R-Auswertung.",
    accent: "var(--color-statistik)",
    accentRgb: "20 184 166",
    icon: "σ",
    exam: {
      format: "Klausur mit erlaubter Formelsammlung + Verteilungstabellen",
      allowedAids: [
        "Formelsammlung Schließende Statistik (inkl. Verteilungstabellen)",
        "Formelsammlung Beschreibende Statistik (geheftet, ohne handschriftliche Notizen)",
        "Verteilungstabellen: Binomial, Standardnormal, Chi², t",
        "Nicht-programmierbarer Taschenrechner, Lineal, dokumentenechter Stift",
      ],
      notes: "Quantile/Wahrscheinlichkeiten werden manuell aus Tabellen abgelesen (keine Software in der Klausur). R wird begleitend geübt.",
    },
  },
  {
    id: "privatrecht",
    title: "Privatrecht",
    short: "Privatrecht",
    tagline: "BGB AT, Rechtsgeschäfte, Schuldrecht – im Gutachtenstil",
    description:
      "Anspruchsgrundlagen, Willenserklärung & Vertragsschluss, Stellvertretung, Leistungsstörungen – mit Fallmethode und juristischer Methodik.",
    accent: "var(--color-privatrecht)",
    accentRgb: "245 158 11",
    icon: "§",
    exam: {
      format: "Klausur im Gutachtenstil (Urteilsstil wird nicht verlangt)",
      allowedAids: ["Nur unkommentierte Gesetzestextsammlung"],
      structure:
        "Fallbearbeitung: „Wer will was von wem woraus?“ – dreistufige Anspruchsprüfung (entstanden / nicht erloschen / durchsetzbar)",
      notes: "Lösungsskizze als Arbeitstechnik (max. 1/3 der Zeit); korrektes Zitieren ist prüfungsrelevant.",
    },
  },
  {
    id: "bwl",
    title: "BWL II – Marketing & Personal",
    short: "BWL",
    tagline: "Marketing-Management & Human Resource Management",
    description:
      "Marketing (Grundlagen, Konsumentenverhalten, Marktforschung, Strategie, CRM, Produkt- & Preispolitik) und Personal (HRM, Recruiting, Führung, Freisetzung) inkl. HBR-Cases.",
    accent: "var(--color-bwl)",
    accentRgb: "236 72 153",
    icon: "▲",
    groups: ["Marketing", "Personal"],
    exam: {
      format: "Klausur „BWL 2“ – zweiteilig",
      durationMin: 60,
      allowedAids: ["Nicht-programmierbarer Taschenrechner (für Rechenaufgaben nötig)"],
      structure: "30 Punkte Marketing + 30 Punkte Personal (im Personalteil Auswahl 1 aus 2 Fragen)",
      notes: "Rechen- & Transferfokus; PINGO-Bonus (max. 3 Punkte). Einzelne Cases/Studien sind auf Englisch.",
    },
  },
];

export const SUBJECT_MAP: Record<SubjectId, SubjectMeta> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s]),
) as Record<SubjectId, SubjectMeta>;

export function getSubjectMeta(id: string): SubjectMeta | undefined {
  return SUBJECT_MAP[id as SubjectId];
}

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);
