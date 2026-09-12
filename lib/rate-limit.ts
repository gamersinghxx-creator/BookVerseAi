import { log } from "./log";

// Fixed-window rate limiter. In-memory and process-local — good enough to stop
// runaway spend on a single instance; swap `hit()` for an Upstash/Redis call if
// you need it shared across serverless instances (the shape stays the same).
//
// Every limited endpoint should apply BOTH a short burst window and a long
// daily cap.

interface Window {
  count: number;
  resetAt: number;
}

const globalForRL = globalThis as typeof globalThis & {
  __bookverseRateLimit?: Map<string, Window>;
};
const store: Map<string, Window> = (globalForRL.__bookverseRateLimit ??= new Map());

let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, w] of store) if (w.resetAt <= now) store.delete(k);
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
  retryAfterSec: number;
}

export const rateLimitDisabled =
  process.env.RATE_LIMIT_DISABLED === "1" || process.env.RATE_LIMIT_DISABLED === "true";

function hit(bucket: string, limit: number, windowMs: number, now: number): RateLimitResult {
  const w = store.get(bucket);
  if (!w || w.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(bucket, { count: 1, resetAt });
    return { ok: true, limit, remaining: limit - 1, resetAt, retryAfterSec: 0 };
  }
  w.count += 1;
  const ok = w.count <= limit;
  return {
    ok,
    limit,
    remaining: Math.max(0, limit - w.count),
    resetAt: w.resetAt,
    retryAfterSec: ok ? 0 : Math.ceil((w.resetAt - now) / 1000),
  };
}

export interface LimitRule {
  /** window length */
  windowMs: number;
  /** max requests per window */
  max: number;
  /** label for logs / the bucket key */
  name: string;
}

// Applies every rule for `identity`. Returns the first failing result, or the
// tightest-remaining passing result. Never throws.
export function checkRateLimit(identity: string, rules: LimitRule[]): RateLimitResult {
  if (rateLimitDisabled) {
    return { ok: true, limit: Infinity, remaining: Infinity, resetAt: 0, retryAfterSec: 0 };
  }
  const now = Date.now();
  sweep(now);

  let tightest: RateLimitResult | null = null;
  for (const rule of rules) {
    const r = hit(`${rule.name}:${identity}`, rule.max, rule.windowMs, now);
    if (!r.ok) {
      log.warn("rate_limit.exceeded", { rule: rule.name, identity, retryAfterSec: r.retryAfterSec });
      return r;
    }
    if (!tightest || r.remaining < tightest.remaining) tightest = r;
  }
  return tightest ?? { ok: true, limit: Infinity, remaining: Infinity, resetAt: 0, retryAfterSec: 0 };
}

// Best-effort client identity from proxy headers (Vercel sets x-forwarded-for).
export function clientId(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}

// Rules from env (with sane defaults). Numbers, not code, so ops can tune them.
const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const LIMITS = {
  generate: [
    { name: "gen-min", windowMs: 60_000, max: num(process.env.RATE_LIMIT_GENERATE_PER_MIN, 5) },
    { name: "gen-day", windowMs: 86_400_000, max: num(process.env.RATE_LIMIT_GENERATE_PER_DAY, 60) },
  ] as LimitRule[],
  chat: [
    { name: "chat-min", windowMs: 60_000, max: num(process.env.RATE_LIMIT_CHAT_PER_MIN, 20) },
    { name: "chat-day", windowMs: 86_400_000, max: num(process.env.RATE_LIMIT_CHAT_PER_DAY, 400) },
  ] as LimitRule[],
};
