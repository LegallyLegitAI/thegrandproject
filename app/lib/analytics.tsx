// lib/analytics.ts
import * as Sentry from '@sentry/nextjs';

export function initAnalytics() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

// In root layout:
initAnalytics();