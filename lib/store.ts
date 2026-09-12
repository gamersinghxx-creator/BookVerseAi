import { promises as fs } from "fs";
import path from "path";
import type { Book } from "./types";
import { books as seedBooks, getBook as getSeedBook } from "./books";
import { dbAvailable, dbGet, dbUpsert, dbGenerated, dbDelete } from "./db";
import {
  supaCacheEnabled,
  supaGet,
  supaUpsert,
  supaGenerated,
  supaDelete,
} from "./store.supabase";
import { attempt } from "./resilience";
import { searchBooks } from "./search";

// Server-side book store. Selection order for the generated-book cache:
//   1. Supabase / Postgres — when SUPABASE_SERVICE_ROLE_KEY is set (hosted prod)
//   2. Embedded SQLite     — lib/db.ts (Node 22+ local / persistent-disk hosts)
//   3. JSON file cache     — universal fallback
//
// The Supabase path is wrapped in `attempt()` (timeout + circuit breaker): if it
// is slow or unreachable, the call degrades to SQLite/file within ~2.5s once and
// then short-circuits for a cooldown window — a dead hosted DB never hangs the
// app. The curated seed library always lives in code (lib/books.ts) and is
// merged in here so seed books resolve instantly regardless of backend health.

const CACHE_DIR = path.join(process.cwd(), ".bookverse-cache");
const SUPA_CIRCUIT = "supabase";
const SUPA_TIMEOUT_MS = 3000;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Attempt a Supabase operation under the shared circuit breaker. Returns
// `{ ok: true, value }` or `{ ok: false }` (caller then uses the local path).
async function trySupa<T>(fn: () => Promise<T>) {
  if (!supaCacheEnabled()) return { ok: false as const };
  const r = await attempt(SUPA_CIRCUIT, SUPA_TIMEOUT_MS, fn);
  return r.ok ? ({ ok: true as const, value: r.value as T }) : { ok: false as const };
}

// ---- file fallback helpers -------------------------------------------------

async function ensureDir() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
}
function cacheFile(slug: string) {
  return path.join(CACHE_DIR, `${slug}.json`);
}
async function fileGet(slug: string): Promise<Book | null> {
  try {
    return JSON.parse(await fs.readFile(cacheFile(slug), "utf-8")) as Book;
  } catch {
    return null;
  }
}
async function fileSave(book: Book) {
  await ensureDir();
  await fs.writeFile(cacheFile(book.slug), JSON.stringify(book, null, 2), "utf-8");
}
async function fileDelete(slug: string): Promise<boolean> {
  try {
    await fs.unlink(cacheFile(slug));
    return true;
  } catch {
    return false;
  }
}
async function fileGeneratedFull(): Promise<Book[]> {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const out: Book[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const b = await fileGet(f.replace(/\.json$/, ""));
      if (b) out.push(b);
    }
    return out.sort((a, b) => a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

// Merge code seed library (canonical) with a list of generated books, seeds first.
function mergeWithSeeds(generated: Book[]): Book[] {
  const seen = new Set(seedBooks.map((b) => b.slug));
  return [...seedBooks, ...generated.filter((b) => !seen.has(b.slug))];
}

// ---- public API ------------------------------------------------------------

export async function getGeneratedBook(slug: string): Promise<Book | null> {
  const supa = await trySupa(() => supaGet(slug));
  if (supa.ok) return supa.value;
  if (await dbAvailable()) return dbGet(slug);
  return fileGet(slug);
}

export async function saveGeneratedBook(book: Book): Promise<void> {
  const supa = await trySupa(() => supaUpsert(book));
  if (supa.ok) return;
  if (await dbAvailable()) {
    await dbUpsert(book, "generated");
    return;
  }
  await fileSave(book);
}

// Seed library first (canonical + always instant), then the generated cache.
export async function getBookBySlug(slug: string): Promise<Book | null> {
  const seed = getSeedBook(slug);
  if (seed) return seed;
  return getGeneratedBook(slug);
}

export async function hasBook(slug: string): Promise<boolean> {
  return (await getBookBySlug(slug)) !== null;
}

// Slugs known at build time (seed only; generated books render on demand).
export function seedSlugs(): string[] {
  return seedBooks.map((b) => b.slug);
}

const seedSlugSet = new Set(seedBooks.map((b) => b.slug));
export function isSeedSlug(slug: string): boolean {
  return seedSlugSet.has(slug);
}

// Remove a generated book from every backend. Seed books are never deletable.
export async function deleteGeneratedBook(slug: string): Promise<boolean> {
  if (isSeedSlug(slug)) return false;
  let removed = false;
  const supa = await trySupa(() => supaDelete(slug));
  if (supa.ok) removed = supa.value;
  if (await dbAvailable()) removed = (await dbDelete(slug)) || removed;
  removed = (await fileDelete(slug)) || removed;
  return removed;
}

export interface BookSummary {
  slug: string;
  title: string;
  author: string;
  category: Book["category"];
  tagline: string;
  emoji: string;
  cached: boolean;
}

function toSummary(b: Book): BookSummary {
  return {
    slug: b.slug,
    title: b.title,
    author: b.author,
    category: b.category,
    tagline: b.tagline,
    emoji: b.cover.emoji,
    cached: b.cached,
  };
}

// AI-generated books (newest first per the active backend's ordering).
export async function listGeneratedBooks(): Promise<BookSummary[]> {
  const supa = await trySupa(() => supaGenerated());
  if (supa.ok) return supa.value.map(toSummary);
  if (await dbAvailable()) return (await dbGenerated()).map(toSummary);
  return (await fileGeneratedFull()).map(toSummary);
}

// Every book (seed + generated), seeds first.
export async function listAllBooks(): Promise<Book[]> {
  const supa = await trySupa(() => supaGenerated());
  if (supa.ok) return mergeWithSeeds(supa.value);
  if (await dbAvailable()) return mergeWithSeeds(await dbGenerated());
  return mergeWithSeeds(await fileGeneratedFull());
}

// Ranked search across the whole library (seed + generated). Empty query
// returns everything, seeds first.
export async function searchAllBooks(query: string, limit?: number): Promise<Book[]> {
  return searchBooks(await listAllBooks(), query, limit);
}
