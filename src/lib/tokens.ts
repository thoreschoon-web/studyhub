import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";

/**
 * Einmal-Tokens für Passwort-Reset & E-Mail-Verifizierung über das (bisher
 * ungenutzte) Auth.js-Model VerificationToken. In der DB liegt nur der
 * sha256-Hash; der Klartext-Token steht ausschließlich im Mail-Link.
 * `identifier` trägt einen Zweck-Präfix, damit ein Reset-Token nicht als
 * Verifizierungs-Token durchgeht (und umgekehrt).
 */
export type TokenPurpose = "reset" | "verify";

const TTL_MS: Record<TokenPurpose, number> = {
  reset: 60 * 60 * 1000, // 1 h
  verify: 24 * 60 * 60 * 1000, // 24 h
};

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createToken(purpose: TokenPurpose, email: string): Promise<string> {
  const raw = crypto.randomBytes(32).toString("hex");
  const identifier = `${purpose}:${email}`;
  // Pro Zweck+Adresse ist immer nur der neueste Token gültig.
  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: { identifier, token: sha256(raw), expires: new Date(Date.now() + TTL_MS[purpose]) },
  });
  return raw;
}

/** Prüft & verbraucht den Token (Einmal-Nutzung). */
export async function consumeToken(purpose: TokenPurpose, email: string, raw: string): Promise<boolean> {
  if (!raw || raw.length > 200) return false;
  const identifier = `${purpose}:${email}`;
  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier, token: sha256(raw) } },
  });
  if (!record) return false;
  await db.verificationToken.delete({ where: { identifier_token: { identifier, token: record.token } } });
  return record.expires > new Date();
}
