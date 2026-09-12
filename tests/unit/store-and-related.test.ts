import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/store";
import { relatedBooks } from "@/lib/related";
import type { Book } from "@/lib/types";

describe("slugify", () => {
  it("lowercases, strips punctuation, collapses separators", () => {
    expect(slugify("The Art of War")).toBe("the-art-of-war");
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify('“Smart Quotes” and — dashes')).toBe("smart-quotes-and-dashes");
  });

  it("caps length", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

function b(slug: string, category: Book["category"], tags: string[]): Book {
  return {
    slug, title: slug, author: "A", year: "2020", category, tags,
    cover: { emoji: "📘" }, tagline: "", readingTime: "", rating: 4,
    cached: true, overview: "", summary: [], chapters: [], lessons: [],
    timeline: [], characters: [], mindMap: [], sketches: [], qa: [],
  };
}

describe("relatedBooks", () => {
  const pool = [
    b("current", "non-fiction", ["strategy", "leadership"]),
    b("close", "non-fiction", ["strategy", "leadership", "war"]),
    b("some", "non-fiction", ["leadership"]),
    b("far", "fiction", ["romance"]),
  ];

  it("ranks by shared tags then category, excluding the current book", () => {
    const picks = relatedBooks(
      { slug: "current", category: "non-fiction", tags: ["strategy", "leadership"] },
      pool,
      3,
    );
    expect(picks.map((p) => p.slug)).toEqual(["close", "some", "far"]);
    expect(picks.find((p) => p.slug === "current")).toBeUndefined();
  });

  it("respects the limit", () => {
    expect(
      relatedBooks({ slug: "current", category: "non-fiction", tags: [] }, pool, 1),
    ).toHaveLength(1);
  });
});
