"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/auth";
import { normalizeEmail, isDisposableEmail } from "@/lib/email";

export type AuthState = { error: string };

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
