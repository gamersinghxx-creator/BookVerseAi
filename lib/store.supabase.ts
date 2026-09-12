import type { Book } from "./types";
import { getSupabaseAdmin, supabaseCacheEnabled } from "./supabase/admin";

// Supabase (Postgres) implementation of the "generate once, serve forever"
// book cache. Mirrors the SQLite adapter in lib/db.ts and is selected by
// lib/store.ts whenever the service-role env is configured.
//
// Seed books stay in code (lib/books.ts) and are merged by lib/store.ts, so no
// seeding migration is required in Postgres — only AI-generated books are
// persisted here. This matches the JSON-file fallback's behaviour exactly.
//
// Every call here aborts itself after REQUEST_TIMEOUT_MS and THROWS on error;
// lib/store.ts wraps these in `attempt()` (timeout + circuit breaker) so a slow
// or dead Supabase degrades to the local cache instead of hanging the request.

const REQUEST_TIMEOUT_MS = 2500;

function signal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

export function supaCacheEnabled(): boolean {
  return supabaseCacheEnabled;
}

export async function supaGet(slug: string): Promise<Book | null> {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const { data, error } = await db
    .from("books")
    .select("data")
    .eq("slug", slug)
    .abortSignal(signal())
    .maybeSingle();
  if (error) throw error;
  return (data?.data as Book) ?? null;
}

export async function supaUpsert(book: Book): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase admin client unavailable");
  const { error } = await db
    .from("books")
    .upsert(
      {
        slug: book.slug,
        title: book.title,
        author: book.author,
        category: book.category,
        tagline: book.tagline,
        emoji: book.cover.emoji,
        data: book,
      },
      { onConflict: "slug" },
    )
    .abortSignal(signal());
  if (error) throw error;
}

export async function supaDelete(slug: string): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) throw new Error("Supabase admin client unavailable");
  const { error } = await db.from("books").delete().eq("slug", slug).abortSignal(signal());
  if (error) throw error;
  return true;
}

// Generated books only, newest first.
export async function supaGenerated(): Promise<Book[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("books")
    .select("data")
    .order("created_at", { ascending: false })
    .abortSignal(signal());
  if (error) throw error;
  return (data ?? []).map((r) => r.data as Book);
}
