import { searchAllBooks } from "@/lib/store";
import { route } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Search across the whole library (seed + generated). Empty `q` returns all.
export const GET = route("library", async (req, ctx) => {
  const params = new URL(req.url).searchParams;
  const q = params.get("q")?.slice(0, 120) ?? "";
  const limit = Math.min(Math.max(Number(params.get("limit")) || 24, 1), 100);
  const books = await searchAllBooks(q, limit);
  return ctx.json({
    books: books.map((b) => ({
      slug: b.slug,
      title: b.title,
      author: b.author,
      category: b.category,
      tagline: b.tagline,
      emoji: b.cover.emoji,
    })),
  });
});
