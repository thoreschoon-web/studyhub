"use server";

import { db } from "@/lib/db";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

/**
 * Löscht das Konto unwiderruflich (DSGVO Art. 17). Die Prisma-Cascades räumen
 * Accounts/Sessions/TopicProgress/SrsCards/ExamAttempts/Usage mit ab; der
 * Stripe-Customer wird best-effort entfernt (Zahlungsbelege behält Stripe
 * gesetzlich vorgeschrieben selbst).
 */
export async function deleteAccountAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  if (stripe && user.stripeCustomerId) {
    try {
      await stripe.customers.del(user.stripeCustomerId);
    } catch (e) {
      console.error("[account] stripe customer delete failed:", e);
    }
  }

  await db.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/login" });
}
