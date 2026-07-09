// Central Supabase configuration detection.
//
// Every Supabase feature in BookVerse is OPTIONAL. When the relevant
// environment variables are absent, the app silently falls back to its local
// behaviour (SQLite / JSON-file book cache + localStorage shelf, no accounts).
// This keeps Principle #5 — "graceful degradation" — intact.

// Public values (safe to inline into the browser bundle).
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Auth + per-user shelves need the public URL + anon key.
export const supabaseAuthEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
