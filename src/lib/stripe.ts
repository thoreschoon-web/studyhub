import "server-only";
import Stripe from "stripe";

/** Null when STRIPE_SECRET_KEY is absent → all Stripe features degrade gracefully. */
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
export const stripeEnabled = !!stripe && !!process.env.STRIPE_PRICE_ID;
