import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, type LimitRule } from "@/lib/rate-limit";

// Fresh module state per test.
beforeEach(() => {
  vi.resetModules();
  (globalThis as { __bookverseRateLimit?: Map<string, unknown> }).__bookverseRateLimit?.clear();
});

const rule = (max: number, windowMs = 60_000): LimitRule[] => [{ name: "t", windowMs, max }];

describe("checkRateLimit", () => {
  it("allows up to `max` then blocks with a retry-after", () => {
    const rules = rule(3);
    expect(checkRateLimit("ip-a", rules).ok).toBe(true); // 1
    expect(checkRateLimit("ip-a", rules).ok).toBe(true); // 2
    const third = checkRateLimit("ip-a", rules);
    expect(third.ok).toBe(true); // 3
    expect(third.remaining).toBe(0);

    const blocked = checkRateLimit("ip-a", rules); // 4
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
    expect(blocked.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("tracks identities independently", () => {
    const rules = rule(1);
    expect(checkRateLimit("ip-b", rules).ok).toBe(true);
    expect(checkRateLimit("ip-b", rules).ok).toBe(false);
    expect(checkRateLimit("ip-c", rules).ok).toBe(true);
  });

  it("fails the first rule that trips (burst before daily)", () => {
    const rules: LimitRule[] = [
      { name: "min", windowMs: 60_000, max: 2 },
      { name: "day", windowMs: 86_400_000, max: 100 },
    ];
    checkRateLimit("ip-d", rules);
    checkRateLimit("ip-d", rules);
    const r = checkRateLimit("ip-d", rules);
    expect(r.ok).toBe(false);
  });

  it("resets after the window passes", () => {
    vi.useFakeTimers();
    const rules = rule(1, 1_000);
    expect(checkRateLimit("ip-e", rules).ok).toBe(true);
    expect(checkRateLimit("ip-e", rules).ok).toBe(false);
    vi.advanceTimersByTime(1_100);
    expect(checkRateLimit("ip-e", rules).ok).toBe(true);
    vi.useRealTimers();
  });
});
