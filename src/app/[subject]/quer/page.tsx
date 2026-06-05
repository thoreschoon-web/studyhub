import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectMeta } from "@/lib/subjects";
import { getSubjectTopics } from "@/lib/content";
import { SubjectTheme } from "@/components/SubjectTheme";
import { TabsShell, type TabDef } from "@/components/learn/TabsShell";
import { QuizEngine } from "@/components/learn/QuizEngine";
import { FlashcardDeck } from "@/components/learn/FlashcardDeck";
import { ExerciseList } from "@/components/learn/ExerciseList";
import { ArrowLeft, ListChecks, Layers, FileText, Shuffle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QuerPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const meta = getSubjectMeta(subject);
  if (!meta) notFound();

  const topics = getSubjectTopics(meta.id);
  const quiz = topics.flatMap((t) => t.quiz);
  const cards = topics.flatMap((t) => t.flashcards);
  const exercises = topics.flatMap((t) => t.exercises);
  const isMath = meta.id === "mathe-2" || meta.id === "statistik";

  const tabs: TabDef[] = [
    {
      id: "quiz",
      label: "Quiz",
      icon: <ListChecks size={15} />,
      badge: quiz.length,
      content: (
        <div className="mx-auto max-w-2xl">
          <QuizEngine questions={quiz} topicId={`${meta.id}-quer`} />
        </div>
      ),
    },
    {
      id: "karten",
      label: "Karteikarten",
      icon: <Layers size={15} />,
      badge: cards.length,
      content: (
        <div className="mx-auto max-w-2xl">
          <FlashcardDeck cards={cards} />
        </div>
      ),
    },
    {
      id: "aufgaben",
      label: "Aufgaben",
      icon: <FileText size={15} />,
      badge: exercises.length,
      content: <ExerciseList exercises={exercises} />,
    },
  ];

  return (
    <SubjectTheme subject={meta} className={`mx-auto max-w-3xl px-5 py-8 lg:px-8 lg:py-10 ${isMath ? "math-karo" : ""}`}>
      <Link href={`/${meta.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text">
        <ArrowLeft size={15} /> {meta.title}
      </Link>
      <header className="mb-7 mt-4">
        <div className="label-mono mb-2" style={{ color: "var(--accent)" }}>{meta.short} · Querbeet</div>
        <h1 className="font-display flex items-center gap-3 text-3xl font-medium tracking-tight text-heading lg:text-4xl">
          <Shuffle size={26} style={{ color: "var(--accent)" }} /> Alles gemischt lernen
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Quiz, Karteikarten und Aufgaben aus <strong className="text-text">allen {topics.length} Themen</strong> dieses Fachs –
          quer durcheinander gemischt, ideal zum Wiederholen am Ende der Lernphase.
        </p>
      </header>
      <TabsShell tabs={tabs} />
    </SubjectTheme>
  );
}
