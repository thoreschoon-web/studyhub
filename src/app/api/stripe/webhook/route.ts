import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const runtime = "nodejs";

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

  async function setPlanByCustomer(customerId: string, plan: string, subId?: string, status?: string) {
    await db.user.updateMany({ where: { stripeCustomerId: customerId }, data: { plan, stripeSubId: subId, subStatus: status } });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.userId;
      if (userId) {
        await db.user.update({
          where: { id: userId },
          data: {
            plan: "paid",
            subStatus: "active",
            stripeSubId: typeof s.subscription === "string" ? s.subscription : undefined,
            stripeCustomerId: typeof s.customer === "string" ? s.customer : undefined,
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const active = sub.status === "active" || sub.status === "trialing";
      await setPlanByCustomer(String(sub.customer), active ? "paid" : "free", sub.id, sub.status);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setPlanByCustomer(String(sub.customer), "free", sub.id, "canceled");
      break;
    }
  }

  return Response.json({ received: true });
}
