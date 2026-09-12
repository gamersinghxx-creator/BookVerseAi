import { getBookBySlug, isSeedSlug, saveGeneratedBook, slugify } from "@/lib/store";
import {
  getProvider,
  buildGenerationPrompt,
  extractJson,
  normalizeGeneratedBook,
  mockGeneratedBook,
} from "@/lib/ai";
import { route, parseJson, badRequest } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { GenerateInput } from "@/lib/schemas";
import { errMeta } from "@/lib/log";
import { track } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export const POST = route("generate", { limit: LIMITS.generate }, async (req, ctx) => {
  const { title, force } = await parseJson(req, GenerateInput);

  const slug = slugify(title);
  if (!slug) throw badRequest("Could not derive a usable slug from that title");

  // `force` re-generates a previously generated book (for recovering a poor
  // result). Seed books are curated and never regenerated.
  const bustCache = force === true && !isSeedSlug(slug);

  const existing = await getBookBySlug(slug);
  if (existing && !bustCache) {
    ctx.log.info("generate.cache_hit", { slug });
    track("book.generate", { slug, source: "cache" });
    return ctx.json({ book: existing, slug, source: "cache" });
  }

  const provider = await getProvider();

  if (!provider) {
    ctx.log.info("generate.no_provider", { slug });
    const book = { ...mockGeneratedBook(title), slug };
    await saveGeneratedBook(book);
    track("book.generate", { slug, source: "mock" });
    return ctx.json({ book, slug, source: "mock" });
  }

  try {
    const started = Date.now();
    const raw = await provider.complete(buildGenerationPrompt(title), {
      json: true,
      temperature: 0.6,
    });
    const book = normalizeGeneratedBook(extractJson(raw), slug);
    await saveGeneratedBook(book);
    ctx.log.info("generate.ok", { slug, provider: provider.name, ms: Date.now() - started });
    track("book.generate", { slug, source: provider.name, regenerated: bustCache });
    return ctx.json({ book, slug, source: provider.name });
  } catch (err) {
    ctx.log.warn("generate.provider_failed", { slug, provider: provider.name, ...errMeta(err) });
    const book = { ...mockGeneratedBook(title), slug };
    await saveGeneratedBook(book);
    track("book.generate", { slug, source: "mock", providerFailed: true });
    return ctx.json({
      book,
      slug,
      source: "mock",
      note: "The model output could not be used; saved a preview instead.",
    });
  }
});
