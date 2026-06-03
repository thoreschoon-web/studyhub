import Link from "next/link";
import { SUBJECTS } from "@/lib/subjects";
import { getSubjectTopics, getSubjectStat } from "@/lib/content";
import { SubjectCard } from "@/components/dashboard/SubjectCard";
import { GraduationCap, Sparkles, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default function Dashboard() {
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
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10 lg:py-16">
      <header className="mb-12 max-w-3xl">
        <div className="label-mono animate-fade-in">Sommersemester 26 · Lernplattform</div>
        <h1 className="font-display mt-3 text-4xl font-medium leading-[1.05] tracking-tight text-white lg:text-[3.4rem] animate-fade-in-up">
          Wissen, das <span className="serif-italic" style={{ color: "var(--accent)" }}>sitzt</span>.
        </h1>
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          Vier Fächer, von Grund auf erklärt — mit durchgerechneten Beispielen, interaktiven Quizzen,
          Karteikarten nach Spaced-Repetition und einem KI-Tutor, der deine Unterlagen kennt.
        </p>
      </header>

      <div className="mb-4 flex items-center gap-4">
        <span className="label-mono">Deine Fächer</span>
        <span className="hairline flex-1" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <SubjectCard key={c.meta.id} {...c} index={i} />
        ))}
      </div>

      <div className="mt-10 mb-4 flex items-center gap-4">
        <span className="label-mono">Werkzeuge</span>
        <span className="hairline flex-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ToolCard href="/karteikarten" icon={<Layers size={18} />} title="Karteikarten" desc="Spaced-Repetition über alle Fächer" />
        <ToolCard href="/klausur" icon={<GraduationCap size={18} />} title="Klausur-Simulator" desc="Üben unter realen Bedingungen" />
        <ToolCard href="/tutor" icon={<Sparkles size={18} />} title="KI-Tutor" desc="Fragen zu jedem Thema stellen" />
      </div>
    </div>
  );
}

function ToolCard({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface/40 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-line-soft hover:bg-surface-2/60"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:text-text">
        {icon}
      </span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted">{desc}</div>
      </div>
    </Link>
  );
}
