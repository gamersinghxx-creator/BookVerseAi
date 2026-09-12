import { log, errMeta } from "./log";

// Pluggable error + event reporting. No-ops unless a sink is registered, so the
// app carries zero required observability dependency. To wire Sentry / PostHog /
// Plausible, call setErrorSink / setEventSink once at startup (e.g. in
// instrumentation.ts) — nothing else in the codebase changes.

type Props = Record<string, unknown>;

let errorSink: ((error: unknown, context?: Props) => void) | null = null;
let eventSink: ((name: string, props?: Props) => void) | null = null;

export function setErrorSink(fn: typeof errorSink) {
  errorSink = fn;
}
export function setEventSink(fn: typeof eventSink) {
  eventSink = fn;
}

// Record an error: always logs, plus forwards to the sink if one is registered.
export function reportError(error: unknown, context?: Props) {
  log.error("error.reported", { ...errMeta(error), ...context });
  try {
    errorSink?.(error, context);
  } catch (e) {
    log.warn("error.sink_failed", errMeta(e));
  }
}

// Record a product event (server-side). Client events go through
// lib/analytics.ts. Both are no-ops without configuration.
export function track(name: string, props?: Props) {
  log.debug("event", { event: name, ...props });
  try {
    eventSink?.(name, props);
  } catch {
    /* never let analytics break a request */
  }
}
