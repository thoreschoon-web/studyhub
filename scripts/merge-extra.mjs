import fs from "node:fs";
import path from "node:path";

const PROJ = "/Users/thore/Desktop/UNI semester 2/lernplattform";
const CONTENT = path.join(PROJ, "content");
const EXTRA = path.join(PROJ, "data/extra");

// id(slug) -> content file path
const idToPath = {};
for (const sub of fs.readdirSync(CONTENT)) {
  const dir = path.join(CONTENT, sub);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const p = path.join(dir, f);
    try {
      const t = JSON.parse(fs.readFileSync(p, "utf8"));
      if (t.id) idToPath[t.id] = p;
    } catch (e) {
      console.log("  parse-fail:", p);
    }
  }
}

const adds = {}; // path -> {cards:[], quiz:[]}
const ensure = (p) => (adds[p] = adds[p] || { cards: [], quiz: [] });
let skipped = 0;

for (const f of fs.readdirSync(EXTRA)) {
  const full = path.join(EXTRA, f);
  if (f.endsWith(".cards.json")) {
    for (const c of JSON.parse(fs.readFileSync(full, "utf8"))) {
      const p = idToPath[c.topicId];
      if (!p) { console.log("  WARN no topic for card:", c.topicId); skipped++; continue; }
      ensure(p).cards.push({ id: c.id, topicId: c.topicId, front: c.front, back: c.back });
    }
  } else if (f.endsWith(".quiz.json")) {
    for (const q of JSON.parse(fs.readFileSync(full, "utf8"))) {
      const p = idToPath[q.topicId];
      if (!p) { console.log("  WARN no topic for quiz:", q.topicId); skipped++; continue; }
      ensure(p).quiz.push(q);
    }
  }
}

let addedCards = 0, addedQuiz = 0;
for (const [p, a] of Object.entries(adds)) {
  const t = JSON.parse(fs.readFileSync(p, "utf8"));
  t.flashcards = t.flashcards || [];
  t.quiz = t.quiz || [];
  const cardIds = new Set(t.flashcards.map((c) => c.id));
  const quizIds = new Set(t.quiz.map((q) => q.id));
  for (const c of a.cards) if (!cardIds.has(c.id)) { t.flashcards.push(c); cardIds.add(c.id); addedCards++; }
  for (const q of a.quiz) if (!quizIds.has(q.id)) { t.quiz.push(q); quizIds.add(q.id); addedQuiz++; }
  fs.writeFileSync(p, JSON.stringify(t, null, 2));
}

console.log(`\nMerged: +${addedCards} Karten, +${addedQuiz} Quiz (übersprungen: ${skipped})\n`);

// per-subject totals
for (const sub of ["mathe-2", "statistik", "privatrecht", "bwl"]) {
  let c = 0, q = 0;
  for (const f of fs.readdirSync(path.join(CONTENT, sub))) {
    if (!f.endsWith(".json")) continue;
    const t = JSON.parse(fs.readFileSync(path.join(CONTENT, sub, f), "utf8"));
    c += (t.flashcards || []).length;
    q += (t.quiz || []).length;
  }
  const ok = c >= 200 && q >= 100;
  console.log(`  ${ok ? "✓" : "✗"} ${sub.padEnd(12)} Karten=${c} (Ziel ≥200)  Quiz=${q} (Ziel ≥100)`);
}
