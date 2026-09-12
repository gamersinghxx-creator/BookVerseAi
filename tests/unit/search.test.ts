import { describe, it, expect } from "vitest";
import { searchBooks, scoreBook } from "@/lib/search";
import type { Book } from "@/lib/types";

function make(slug: string, title: string, author: string, tags: string[], rating = 4): Book {
  return {
    slug, title, author, year: "2020", category: "non-fiction", tags,
    cover: { emoji: "📘" }, tagline: `About ${title}`, readingTime: "", rating,
    cached: true, overview: "", summary: [], chapters: [], lessons: [],
    timeline: [], characters: [], mindMap: [], sketches: [], qa: [],
  };
}

const pool = [
  make("the-art-of-war", "The Art of War", "Sun Tzu", ["Strategy", "Leadership"], 4.7),
  make("art-of-thinking", "The Art of Thinking Clearly", "Rolf Dobelli", ["Psychology"], 4.2),
  make("meditations", "Meditations", "Marcus Aurelius", ["Stoicism", "Philosophy"], 4.8),
  make("war-and-peace", "War and Peace", "Leo Tolstoy", ["Classic"], 4.3),
];

describe("searchBooks", () => {
  it("ranks an exact title match first", () => {
    const r = searchBooks(pool, "meditations");
    expect(r[0].slug).toBe("meditations");
  });

  it("ranks a title-prefix match above a mid-word substring", () => {
    const r = searchBooks(pool, "art of");
    expect(r[0].slug).toBe("the-art-of-war"); // "The Art of War" — earlier prefix
    expect(r.map((b) => b.slug)).toContain("art-of-thinking");
  });

  it("matches author and tags", () => {
    expect(searchBooks(pool, "tolstoy")[0].slug).toBe("war-and-peace");
    expect(searchBooks(pool, "stoicism")[0].slug).toBe("meditations");
  });

  it("returns nothing for a query that matches nothing", () => {
    expect(searchBooks(pool, "zzzzz")).toHaveLength(0);
  });

  it("returns all books (seed order) for an empty query, respecting the limit", () => {
    expect(searchBooks(pool, "")).toHaveLength(4);
    expect(searchBooks(pool, "", 2)).toHaveLength(2);
  });

  it("breaks score ties by rating", () => {
    // Both titles start with "War" — "War and Peace" (4.3) vs a lower-rated one.
    const extra = [...pool, make("war-diaries", "War Diaries", "Anon", [], 3.0)];
    const r = searchBooks(extra, "war");
    const warTitles = r.filter((b) => b.title.startsWith("War"));
    expect(warTitles[0].slug).toBe("war-and-peace");
  });

  it("scoreBook is 0 for an empty query", () => {
    expect(scoreBook(pool[0], "")).toBe(0);
  });
});
