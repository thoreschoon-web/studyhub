import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";
import { getSubjectTopics, getSubjectStat } from "@/lib/content";
import { getCurrentUser } from "@/lib/session";
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { LearnInsights } from "@/components/dashboard/LearnInsights";
import { GraduationCap, Sparkles, Layers, ArrowUpRight } from "lucide-react";
import { AnonCta } from "@/components/dashboard/AnonCta";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getCurrentUser();
  const cards = SUBJECTS.map((meta) => {
    const topics = getSubjectTopics(meta.id);
    const stat = getSubjectStat(meta.id);
    return {
      meta,
      counts: { topics: stat.topics, exercises: stat.exercises, flashcards: stat.flashcards, quiz: stat.quiz },
      topicIds: topics.map((t) => t.id),
      totalQuiz: stat.quiz,
      cardIds: topics.flatMap((t) => t.flashcards.map((c) => c.id)),
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:px-10 lg:py-20">
      <AnonCta />
      {/* ── HERO ───────────────────────────────────────────────── */}
      <header className="max-w-3xl">
        <div className="label-mono animate-fade-in">
          Sommersemester 2026 · Leibniz Universität Hannover
        </div>
        <h1 className="font-display mt-5 text-[2.5rem] font-semibold leading-[1.03] tracking-tight text-heading lg:text-[3.75rem] animate-fade-in-up">
          Lernmaterial für die
          <br />
          Wirtschafts&shy;wissenschaften.
        </h1>
        <p
          className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted animate-fade-in-up"
          style={{ animationDelay: "80ms" }}
        >
          Alles für deine WiWi-Klausuren im{" "}
          <span className="text-text">Sommersemester 2026 an der LUH</span> — vier Fächer von Grund auf
          erklärt, mit durchgerechneten Beispielen, interaktiven Quizzen, Karteikarten nach
          Spaced-Repetition und einem KI-Tutor, der deine Unterlagen kennt.
        </p>
      </header>

      {/* ── LERNSTAND (nur eingeloggt) ─────────────────────────── */}
      {user && <LearnInsights userId={user.id} />}

      {/* ── FÄCHER ─────────────────────────────────────────────── */}
      <div className="mt-16 flex items-baseline justify-between">
        <span className="label-mono">Deine Fächer</span>
        <span className="label-mono">{String(cards.length).padStart(2, "0")} Fächer</span>
      </div>
      <div className="rule mt-3" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <SubjectCard key={c.meta.id} {...c} index={i} />
        ))}
      </div>

      {/* ── WERKZEUGE ──────────────────────────────────────────── */}
      <div className="mt-14 flex items-baseline justify-between">
        <span className="label-mono">Werkzeuge</span>
        <span className="label-mono">03</span>
      </div>
      <div className="rule mt-3" />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ToolCard n="01" href="/karteikarten" icon={<Layers size={17} />} title="Karteikarten" desc="Spaced-Repetition über alle Fächer" />
        <ToolCard n="02" href="/klausur" icon={<GraduationCap size={17} />} title="Klausur-Simulator" desc="Üben unter realen Bedingungen" />
        <ToolCard n="03" href="/tutor" icon={<Sparkles size={17} />} title="KI-Tutor" desc="Fragen zu jedem Thema stellen" />
      </div>
    </div>
  );
}

function ToolCard({
  n,
  href,
  icon,
  title,
  desc,
}: {
  n: string;
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-[var(--radius)] border border-line bg-surface/40 p-5 transition-colors duration-200 hover:border-line-soft hover:bg-surface-2/60"
    >
      <div className="flex items-center justify-between">
        <span className="numeral font-mono text-xs text-faint">{n}</span>
        <ArrowUpRight size={15} className="text-faint transition-colors group-hover:text-text" />
      </div>
      <span className="mt-6 text-muted transition-colors group-hover:text-text">{icon}</span>
      <div className="mt-3 font-medium text-heading">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-muted">{desc}</div>
    </Link>
  );
}
