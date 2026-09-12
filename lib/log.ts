// Minimal structured logger. One JSON object per line so logs are greppable in
// dev and machine-parseable in production. Never pass secrets in `meta` — the
// logger does not redact.

type Level = "debug" | "info" | "warn" | "error";

const RANK: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const MIN_LEVEL: Level =
  (process.env.LOG_LEVEL as Level | undefined) ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  /** Returns a logger that merges `bindings` into every record (e.g. a request id). */
  child(bindings: Record<string, unknown>): Logger;
}

function make(bindings: Record<string, unknown>): Logger {
  function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
    if (RANK[level] < RANK[MIN_LEVEL]) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...bindings,
      ...meta,
    });
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }
  return {
    debug: (msg, meta) => emit("debug", msg, meta),
    info: (msg, meta) => emit("info", msg, meta),
    warn: (msg, meta) => emit("warn", msg, meta),
    error: (msg, meta) => emit("error", msg, meta),
    child: (extra) => make({ ...bindings, ...extra }),
  };
}

export const log: Logger = make({});

// Normalises an unknown thrown value into a compact, log-safe shape.
export function errMeta(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { error: error.message, errorName: error.name };
  }
  if (error && typeof error === "object") {
    // Supabase/PostgREST errors are plain objects: { message, code, details }.
    const o = error as Record<string, unknown>;
    if (typeof o.message === "string") {
      return { error: o.message, ...(o.code ? { errorCode: o.code } : {}) };
    }
    try {
      return { error: JSON.stringify(error) };
    } catch {
      return { error: "[unserialisable error]" };
    }
  }
  return { error: String(error) };
}
