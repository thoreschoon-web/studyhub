/* ============================================================================
   Content model for the learning platform.
   The same shape is produced by the content-generation pipeline (JSON) and
   consumed by the renderer. Markdown fields may contain $...$ / $$...$$ math.
============================================================================ */

export type SubjectId = "mathe-2" | "statistik" | "privatrecht" | "bwl";

export type Difficulty = "leicht" | "mittel" | "schwer";

export interface SubjectMeta {
  id: SubjectId;
  title: string;
  short: string;
  tagline: string;
  description: string;
  /** CSS color for the subject accent. */
  accent: string;
  accentRgb: string;
  icon: string; // emoji
  groups?: string[]; // optional sub-areas (e.g. BWL → Marketing / Personal)
  exam?: {
    format?: string;
    durationMin?: number;
    allowedAids?: string[];
    structure?: string;
    notes?: string;
  };
}

export type Callout = {
  kind: "info" | "warning" | "tip" | "merksatz" | "beispiel" | "definition" | "formel";
  title?: string;
  body: string; // markdown
};

export type Figure =
  | {
      kind: "function-plot";
      id: string;
      title?: string;
      caption?: string;
      functions: { fn: string; color?: string; label?: string; dashed?: boolean }[];
      domain: [number, number];
      range?: [number, number];
      points?: { x: number; y: number; label?: string; color?: string }[];
    }
  | {
      kind: "distribution";
      id: string;
      title?: string;
      caption?: string;
      dist: "normal" | "t" | "chi2" | "f" | "binomial" | "poisson";
      params: Record<string, number>;
      shade?: { from?: number; to?: number; tail?: "left" | "right" | "two" };
      markers?: { x: number; label?: string }[];
    }
  | { kind: "mermaid"; id: string; title?: string; caption?: string; code: string }
  | { kind: "image"; id: string; title?: string; caption?: string; src: string; alt: string }
  | { kind: "table"; id: string; title?: string; caption?: string; headers: string[]; rows: string[][] };

export interface Section {
  id: string;
  heading: string;
  body: string; // markdown + math
  callouts?: Callout[];
  figures?: Figure[];
}

export type Question =
  | {
      kind: "mc";
      id: string;
      topicId: string;
      difficulty: Difficulty;
      prompt: string;
      options: string[];
      correct: number[]; // indices
      multiple?: boolean;
      explanation: string;
    }
  | {
      kind: "truefalse";
      id: string;
      topicId: string;
      difficulty: Difficulty;
      prompt: string;
      answer: boolean;
      explanation: string;
    }
  | {
      kind: "numeric";
      id: string;
      topicId: string;
      difficulty: Difficulty;
      prompt: string;
      answer: number;
      tolerance: number;
      unit?: string;
      explanation: string;
    }
  | {
      kind: "freetext";
      id: string;
      topicId: string;
      difficulty: Difficulty;
      prompt: string;
      sampleAnswer: string;
      keywords: string[];
      explanation: string;
    };

export interface Exercise {
  id: string;
  topicId: string;
  label: string;
  source: string;
  type: "uebung" | "klausur" | "fall" | "zusatzaufgabe" | "beispiel";
  difficulty?: Difficulty;
  prompt: string; // markdown
  solution: string; // markdown, step-by-step / Gutachten
  hint?: string;
  hasOfficialSolution: boolean;
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
}

export interface Topic {
  id: string;
  subjectId: SubjectId;
  title: string;
  summary: string;
  order: number;
  group?: string;
  estMinutes?: number;
  sections: Section[];
  flashcards: Flashcard[];
  quiz: Question[];
  exercises: Exercise[];
}

/** Lightweight topic header used in lists/nav (no heavy body). */
export interface TopicHeader {
  id: string;
  subjectId: SubjectId;
  title: string;
  summary: string;
  order: number;
  group?: string;
  estMinutes?: number;
  counts: { sections: number; flashcards: number; quiz: number; exercises: number };
}
