import type { SubjectMeta } from "@/lib/types";

/** Sets the per-subject accent CSS variables for everything inside. */
export function SubjectTheme({
  subject,
  children,
  className,
}: {
  subject: SubjectMeta;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ "--accent": subject.accent, "--accent-rgb": subject.accentRgb } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
