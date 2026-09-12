import { describe, it, expect } from "vitest";
import { normalizeGeneratedBook, GenerateInput, ChatInput } from "@/lib/schemas";

describe("normalizeGeneratedBook", () => {
  it("produces a valid Book from empty input", () => {
    const b = normalizeGeneratedBook({}, "some-slug");
    expect(b.slug).toBe("some-slug");
    expect(b.title).toBe("some-slug");
    expect(b.category).toBe("non-fiction");
    expect(b.tags.length).toBeGreaterThan(0);
    expect(Array.isArray(b.summary)).toBe(true);
    expect(b.mindMap.some((n) => n.parent === null)).toBe(true);
  });

  it("keeps a single mind-map root and re-points dangling parents", () => {
    const raw = {
      title: "T",
      mindMap: [
        { id: "a", label: "A", parent: null },
        { id: "b", label: "B", parent: null }, // second root
        { id: "c", label: "C", parent: "ghost" }, // dangling
      ],
    };
    const b = normalizeGeneratedBook(raw, "t");
    const roots = b.mindMap.filter((n) => n.parent === null);
    expect(roots).toHaveLength(1);
    for (const n of b.mindMap) {
      if (n.parent !== null) {
        expect(b.mindMap.some((m) => m.id === n.parent)).toBe(true);
      }
    }
  });

  it("drops characters for non-fiction and keeps them for fiction", () => {
    const chars = [{ name: "X", role: "r", description: "d", connections: [] }];
    expect(normalizeGeneratedBook({ category: "non-fiction", characters: chars }, "s").characters).toEqual([]);
    expect(
      normalizeGeneratedBook({ category: "fiction", characters: chars }, "s").characters,
    ).toHaveLength(1);
  });

  it("clamps over-long strings and arrays", () => {
    const b = normalizeGeneratedBook(
      {
        overview: "x".repeat(10_000),
        summary: Array.from({ length: 20 }, (_, i) => `p${i}`),
        tags: ["a", "b", "c", "d", "e", "f"],
      },
      "s",
    );
    expect(b.overview.length).toBeLessThanOrEqual(4_000);
    expect(b.summary.length).toBeLessThanOrEqual(6);
    expect(b.tags.length).toBeLessThanOrEqual(4);
  });

  it("numbers chapters when the model omits numbers", () => {
    const b = normalizeGeneratedBook(
      { chapters: [{ title: "One" }, { title: "Two" }, { title: "Three" }] },
      "s",
    );
    expect(b.chapters.map((c) => c.number)).toEqual([1, 2, 3]);
  });

  it("survives malformed field types", () => {
    const b = normalizeGeneratedBook(
      { title: 123, tags: "not-an-array", chapters: "nope", mindMap: 5, category: 7 },
      "s",
    );
    expect(typeof b.title).toBe("string");
    expect(Array.isArray(b.chapters)).toBe(true);
    expect(b.mindMap.length).toBeGreaterThan(0);
  });
});

describe("API input schemas", () => {
  it("GenerateInput trims and rejects empty / oversized titles", () => {
    expect(GenerateInput.parse({ title: "  Dune  " }).title).toBe("Dune");
    expect(GenerateInput.safeParse({ title: "" }).success).toBe(false);
    expect(GenerateInput.safeParse({ title: "x".repeat(500) }).success).toBe(false);
    expect(GenerateInput.safeParse({}).success).toBe(false);
  });

  it("ChatInput requires a slug and at least one message", () => {
    expect(
      ChatInput.safeParse({ slug: "dune", messages: [{ role: "user", content: "hi" }] }).success,
    ).toBe(true);
    expect(ChatInput.safeParse({ slug: "dune", messages: [] }).success).toBe(false);
    expect(
      ChatInput.safeParse({ slug: "dune", messages: [{ role: "bad", content: "hi" }] }).success,
    ).toBe(false);
  });
});
