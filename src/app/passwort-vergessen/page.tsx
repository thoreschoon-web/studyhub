import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/PasswordResetForms";

export const metadata: Metadata = { title: "Passwort vergessen · StudyHub" };

export default function PasswortVergessenPage() {
  return <RequestResetForm />;
}
