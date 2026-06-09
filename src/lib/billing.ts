import "server-only";

/**
 * Semester-Pass-Laufzeit: Einmalzahlung schaltet bis zum Ende des laufenden
 * Semesters frei (deutsche Semestergrenzen: SoSe 01.04.–30.09., WiSe 01.10.–31.03.).
 * `SEMESTER_END_OVERRIDE` (YYYY-MM-DD) übersteuert das Datum, z. B. für
 * Kulanz-Verlängerungen kurz vor Semesterende.
 */
export function currentSemesterEnd(now: Date = new Date()): Date {
  const override = process.env.SEMESTER_END_OVERRIDE;
  if (override) {
    const d = new Date(`${override}T23:59:59`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-basiert
  if (m >= 3 && m <= 8) return new Date(y, 8, 30, 23, 59, 59); // SoSe → 30.09.
  return new Date(m >= 9 ? y + 1 : y, 2, 31, 23, 59, 59); // WiSe → 31.03.
}

export function formatSemesterEnd(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
