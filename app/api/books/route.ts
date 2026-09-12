import { listGeneratedBooks } from "@/lib/store";
import { route } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AI-generated books (seed library excluded), newest first.
export const GET = route("books", async (_req, ctx) => {
  return ctx.json({ books: await listGeneratedBooks() });
});
