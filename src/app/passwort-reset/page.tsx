import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/PasswordResetForms";

export const metadata: Metadata = { title: "Passwort zurücksetzen · StudyHub" };
export const dynamic = "force-dynamic";

export default async function PasswortResetPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;
  if (!email || !token) {
    return (
      <div className="grid min-h-[80vh] place-items-center px-5 text-center">
        <div>
          <p className="text-muted">Der Link ist unvollständig.</p>
          <Link href="/passwort-vergessen" className="mt-3 inline-block font-medium" style={{ color: "var(--accent)" }}>
            Neuen Link anfordern
          </Link>
        </div>
      </div>
    );
  }
  return <ResetPasswordForm email={email} token={token} />;
}
