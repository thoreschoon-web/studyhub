import { notFound } from "next/navigation";
import { getSubjectMeta } from "@/lib/subjects";
import { getTopicHeaders } from "@/lib/content";
import { SubjectTheme } from "@/components/SubjectTheme";
import { TopicList } from "@/components/subject/TopicList";
import { TutorDock } from "@/components/tutor/TutorDock";
import { Clock, FileCheck2, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject } = await params;
  const meta = getSubjectMeta(subject);
  if (!meta) notFound();

  const headers = getTopicHeaders(meta.id);

  return (
    <SubjectTheme subject={meta} className="mx-auto max-w-5xl px-5 py-10 lg:px-10 lg:py-12">
      <header className="mb-9">
        <div className="flex items-start gap-4">
          <div
            className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-2xl border text-3xl"
            style={{
              color: meta.accent,
              borderColor: `color-mix(in oklab, ${meta.accent} 35%, transparent)`,
              background: `color-mix(in oklab, ${meta.accent} 12%, transparent)`,
            }}
          >
            {meta.icon}
          </div>
          <div className="flex-1">
            <div className="label-mono mb-2" style={{ color: meta.accent }}>{meta.tagline}</div>
            <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-white lg:text-[2.8rem]">{meta.title}</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-muted">{meta.description}</p>
          </div>
        </div>

        {meta.exam && (
          <div className="mt-6 rounded-2xl border border-line bg-surface/50 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <FileCheck2 size={16} style={{ color: meta.accent }} /> Klausur-Info
            </div>
            <dl className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              {meta.exam.format && <Row label="Format" value={meta.exam.format} />}
              {meta.exam.durationMin && (
                <Row label="Dauer" value={`${meta.exam.durationMin} Minuten`} icon={<Clock size={13} />} />
              )}
              {meta.exam.structure && <Row label="Aufbau" value={meta.exam.structure} full />}
              {meta.exam.allowedAids && (
                <Row label="Hilfsmittel" value={meta.exam.allowedAids.join(" · ")} full />
              )}
              {meta.exam.notes && <Row label="Hinweis" value={meta.exam.notes} full icon={<Info size={13} />} />}
            </dl>
          </div>
        )}
      </header>

      {headers.length ? (
        <TopicList headers={headers} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-muted">Die Inhalte für dieses Fach werden gerade aus deinen Unterlagen erstellt.</p>
          <p className="mt-1 text-sm text-faint">Sobald sie fertig sind, erscheinen hier alle Themen.</p>
        </div>
      )}

      <TutorDock
        subject={meta.title}
        suggestions={[
          `Gib mir einen Überblick über ${meta.short}.`,
          "Was sind die wichtigsten Klausurthemen?",
          "Erkläre mir das schwierigste Thema einfach.",
        ]}
      />
    </SubjectTheme>
  );
}

function Row({ label, value, full, icon }: { label: string; value: string; full?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 flex items-start gap-1.5 text-muted">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <span>{value}</span>
      </dd>
    </div>
  );
}
