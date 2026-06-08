import { SUBJECTS } from "@/lib/subjects";
import { getSubjectTopics } from "@/lib/content";
import { ExamSimulator, type Pool } from "@/components/klausur/ExamSimulator";
import { GraduationCap } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { AuthGate } from "@/components/billing/AuthGate";

export const dynamic = "force-dynamic";

export default async function KlausurPage() {
  const user = await getCurrentUser();
  const pools: Pool[] = SUBJECTS.map((s) => ({
    subjectId: s.id,
    title: s.title,
    short: s.short,
    accent: s.accent,
    icon: s.icon,
    questions: getSubjectTopics(s.id).flatMap((t) => t.quiz),
  }));

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <header className="mb-7">
        <h1 className="font-display flex items-center gap-3 text-3xl font-medium tracking-tight text-heading">
          <GraduationCap size={24} /> Klausur-Simulator
        </h1>
        <p className="mt-1 text-sm text-muted">
          Übe unter realen Bedingungen: Fragen, Zeitlimit, Auswertung am Ende – ganz ohne Lösungen während des Tests.
        </p>
      </header>
      {user ? <ExamSimulator pools={pools} /> : <AuthGate feature="den Klausur-Simulator" />}
    </div>
  );
}
