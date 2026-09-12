import { describe, it, expect } from "vitest";
import { mockTutorAnswer, mockGeneratedBook } from "@/lib/ai/mock";
import { extractJson } from "@/lib/ai";
import type { Book } from "@/lib/types";

const book = {
  title: "Test Book",
  qa: [
    { q: "What is the main theme?", a: "The main theme is resilience." },
    { q: "Who is the protagonist?", a: "A young engineer." },
  ],
} as Book;

describe("mockTutorAnswer", () => {
  it("matches a question to the closest pre-baked answer", () => {
    expect(mockTutorAnswer(book, "Tell me about the main theme")).toBe(
      "The main theme is resilience.",
    );
  });

  it("falls back gracefully when nothing matches", () => {
    expect(mockTutorAnswer(book, "xyzzy")).toContain("Test Book");
  });
});

describe("mockGeneratedBook", () => {
  it("returns a fully-populated, clearly-generic guide", () => {
    const b = mockGeneratedBook("The Pragmatic Programmer");
    expect(b.title).toBe("The Pragmatic Programmer");
    expect(b.chapters.length).toBeGreaterThan(0);
    expect(b.mindMap.some((n) => n.parent === null)).toBe(true);
    expect(b.cached).toBe(false);
  });
});

describe("extractJson", () => {
  it("parses a bare object", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it("parses fenced json", () => {
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it("parses json embedded in prose", () => {
    expect(extractJson('Here you go: {"a":3} — enjoy')).toEqual({ a: 3 });
  });
  it("throws when there is no object", () => {
    expect(() => extractJson("no json here")).toThrow();
  });
});
