import { getBookBySlug, saveGeneratedBook, slugify } from "@/lib/store";
import {
  getProvider,
  buildGenerationPrompt,
  extractJson,
  normalizeGeneratedBook,
  mockGeneratedBook,
} from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  let body: { title?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (!title) {
    return Response.json({ error: "A title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  if (!slug) {
    return Response.json({ error: "Could not derive a slug" }, { status: 400 });
  }

  // Cache-first: generate once, serve forever.
  const existing = await getBookBySlug(slug);
  if (existing) {
    return Response.json({ book: existing, slug, source: "cache" });
  }

  const provider = await getProvider();

  // No live model -> persist a clearly-labelled preview so the flow still works.
  if (!provider) {
    const book = { ...mockGeneratedBook(title), slug };
    await saveGeneratedBook(book);
    return Response.json({ book, slug, source: "mock" });
  }

  try {
    const raw = await provider.complete(buildGenerationPrompt(title), {
      json: true,
      temperature: 0.6,
    });
    const book = normalizeGeneratedBook(extractJson(raw), slug);
    await saveGeneratedBook(book);
    return Response.json({ book, slug, source: provider.name });
  } catch (err) {
    // Model reachable but returned unusable output -> fall back to preview.
    const book = { ...mockGeneratedBook(title), slug };
    await saveGeneratedBook(book);
    return Response.json({
      book,
      slug,
      source: "mock",
      note: "Model output could not be parsed; saved a preview instead.",
    });
  }
}
