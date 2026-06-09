import "server-only";
import { Resend } from "resend";

/**
 * Transaktions-Mails via Resend. Graceful-null wie src/lib/stripe.ts:
 * ohne RESEND_API_KEY + MAIL_FROM ist mailEnabled=false und sendMail ein No-Op —
 * abhängige Features (Passwort-Reset, Verifizierung) deaktivieren sich selbst.
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM;

export const mailEnabled = !!apiKey && !!from;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!resend || !from) return false;
  try {
    const { error } = await resend.emails.send({ from, to, subject, text });
    if (error) {
      console.error("[mail] send failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[mail] send failed:", e);
    return false;
  }
}

/** Basis-URL für Links in Mails (Prod: https://<domain>, lokal: AUTH_URL). */
export function appBaseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}
