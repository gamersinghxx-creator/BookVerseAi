import type { Book } from "./types";
import { getSupabaseAdmin, supabaseCacheEnabled } from "./supabase/admin";

// Supabase (Postgres) implementation of the "generate once, serve forever"
// book cache. Mirrors the SQLite adapter in lib/db.ts and is selected by
// lib/store.ts whenever the service-role env is configured.
//
// Seed books stay in code (lib/books.ts) and are merged by lib/store.ts, so no
// seeding migration is required in Postgres — only AI-generated books are
// persisted here. This matches the JSON-file fallback's behaviour exactly.

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
    .maybeSingle();
  if (error || !data) return null;
  return data.data as Book;
}

export async function supaUpsert(book: Book): Promise<boolean> {
  const db = getSupabaseAdmin();
  if (!db) return false;
  const { error } = await db.from("books").upsert(
    {
      slug: book.slug,
      title: book.title,
      author: book.author,
      category: book.category,
      tagline: book.tagline,
      emoji: book.cover.emoji,
      data: book,
    },
    { onConflict: "slug" }
  );
  return !error;
}

// Generated books only, newest first.
export async function supaGenerated(): Promise<Book[]> {
  const db = getSupabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("books")
    .select("data")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => r.data as Book);
}
