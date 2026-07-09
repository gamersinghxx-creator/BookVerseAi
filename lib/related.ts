import type { Book } from "./types";
import { books } from "./books";

// Simple content-based recommendations over the seed library: books that
// share tags (and category) with the current one, most-overlapping first.
export function relatedBooks(
  current: { slug: string; category: string; tags: string[] },
  limit = 3
): Book[] {
  return books
    .filter((b) => b.slug !== current.slug)
    .map((b) => {
      const shared = b.tags.filter((t) => current.tags.includes(t)).length;
      const sameCat = b.category === current.category ? 1 : 0;
      return { b, score: shared * 2 + sameCat };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.b);
}
