import { TutorChat } from "@/components/tutor/TutorChat";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { AuthGate } from "@/components/billing/AuthGate";

export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex h-[calc(100vh-1px)] max-w-3xl flex-col px-5 py-8 lg:px-8">
      <header className="mb-4">
        <h1 className="font-display flex items-center gap-3 text-3xl font-medium tracking-tight text-heading">
          <Sparkles size={22} style={{ color: "var(--accent)" }} /> KI-Tutor
        </h1>
        <p className="mt-1 text-sm text-muted">
          Stell Fragen zu jedem Thema. Auf den Themenseiten kennt der Tutor zusätzlich deine Kursunterlagen.
        </p>
      </header>
      {user ? (
        <div className="flex-1 min-h-0 rounded-2xl border border-line bg-surface/40 p-4">
          <TutorChat
            suggestions={[
              "Erkläre mir den Unterschied zwischen Lagrange und KKT.",
              "Wie funktioniert ein Hypothesentest, Schritt für Schritt?",
              "Was prüfe ich beim Vertragsschluss im Gutachtenstil?",
              "Erkläre die Preiselastizität der Nachfrage mit Beispiel.",
            ]}
            className="h-full"
          />
        </div>
      ) : (
        <AuthGate feature="den KI-Tutor" />
      )}
    </div>
  );
}
