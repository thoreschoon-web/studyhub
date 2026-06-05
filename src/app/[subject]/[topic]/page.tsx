import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectMeta } from "@/lib/subjects";
import { getSubjectTopics, getTopic } from "@/lib/content";
import { SubjectTheme } from "@/components/SubjectTheme";
import { SectionView } from "@/components/content/SectionView";
import { TabsShell, type TabDef } from "@/components/learn/TabsShell";
import { QuizEngine } from "@/components/learn/QuizEngine";
import { FlashcardDeck } from "@/components/learn/FlashcardDeck";
import { ExerciseList } from "@/components/learn/ExerciseList";
import { TutorDock } from "@/components/tutor/TutorDock";
import { PdfButton } from "@/components/PdfButton";
import { BookOpen, ListChecks, Layers, FileText, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TopicPage({ params }: { params: Promise<{ subject: string; topic: string }> }) {
  const { subject, topic: topicId } = await params;
  const meta = getSubjectMeta(subject);
  if (!meta) notFound();
  const topic = getTopic(meta.id, topicId);
  if (!topic) notFound();

  const all = getSubjectTopics(meta.id);
  const idx = all.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  const isMath = meta.id === "mathe-2" || meta.id === "statistik";
  const context = topic.sections.map((s) => `## ${s.heading}\n${s.body}`).join("\n\n");

  const tabs: TabDef[] = [
    {
      id: "lernen",
      label: "Lernen",
      icon: <BookOpen size={15} />,
      content: <SectionView sections={topic.sections} />,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: <ListChecks size={15} />,
      badge: topic.quiz.length,
      content: (
        <div className="mx-auto max-w-2xl">
          <QuizEngine questions={topic.quiz} topicId={topic.id} />
        </div>
      ),
    },
    {
      id: "karten",
      label: "Karteikarten",
      icon: <Layers size={15} />,
      badge: topic.flashcards.length,
      content: (
        <div className="mx-auto max-w-2xl">
          <FlashcardDeck cards={topic.flashcards} />
        </div>
      ),
    },
    {
      id: "aufgaben",
      label: "Aufgaben",
      icon: <FileText size={15} />,
      badge: topic.exercises.length,
      content: <ExerciseList exercises={topic.exercises} />,
    },
  ];

  return (
    <SubjectTheme subject={meta} className={`mx-auto max-w-3xl px-5 py-8 lg:px-8 lg:py-10 ${isMath ? "math-karo" : ""}`}>
      <div className="no-print mb-6">
        <Link href={`/${meta.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text">
          <ArrowLeft size={15} /> {meta.title}
        </Link>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <div className="label-mono mb-2" style={{ color: "var(--accent)" }}>
              {meta.short} · Thema {idx + 1}
            </div>
            <h1 className="font-display text-3xl font-medium leading-[1.1] tracking-tight text-heading lg:text-[2.6rem]">
              {topic.title}
            </h1>
            <p className="serif-italic mt-3 max-w-2xl text-lg leading-relaxed text-muted">{topic.summary}</p>
          </div>
          <PdfButton targetId="pdf-export-root" filename={`${topic.id}.pdf`} />
        </div>
      </div>

      <div className="no-print">
        <TabsShell tabs={tabs} />
      </div>

      {/* PDF export source — rendered off-screen, captured by the "Als PDF" button */}
      <div id="pdf-export-root" aria-hidden className="pdf-export-root">
        <div className="label-mono mb-2" style={{ color: "var(--accent)" }}>{meta.short} · Thema {idx + 1}</div>
        <h1 className="font-display mb-1 text-3xl font-medium tracking-tight text-heading">{topic.title}</h1>
        <p className="serif-italic mb-7 text-muted">{topic.summary}</p>
        <SectionView sections={topic.sections} />
      </div>

      <nav className="no-print mt-10 flex items-center justify-between gap-3 border-t border-line pt-5">
        {prev ? (
          <Link href={`/${meta.id}/${prev.id}`} className="group flex items-center gap-2 text-sm text-muted hover:text-text">
            <ChevronLeft size={16} />
            <span className="text-right">
              <span className="block text-[0.7rem] text-faint">Zurück</span>
              <span className="line-clamp-1">{prev.title}</span>
            </span>
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/${meta.id}/${next.id}`} className="group ml-auto flex items-center gap-2 text-right text-sm text-muted hover:text-text">
            <span>
              <span className="block text-[0.7rem] text-faint">Weiter</span>
              <span className="line-clamp-1">{next.title}</span>
            </span>
            <ChevronRight size={16} />
          </Link>
        ) : <span />}
      </nav>

      <TutorDock
        subject={meta.title}
        topic={topic.title}
        context={context}
        suggestions={[
          `Erkläre mir „${topic.title}“ in einfachen Worten.`,
          "Gib mir eine typische Klausuraufgabe dazu.",
          "Was sind die häufigsten Fehler bei diesem Thema?",
        ]}
      />
    </SubjectTheme>
  );
}
