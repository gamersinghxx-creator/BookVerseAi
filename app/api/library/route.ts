import { searchAllBooks } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const books = await searchAllBooks(q);
  return Response.json({
    books: books.map((b) => ({
      slug: b.slug,
      title: b.title,
      author: b.author,
      category: b.category,
      tagline: b.tagline,
      emoji: b.cover.emoji,
    })),
  });
}
