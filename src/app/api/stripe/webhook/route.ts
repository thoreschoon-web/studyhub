import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { currentSemesterEnd } from "@/lib/billing";

export const runtime = "nodejs";

/**
 * Semester-Pass-Webhook (Einmalzahlung):
 * - checkout.session.completed (bezahlt) → paidUntil = Semesterende
 * - charge.refunded / charge.dispute.created → paidUntil entziehen
 * Idempotent: dieselbe Nachricht mehrfach zu verarbeiten ist harmlos.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ ok: false, reason: "stripe_disabled" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text(); // raw body required for signature verification
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch (e) {
    return Response.json({ error: "bad_signature", detail: String((e as Error).message) }, { status: 400 });
  }

  async function revokeByCustomer(customerId: string) {
    await db.user.updateMany({ where: { stripeCustomerId: customerId }, data: { paidUntil: null } });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status !== "paid") break; // z. B. asynchrone Zahlarten — erst bei Zahlungseingang freischalten
      const userId = s.metadata?.userId;
      if (userId) {
        await db.user.update({
          where: { id: userId },
          data: {
            paidUntil: currentSemesterEnd(),
            stripeCustomerId: typeof s.customer === "string" ? s.customer : undefined,
          },
        });
      }
      break;
    }
    // Asynchrone Zahlarten (z. B. Lastschrift): completed feuert erst unbezahlt,
    // dieser Event liefert die Bestätigung nach.
    case "checkout.session.async_payment_succeeded": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId;
      if (userId) await db.user.update({ where: { id: userId }, data: { paidUntil: currentSemesterEnd() } });
      break;
    }
    case "charge.refunded": {
      const c = event.data.object as Stripe.Charge;
      if (typeof c.customer === "string") await revokeByCustomer(c.customer);
      break;
    }
    case "charge.dispute.created": {
      const d = event.data.object as Stripe.Dispute;
      const charge = typeof d.charge === "string" ? await stripe.charges.retrieve(d.charge) : d.charge;
      if (charge && typeof charge.customer === "string") await revokeByCustomer(charge.customer);
      break;
    }
  }

  return Response.json({ received: true });
}
