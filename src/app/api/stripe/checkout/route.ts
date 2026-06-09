import { stripe } from "@/lib/stripe";
import { getCurrentUser, isUnlimited } from "@/lib/session";
import { mailEnabled } from "@/lib/mail";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Startet den Stripe-Checkout für den Semester-Pass (Einmalzahlung, kein Abo).
 * Voraussetzungen: eingeloggt, E-Mail verifiziert (sofern Mailversand konfiguriert),
 * noch kein aktiver Pass.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!stripe) return Response.json({ error: "stripe_disabled" }, { status: 503 });
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return Response.json({ error: "no_price" }, { status: 503 });

  // Doppelkauf verhindern — ein aktiver Pass reicht.
  if (isUnlimited(user)) return Response.json({ error: "already_paid" }, { status: 409 });

  // Hartes Verifizierungs-Gate vor der Zahlung (nur wenn Verifizierung möglich ist).
  if (mailEnabled && !user.emailVerified) {
    return Response.json({ error: "email_unverified" }, { status: 403 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? undefined, metadata: { userId: user.id } });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/upgrade?status=success`,
    cancel_url: `${origin}/upgrade?status=cancel`,
    metadata: { userId: user.id },
    invoice_creation: { enabled: true },
    // AGB-Zustimmung (Terms-URL wird im Stripe-Dashboard hinterlegt) +
    // §356(5) BGB: sofortige Bereitstellung → Erlöschen des Widerrufsrechts.
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message:
          "Ich stimme den [AGB](" +
          origin +
          "/agb) zu und verlange die sofortige Bereitstellung der digitalen Inhalte. " +
          "Mir ist bekannt, dass mein Widerrufsrecht mit Beginn der Bereitstellung erlischt (§ 356 Abs. 5 BGB). " +
          "[Widerrufsbelehrung](" +
          origin +
          "/widerruf)",
      },
    },
  });

  return Response.json({ url: session.url });
}
