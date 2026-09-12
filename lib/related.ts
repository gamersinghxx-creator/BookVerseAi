import type { Book } from "./types";

// Content-based recommendations: from `pool`, the books that share the most tags
// (and category) with `current`. The pool is passed in so callers can include
// AI-generated books, not just the seed library.
export function relatedBooks(
  current: { slug: string; category: string; tags: string[] },
  pool: Book[],
  limit = 3,
): Book[] {
  return pool
    .filter((b) => b.slug !== current.slug)
    .map((b) => {
      const shared = b.tags.filter((t) => current.tags.includes(t)).length;
      const sameCategory = b.category === current.category ? 1 : 0;
      return { book: b, score: shared * 2 + sameCategory };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.book);
}
