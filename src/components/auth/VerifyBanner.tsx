import { getCurrentUser } from "@/lib/session";
import { mailEnabled } from "@/lib/mail";
import { resendVerificationAction } from "@/app/actions/auth";
import { MailWarning } from "lucide-react";

/**
 * Weicher Hinweis für unverifizierte Konten (Server-Komponente, im Root-Layout).
 * Erscheint nur, wenn Mailversand konfiguriert ist — hart erzwungen wird die
 * Verifizierung erst beim Checkout.
 */
export async function VerifyBanner() {
  if (!mailEnabled) return null;
  const user = await getCurrentUser();
  if (!user?.email || user.emailVerified) return null;

  return (
    <div className="border-b border-warn/30 bg-warn/10 px-5 py-2.5">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <MailWarning size={15} className="shrink-0 text-warn" />
        <span className="text-muted">
          Bitte bestätige deine E-Mail-Adresse — wir haben dir einen Link an{" "}
          <strong className="text-text">{user.email}</strong> geschickt.
        </span>
        <form action={resendVerificationAction}>
          <button className="font-medium underline-offset-2 hover:underline" style={{ color: "var(--accent)" }}>
            Link erneut senden
          </button>
        </form>
      </div>
    </div>
  );
}
