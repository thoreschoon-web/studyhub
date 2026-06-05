import fs from "node:fs";
import path from "node:path";

const PROJ = "/Users/thore/Desktop/UNI semester 2/lernplattform";
const corpus = JSON.parse(fs.readFileSync(path.join(PROJ, "data/corpus-map.json"), "utf8"));

function slugify(s) {
  return s.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 42).replace(/-$/,"");
}

// Map corpus subjectMaps -> our subjects
function classify(subjectStr) {
  if (subjectStr.startsWith("Mathematik 2")) return { subject: "mathe-2", group: null, key: "mathe-2" };
  if (subjectStr.startsWith("Schließende Statistik")) return { subject: "statistik", group: null, key: "statistik" };
  if (subjectStr.startsWith("Privatrecht")) return { subject: "privatrecht", group: null, key: "privatrecht" };
  if (subjectStr.includes("Marketing")) return { subject: "bwl", group: "Marketing", key: "bwl-marketing" };
  if (subjectStr.includes("Personal")) return { subject: "bwl", group: "Personal", key: "bwl-personal" };
  return { subject: "unknown", group: null, key: "unknown" };
}

// Fixed, nice slugs for Mathe (matches existing hand-authored files)
const MATHE_SLUGS = {
  t1: "jacobi-matrix", t2: "implizite-funktionen", t3: "lagrange", t4: "umhuellendensatz",
  t5: "kkt", t6: "folgen", t7: "reihen", t8: "newton-verfahren", t9: "exp-log-zins",
  t10: "lineare-optimierung-graphisch", t11: "simplex-dualitaet", t12: "integralrechnung",
};

const TOPICS = [];
let orderBySubject = {};

for (const sm of corpus.subjectMaps) {
  const c = classify(sm.subject);
  if (c.subject === "unknown") continue;
  // write per-subject (per-map) file
  const mapFile = path.join(PROJ, `data/genmap-${c.key}.json`);
  fs.writeFileSync(mapFile, JSON.stringify(sm, null, 0));
  orderBySubject[c.subject] = orderBySubject[c.subject] || 0;

  sm.topics.forEach((tp, index) => {
    let slug;
    if (c.subject === "mathe-2") slug = MATHE_SLUGS[tp.id] || slugify(tp.title);
    else {
      const prefix = c.group === "Marketing" ? "mkt-" : c.group === "Personal" ? "hr-" : "";
      slug = prefix + slugify(tp.title);
    }
    orderBySubject[c.subject] += 1;
    TOPICS.push({
      subject: c.subject,
      group: c.group,
      mapFile,
      index,
      ref: tp.id,
      title: tp.title,
      slug,
      order: orderBySubject[c.subject],
    });
  });
}

// dedupe slugs within a subject
const seen = {};
for (const t of TOPICS) {
  const k = t.subject + "/" + t.slug;
  if (seen[k]) { t.slug = t.slug + "-" + t.ref; }
  seen[t.subject + "/" + t.slug] = true;
}

fs.writeFileSync(path.join(PROJ, "data/gen-topics.json"), JSON.stringify(TOPICS, null, 0));

// summary
const bySub = {};
for (const t of TOPICS) bySub[t.subject] = (bySub[t.subject] || 0) + 1;
console.log("TOPIC COUNTS:", JSON.stringify(bySub));
console.log("TOTAL:", TOPICS.length);
console.log("\nMAP FILES written:");
for (const sm of corpus.subjectMaps) { const c = classify(sm.subject); if (c.subject !== "unknown") console.log("  data/genmap-" + c.key + ".json"); }
console.log("\nTOPICS (compact JSON):");
console.log(JSON.stringify(TOPICS));
