import * as Sentry from "@sentry/nextjs";

/**
 * Server-/Edge-seitiges Error-Tracking. Env-gated wie Stripe/Resend:
 * ohne SENTRY_DSN passiert nichts (Dev ohne Account bleibt sauber).
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1, // sparsames Performance-Sampling (Free-Tier-Budget)
    enableLogs: false,
  });
}

export const onRequestError = Sentry.captureRequestError;
