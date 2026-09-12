// Bounded-time execution + a lightweight circuit breaker for OPTIONAL external
// services (hosted Postgres, remote LLMs, image APIs). The rule in this project:
// a slow or dead dependency must never block a request — it degrades to the
// local fallback instantly. Principle #5, "graceful degradation".

import { log, errMeta } from "./log";

export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

// Races a promise against a deadline. The caller is guaranteed to unblock within
// `ms`; a straggling underlying request resolves harmlessly into the void.
export async function withTimeout<T>(
  label: string,
  ms: number,
  fn: () => Promise<T>,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([fn(), deadline]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ---- circuit breaker ------------------------------------------------------
// After `threshold` consecutive failures for a key, the circuit "opens" for
// `cooldownMs`: further calls short-circuit to the fallback without even trying,
// so one dead service costs one timeout per cooldown window, not one per request.
// Any success closes the circuit.

interface BreakerState {
  failures: number;
  openUntil: number;
}

// Next bundles each route separately, so a plain module-level Map would give
// every route its own breaker. Pin it to the process global so one dead service
// is learned once, process-wide.
const globalForBreakers = globalThis as typeof globalThis & {
  __bookverseBreakers?: Map<string, BreakerState>;
};
const breakers: Map<string, BreakerState> = (globalForBreakers.__bookverseBreakers ??=
  new Map());

const DEFAULT_THRESHOLD = 2;
const DEFAULT_COOLDOWN_MS = 30_000;

export function circuitOpen(key: string): boolean {
  const s = breakers.get(key);
  return !!s && s.openUntil > Date.now();
}

export function recordSuccess(key: string): void {
  if (breakers.delete(key)) {
    log.info("circuit closed", { circuit: key });
  }
}

export function recordFailure(
  key: string,
  threshold = DEFAULT_THRESHOLD,
  cooldownMs = DEFAULT_COOLDOWN_MS,
): void {
  const s = breakers.get(key) ?? { failures: 0, openUntil: 0 };
  s.failures += 1;
  if (s.failures >= threshold && s.openUntil <= Date.now()) {
    s.openUntil = Date.now() + cooldownMs;
    log.warn("circuit opened", { circuit: key, failures: s.failures, cooldownMs });
  }
  breakers.set(key, s);
}

export interface Attempt<T> {
  ok: boolean;
  value?: T;
  error?: unknown;
}

// Run `fn` under a timeout + circuit breaker. Never throws: returns
// `{ ok: true, value }` on success or `{ ok: false, error }` on any failure
// (including an open circuit), so callers can fall through to a local path.
export async function attempt<T>(
  key: string,
  ms: number,
  fn: () => Promise<T>,
  opts?: { threshold?: number; cooldownMs?: number },
): Promise<Attempt<T>> {
  if (circuitOpen(key)) {
    return { ok: false, error: new Error(`${key} circuit is open`) };
  }
  try {
    const value = await withTimeout(key, ms, fn);
    recordSuccess(key);
    return { ok: true, value };
  } catch (error) {
    recordFailure(key, opts?.threshold, opts?.cooldownMs);
    log.warn("guarded call failed, using fallback", { circuit: key, ...errMeta(error) });
    return { ok: false, error };
  }
}

// For tests / admin: wipe breaker state.
export function resetCircuits(): void {
  breakers.clear();
}
