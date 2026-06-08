import fs from "node:fs";
import path from "node:path";
import { parse } from "mathjs";

const PROJ = "/Users/thore/Desktop/UNI semester 2/lernplattform";
const CONTENT = path.join(PROJ, "content");
const PUBLIC = path.join(PROJ, "public");
const DIST = new Set(["normal", "t", "chi2", "f", "binomial", "poisson"]);
const QKINDS = new Set(["mc", "truefalse", "numeric", "freetext"]);

const issues = [];
const add = (sev, where, msg) => issues.push({ sev, where, msg });

const subjects = fs.readdirSync(CONTENT).filter((d) => fs.statSync(path.join(CONTENT, d)).isDirectory());
const totals = {};

for (const sub of subjects) {
  let c = { topics: 0, sections: 0, flashcards: 0, quiz: 0, exercises: 0, figures: 0 };
  for (const f of fs.readdirSync(path.join(CONTENT, sub))) {
    if (!f.endsWith(".json")) continue;
    const p = path.join(CONTENT, sub, f);
    let t;
    try { t = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { add("ERR", `${sub}/${f}`, "invalid JSON: " + e.message); continue; }
    const w = `${sub}/${f}`;
    c.topics++;
    c.sections += (t.sections || []).length;
    c.flashcards += (t.flashcards || []).length;
    c.quiz += (t.quiz || []).length;
    c.exercises += (t.exercises || []).length;

    if (t.id !== f.replace(/\.json$/, "")) add("WARN", w, `id "${t.id}" != filename`);

    // ids unique
    const cardIds = new Set(), qIds = new Set();
    for (const fc of t.flashcards || []) { if (cardIds.has(fc.id)) add("WARN", w, `dup flashcard id ${fc.id}`); cardIds.add(fc.id); if (!fc.front || !fc.back) add("ERR", w, `flashcard ${fc.id} empty front/back`); }

    // quiz validation
    for (const q of t.quiz || []) {
      if (qIds.has(q.id)) add("WARN", w, `dup quiz id ${q.id}`); qIds.add(q.id);
      if (!QKINDS.has(q.kind)) { add("ERR", w, `quiz ${q.id} bad kind ${q.kind}`); continue; }
      if (!q.prompt) add("ERR", w, `quiz ${q.id} empty prompt`);
      if (q.kind === "mc") {
        if (!Array.isArray(q.options) || q.options.length < 2) add("ERR", w, `mc ${q.id} <2 options`);
        if (!Array.isArray(q.correct) || q.correct.length < 1) add("ERR", w, `mc ${q.id} no correct[]`);
        else for (const ci of q.correct) if (!Number.isInteger(ci) || ci < 0 || ci >= (q.options || []).length) add("ERR", w, `mc ${q.id} correct idx ${ci} out of range`);
      } else if (q.kind === "truefalse") {
        if (typeof q.answer !== "boolean") add("ERR", w, `truefalse ${q.id} answer not boolean`);
      } else if (q.kind === "numeric") {
        if (typeof q.answer !== "number" || !Number.isFinite(q.answer)) add("ERR", w, `numeric ${q.id} answer not finite`);
        if (typeof q.tolerance !== "number" || !(q.tolerance >= 0)) add("ERR", w, `numeric ${q.id} bad tolerance`);
      } else if (q.kind === "freetext") {
        if (!Array.isArray(q.keywords) || q.keywords.length < 1) add("WARN", w, `freetext ${q.id} no keywords (auto-grade weak)`);
        if (!q.sampleAnswer) add("WARN", w, `freetext ${q.id} no sampleAnswer`);
      }
      if (!q.explanation) add("WARN", w, `quiz ${q.id} no explanation`);
    }

    // figures
    for (const s of t.sections || []) {
      for (const fig of s.figures || []) {
        c.figures++;
        const fw = `${w} fig ${fig.id || "?"}`;
        if (fig.kind === "function-plot") {
          if (!Array.isArray(fig.functions) || !fig.functions.length) add("ERR", fw, "function-plot no functions");
          else for (const fn of fig.functions) { try { parse(fn.fn); } catch (e) { add("ERR", fw, `unparsable fn "${fn.fn}": ${e.message}`); } }
          if (!Array.isArray(fig.domain) || fig.domain.length !== 2) add("ERR", fw, "function-plot bad domain");
        } else if (fig.kind === "distribution") {
          if (!DIST.has(fig.dist)) add("ERR", fw, `bad dist "${fig.dist}"`);
          if (!fig.params || typeof fig.params !== "object") add("ERR", fw, "distribution no params");
        } else if (fig.kind === "mermaid") {
          if (!fig.code || !/graph|flowchart|sequenceDiagram|stateDiagram|classDiagram|erDiagram/i.test(fig.code)) add("WARN", fw, "mermaid code missing/odd");
        } else if (fig.kind === "table") {
          if (!Array.isArray(fig.headers) || !Array.isArray(fig.rows)) add("ERR", fw, "table missing headers/rows");
          else for (const r of fig.rows) if (r.length !== fig.headers.length) add("WARN", fw, "table row length != headers");
        } else if (fig.kind === "image") {
          if (!fig.src || !fs.existsSync(path.join(PUBLIC, fig.src.replace(/^\//, "")))) add("ERR", fw, `image src missing: ${fig.src}`);
        } else {
          add("WARN", fw, `unknown figure kind ${fig.kind}`);
        }
      }
    }

    // exercises
    for (const ex of t.exercises || []) {
      if (!ex.prompt) add("ERR", w, `exercise ${ex.id} empty prompt`);
      if (!ex.solution) add("WARN", w, `exercise ${ex.id} empty solution`);
    }
  }
  totals[sub] = c;
}

console.log("=== Inhalts-Zahlen pro Fach (Datenbasis) ===");
for (const [s, c] of Object.entries(totals)) console.log(`  ${s.padEnd(12)} themen=${c.topics} sections=${c.sections} quiz=${c.quiz} karten=${c.flashcards} aufgaben=${c.exercises} figuren=${c.figures}`);

const errs = issues.filter((i) => i.sev === "ERR");
const warns = issues.filter((i) => i.sev === "WARN");
console.log(`\n=== Befunde: ${errs.length} ERR, ${warns.length} WARN ===`);
for (const i of errs) console.log(`  ✗ [${i.where}] ${i.msg}`);
console.log("  --- Warnungen (unkritisch) ---");
for (const i of warns.slice(0, 40)) console.log(`  ! [${i.where}] ${i.msg}`);
if (warns.length > 40) console.log(`  … +${warns.length - 40} weitere Warnungen`);
console.log(`\nERR_COUNT=${errs.length}`);
