import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  withTimeout,
  attempt,
  circuitOpen,
  recordFailure,
  recordSuccess,
  resetCircuits,
  TimeoutError,
} from "@/lib/resilience";

beforeEach(() => resetCircuits());

describe("withTimeout", () => {
  it("resolves when fn finishes in time", async () => {
    await expect(withTimeout("x", 50, () => Promise.resolve(7))).resolves.toBe(7);
  });

  it("rejects with TimeoutError when fn is too slow", async () => {
    const slow = () => new Promise((r) => setTimeout(r, 100));
    await expect(withTimeout("slow", 20, slow)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("propagates the underlying rejection", async () => {
    await expect(
      withTimeout("err", 50, () => Promise.reject(new Error("boom"))),
    ).rejects.toThrow("boom");
  });
});

describe("attempt", () => {
  it("returns ok on success and closes the circuit", async () => {
    const r = await attempt("svc", 50, () => Promise.resolve("v"));
    expect(r).toEqual({ ok: true, value: "v" });
    expect(circuitOpen("svc")).toBe(false);
  });

  it("returns not-ok on failure without throwing", async () => {
    const r = await attempt("svc", 50, () => Promise.reject(new Error("no")));
    expect(r.ok).toBe(false);
  });

  it("opens the circuit after the failure threshold and short-circuits", async () => {
    const fn = vi.fn(() => Promise.reject(new Error("down")));
    await attempt("db", 50, fn); // failure 1
    expect(circuitOpen("db")).toBe(false);
    await attempt("db", 50, fn); // failure 2 -> opens
    expect(circuitOpen("db")).toBe(true);

    const callsBefore = fn.mock.calls.length;
    const r = await attempt("db", 50, fn); // short-circuits, fn not called
    expect(r.ok).toBe(false);
    expect(fn.mock.calls.length).toBe(callsBefore);
  });

  it("closes an open circuit on the next success", async () => {
    recordFailure("q");
    recordFailure("q");
    expect(circuitOpen("q")).toBe(true);
    recordSuccess("q");
    expect(circuitOpen("q")).toBe(false);
  });
});
