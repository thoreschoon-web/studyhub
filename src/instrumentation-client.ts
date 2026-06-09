import * as Sentry from "@sentry/nextjs";

// Client-seitiges Error-Tracking — nur aktiv, wenn NEXT_PUBLIC_SENTRY_DSN gesetzt ist.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0, // Client-Tracing aus — uns interessieren nur Fehler
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
