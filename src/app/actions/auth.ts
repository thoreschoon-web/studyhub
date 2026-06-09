"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut, auth } from "@/auth";
import { normalizeEmail, isDisposableEmail } from "@/lib/email";
import { mailEnabled, sendMail, appBaseUrl } from "@/lib/mail";
import { createToken, consumeToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";

export type AuthState = { error: string; message?: string };

const schema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail eingeben."),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben."),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };

  // Wegwerf-Mail-Domains blocken (Anti-Abuse der Gratis-Limits).
  if (isDisposableEmail(parsed.data.email)) {
    return { error: "Wegwerf-E-Mail-Adressen sind nicht erlaubt. Bitte nutze eine echte E-Mail-Adresse." };
  }

  // Kanonische Form: Gmail-Punkte/+tags kollabieren auf EIN Konto.
  const email = normalizeEmail(parsed.data.email);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Diese E-Mail ist bereits registriert. Melde dich an." };

  const owner = process.env.OWNER_EMAIL?.toLowerCase();
  const isOwner = !!owner && email === owner;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.user.create({
    data: {
      email,
      passwordHash,
      role: isOwner ? "owner" : "user",
      plan: isOwner ? "owner" : "free",
      usage: { create: {} },
    },
  });

  // Verifizierungs-Mail (best effort — Registrierung scheitert nicht am Mailversand).
  await sendVerificationMail(email);

  // signIn throws a redirect on success.
  await signIn("credentials", { email, password: parsed.data.password, redirectTo: "/" });
  return { error: "" };
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Bitte E-Mail und Passwort eingeben." };
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return { error: "" };
  } catch (e) {
    if (e instanceof AuthError) return { error: "E-Mail oder Passwort ist falsch." };
    throw e; // rethrow the NEXT_REDIRECT on success
  }
}

export async function googleSignInAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/* ---------------- Passwort-Reset & E-Mail-Verifizierung ---------------- */

async function sendVerificationMail(email: string): Promise<boolean> {
  if (!mailEnabled) return false;
  const token = await createToken("verify", email);
  const url = `${appBaseUrl()}/verifizieren?email=${encodeURIComponent(email)}&token=${token}`;
  return sendMail(
    email,
    "Bestätige deine E-Mail-Adresse – StudyHub",
    `Hallo,\n\nbitte bestätige deine E-Mail-Adresse für StudyHub über diesen Link (24 Stunden gültig):\n\n${url}\n\nFalls du dich nicht registriert hast, ignoriere diese E-Mail.\n`
  );
}

/**
 * Fordert eine Passwort-Reset-Mail an. Antwortet IMMER generisch
 * (keine Konto-Enumeration) und ist rate-limitiert.
 */
export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email || !email.includes("@")) return { error: "Bitte eine gültige E-Mail eingeben." };
  if (!mailEnabled) return { error: "Passwort-Zurücksetzen ist derzeit nicht verfügbar. Bitte wende dich an den Support." };

  const rl = await rateLimit(`pwreset:${email}`, 3, 3_600_000);
  if (rl.ok) {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const token = await createToken("reset", email);
      const url = `${appBaseUrl()}/passwort-reset?email=${encodeURIComponent(email)}&token=${token}`;
      await sendMail(
        email,
        "Passwort zurücksetzen – StudyHub",
        `Hallo,\n\nüber diesen Link kannst du ein neues Passwort für StudyHub setzen (1 Stunde gültig):\n\n${url}\n\nFalls du das nicht angefordert hast, ignoriere diese E-Mail — dein Passwort bleibt unverändert.\n`
      );
    }
  }
  // Bewusst identische Antwort, ob das Konto existiert oder nicht / ob das Limit griff.
  return { error: "", message: "Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link geschickt." };
}

/** Setzt das Passwort mit gültigem Token neu; verifiziert dabei die E-Mail (Postfach-Beweis). */
export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Passwort muss mindestens 6 Zeichen haben." };

  const valid = await consumeToken("reset", email, token);
  if (!valid) return { error: "Der Link ist ungültig oder abgelaufen. Fordere einen neuen an." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({ where: { email }, data: { passwordHash, emailVerified: new Date() } });
  return { error: "", message: "Passwort geändert. Du kannst dich jetzt anmelden." };
}

/** Schickt dem eingeloggten, unverifizierten Nutzer den Bestätigungslink erneut. */
export async function resendVerificationAction(): Promise<void> {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return;
  const user = await db.user.findUnique({ where: { id } });
  if (!user?.email || user.emailVerified) return;
  const rl = await rateLimit(`verify:${user.email}`, 3, 3_600_000);
  if (rl.ok) await sendVerificationMail(user.email);
}
