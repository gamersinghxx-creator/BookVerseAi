// Next.js startup hook (runs once per server process, in both the Node.js and
// Edge runtimes). This is where you wire an error tracker (Sentry) and a
// server-side analytics sink. Both are optional — with nothing configured the
// app logs to stdout and nothing else.
//
// Example (Sentry, Node runtime only):
//   if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
//     const Sentry = await import("@sentry/nextjs");
//     Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
//     const { setErrorSink } = await import("./lib/observability");
//     setErrorSink((err, ctx) => Sentry.captureException(err, { extra: ctx }));
//   }

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { setErrorSink, setEventSink, track } = await import("./lib/observability");

  // Placeholder so the wiring is visible and testable. Replace with a real sink.
  void setErrorSink;
  void setEventSink;

  if (process.env.NODE_ENV !== "test") {
    track("server.start");
  }
}
