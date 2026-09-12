import type { Book } from "./types";

// Ranked library search. Not semantic — a transparent scoring pass that beats a
// bare `includes()`: exact title > title prefix > word-boundary hit > author >
// tag > substring anywhere. Ties break on rating then title.

function norm(s: string): string {
  return s.toLowerCase().replace(/['"]/g, "").trim();
}

function scoreField(field: string, q: string, weights: { exact: number; prefix: number; word: number; sub: number }): number {
  const f = norm(field);
  if (!f) return 0;
  if (f === q) return weights.exact;
  if (f.startsWith(q)) return weights.prefix;
  if (new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(f)) return weights.word;
  if (f.includes(q)) return weights.sub;
  return 0;
}

export function scoreBook(book: Book, query: string): number {
  const q = norm(query);
  if (!q) return 0;

  let score = 0;
  score += scoreField(book.title, q, { exact: 100, prefix: 60, word: 40, sub: 20 });
  score += scoreField(book.author, q, { exact: 45, prefix: 30, word: 20, sub: 10 });
  for (const tag of book.tags) {
    score += scoreField(tag, q, { exact: 25, prefix: 15, word: 12, sub: 6 });
  }
  score += scoreField(book.category, q, { exact: 8, prefix: 4, word: 3, sub: 2 });
  // A weak last-resort match against the tagline so "strategy" still finds things.
  score += scoreField(book.tagline, q, { exact: 0, prefix: 0, word: 6, sub: 3 });

  return score;
}

export function searchBooks(books: Book[], query: string, limit?: number): Book[] {
  const q = norm(query);
  if (!q) return typeof limit === "number" ? books.slice(0, limit) : books;

  const ranked = books
    .map((book) => ({ book, score: scoreBook(book, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.book.rating - a.book.rating || a.book.title.localeCompare(b.book.title))
    .map((r) => r.book);

  return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
}
