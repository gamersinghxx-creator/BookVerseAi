import { deleteGeneratedBook, isSeedSlug } from "@/lib/store";
import { route, ApiError, badRequest } from "@/lib/http";
import { requireAdmin } from "@/lib/admin";
import { track } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Delete a generated book (admin only). Seed books are never deletable.
export const DELETE = route("books.delete", async (_req, ctx) => {
  const slug = ctx.params.slug;
  if (!slug) throw badRequest("Missing slug");
  if (isSeedSlug(slug)) throw new ApiError(403, "seed_book", "Seed books cannot be deleted");

  const email = await requireAdmin();
  const removed = await deleteGeneratedBook(slug);
  if (!removed) throw new ApiError(404, "not_found", "No generated book with that slug");

  ctx.log.info("book.deleted", { slug, by: email });
  track("book.deleted", { slug });
  return ctx.json({ ok: true, slug });
});
