import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const BASE = "http://localhost:3000";
const pass = (b) => (b ? "✓" : "✗ FEHLER");

async function ensureUser(email, password, plan) {
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return db.user.update({ where: { email }, data: { plan, passwordHash, usage: { upsert: { create: {}, update: {} } } } });
  return db.user.create({ data: { email, passwordHash, role: "user", plan, usage: { create: {} } } });
}
async function resetData(userId) {
  await db.topicProgress.deleteMany({ where: { userId } });
  await db.srsCard.deleteMany({ where: { userId } });
  await db.examAttempt.deleteMany({ where: { userId } });
  await db.usage.upsert({ where: { userId }, create: { userId }, update: { pagesOpened: "[]", flashcardsRead: 0, exercisesDone: 0, quizAnswered: 0 } });
}
function jar() {
  const j = {};
  return {
    set: (res) => { const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : []; for (const c of sc) { const kv = c.split(";")[0]; const i = kv.indexOf("="); j[kv.slice(0, i)] = kv.slice(i + 1); } },
    hdr: () => Object.entries(j).map(([k, v]) => k + "=" + v).join("; "),
  };
}
async function login(email, password) {
  const c = jar();
  let r = await fetch(BASE + "/api/auth/csrf", { headers: { cookie: c.hdr() } }); c.set(r);
  const { csrfToken } = await r.json();
  const body = new URLSearchParams({ csrfToken, email, password, callbackUrl: BASE + "/" }).toString();
  r = await fetch(BASE + "/api/auth/callback/credentials", { method: "POST", redirect: "manual", headers: { cookie: c.hdr(), "content-type": "application/x-www-form-urlencoded" }, body }); c.set(r);
  return c;
}
const post = (c, action, args) => fetch(BASE + "/api/progress", { method: "POST", headers: { cookie: c.hdr(), "content-type": "application/json" }, body: JSON.stringify({ action, args }) }).then((r) => r.json());
const getStore = (c) => fetch(BASE + "/api/progress", { headers: { cookie: c.hdr() } }).then((r) => r.json());

(async () => {
  for (let i = 0; i < 45; i++) { try { const r = await fetch(BASE + "/login"); if (r.ok) break; } catch {} await new Promise((r) => setTimeout(r, 1000)); }

  const free = await ensureUser("free@test.de", "test123456", "free");
  const paid = await ensureUser("paid@test.de", "test123456", "paid");

  console.log("=== 1. Gating ===");
  let r = await fetch(BASE + "/", { redirect: "manual" });
  console.log("  ausgeloggt / -> " + r.status + " " + pass(r.status === 200) + " (öffentlich)");
  r = await fetch(BASE + "/mathe-2/jacobi-matrix");
  const anonTopic = await r.text();
  console.log("  ausgeloggt Thema -> " + r.status + " " + pass(r.status === 200 && !anonTopic.includes("Gratis-Limit") && anonTopic.includes("Kostenlos registrieren")));
  r = await fetch(BASE + "/upgrade", { redirect: "manual" });
  console.log("  ausgeloggt /upgrade -> " + r.status + " " + pass(r.status === 307 && /login/.test(r.headers.get("location") || "")));
  const cFree = await login("free@test.de", "test123456");
  r = await fetch(BASE + "/", { headers: { cookie: cFree.hdr() }, redirect: "manual" });
  console.log("  eingeloggt / -> " + r.status + " " + pass(r.status === 200));

  console.log("=== 2. Konto-Fortschritt persistiert ===");
  await resetData(free.id);
  await post(cFree, "recordQuiz", { topicId: "kkt", questionId: "QX", correct: true });
  const s2 = await getStore(cFree);
  console.log("  " + pass(s2.topics?.kkt?.quizCorrect?.includes("QX")));

  console.log("=== 3. Interaktions-Limits (frei: 3/1/3) ===");
  await resetData(free.id);
  const qr = []; for (let i = 1; i <= 4; i++) qr.push(await post(cFree, "recordQuiz", { topicId: "kkt", questionId: "q" + i, correct: true }));
  console.log("  Quiz 1-3 ok, 4. blockiert: " + pass(qr.slice(0, 3).every((x) => x.ok) && qr[3].limit === "quiz"));
  await resetData(free.id);
  const cr = []; for (let i = 1; i <= 4; i++) cr.push(await post(cFree, "gradeCard", { cardId: "c" + i, quality: 4 }));
  console.log("  Karten 1-3 ok, 4. blockiert: " + pass(cr.slice(0, 3).every((x) => x.ok) && cr[3].limit === "flashcards"));
  await resetData(free.id);
  const er = []; for (let i = 1; i <= 2; i++) er.push(await post(cFree, "toggleExercise", { topicId: "kkt", exId: "e" + i }));
  console.log("  Aufgabe 1 ok, 2. blockiert: " + pass(er[0].ok && er[1].limit === "exercises"));

  console.log("=== 4. Seiten-Limit (5 -> 6. Paywall) ===");
  await resetData(free.id);
  const topics = ["jacobi-matrix", "implizite-funktionen", "lagrange", "umhuellendensatz", "kkt", "folgen"];
  let last = ""; for (const t of topics) { r = await fetch(BASE + "/mathe-2/" + t, { headers: { cookie: cFree.hdr() } }); last = await r.text(); }
  console.log("  6. Seite Paywall: " + pass(last.includes("Gratis-Limit erreicht")));
  r = await fetch(BASE + "/mathe-2/jacobi-matrix", { headers: { cookie: cFree.hdr() } }); const first = await r.text();
  console.log("  bereits geöffnete Seite frei: " + pass(!first.includes("Gratis-Limit erreicht") && /Jacobi/i.test(first)));

  console.log("=== 5. Paid = unbegrenzt ===");
  const cPaid = await login("paid@test.de", "test123456");
  await resetData(paid.id);
  const pr = []; for (let i = 1; i <= 6; i++) pr.push(await post(cPaid, "gradeCard", { cardId: "p" + i, quality: 4 }));
  console.log("  6 Karten alle ok: " + pass(pr.every((x) => x.ok)));
  let pp = ""; for (const t of topics) { r = await fetch(BASE + "/mathe-2/" + t, { headers: { cookie: cPaid.hdr() } }); pp = await r.text(); }
  console.log("  6. Seite frei (keine Paywall): " + pass(!pp.includes("Gratis-Limit erreicht")));

  console.log("=== 6. Konten isoliert ===");
  const fS = await getStore(cFree), pS = await getStore(cPaid);
  console.log("  free hat p1? " + !!fS.srs?.p1 + " | paid hat p1? " + !!pS.srs?.p1 + " -> " + pass(!fS.srs?.p1 && !!pS.srs?.p1));

  console.log("=== 7. KI-Gate ===");
  r = await fetch(BASE + "/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }) });
  console.log("  ohne Login -> " + r.status + " " + pass(r.status === 401));
  r = await fetch(BASE + "/api/chat", { method: "POST", headers: { cookie: cFree.hdr(), "content-type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }) });
  console.log("  eingeloggt, kein Key -> " + r.status + " " + pass(r.status === 503));

  // cleanup test accounts
  await db.user.deleteMany({ where: { email: { in: ["free@test.de", "paid@test.de", "testuser@example.com"] } } });
  console.log("\n(Test-Konten gelöscht — deine DB ist sauber)");
  await db.$disconnect();
})();
