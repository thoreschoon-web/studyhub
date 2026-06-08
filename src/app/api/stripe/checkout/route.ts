import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!stripe) return Response.json({ error: "stripe_disabled" }, { status: 503 });
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return Response.json({ error: "no_price" }, { status: 503 });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined, metadata: { userId: user.id } });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/upgrade?status=success`,
    cancel_url: `${origin}/upgrade?status=cancel`,
    metadata: { userId: user.id },
  });

  return Response.json({ url: session.url });
}
