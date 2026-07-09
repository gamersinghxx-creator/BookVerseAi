import { promises as fs } from "fs";
import path from "path";
import type { Book } from "./types";
import { books as seedBooks, getBook as getSeedBook } from "./books";
import { dbAvailable, dbGet, dbUpsert, dbAll, dbGenerated } from "./db";
import { supaCacheEnabled, supaGet, supaUpsert, supaGenerated } from "./store.supabase";

// Server-side book store. Selection order for the generated-book cache:
//   1. Supabase / Postgres — when SUPABASE_SERVICE_ROLE_KEY is set (hosted prod)
//   2. Embedded SQLite     — lib/db.ts (Node 22+ local / persistent-disk hosts)
//   3. JSON file cache     — universal fallback
// Either way it unifies the curated seed library and AI-generated books into
// one dynamic source, implementing "generate once, serve forever". The curated
// seed library lives in code (lib/books.ts); in the Supabase and file paths it
// is merged in here rather than stored inside the cache.

const CACHE_DIR = path.join(process.cwd(), ".bookverse-cache");

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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

// ---- public API ------------------------------------------------------------

export async function getGeneratedBook(slug: string): Promise<Book | null> {
  if (supaCacheEnabled()) return supaGet(slug);
  if (await dbAvailable()) return dbGet(slug);
  return fileGet(slug);
}

export async function saveGeneratedBook(book: Book): Promise<void> {
  if (supaCacheEnabled()) {
    await supaUpsert(book);
    return;
  }
  if (await dbAvailable()) {
    await dbUpsert(book, "generated");
    return;
  }
  await fileSave(book);
}

// Seed library first (canonical), then the generated cache.
export async function getBookBySlug(slug: string): Promise<Book | null> {
  if (supaCacheEnabled()) return getSeedBook(slug) ?? (await supaGet(slug));
  if (await dbAvailable()) return dbGet(slug);
  return getSeedBook(slug) ?? (await fileGet(slug));
}

export async function hasBook(slug: string): Promise<boolean> {
  return (await getBookBySlug(slug)) !== null;
}

// Slugs known at build time (seed only; generated books render on demand).
export function seedSlugs(): string[] {
  return seedBooks.map((b) => b.slug);
}

export interface BookSummary {
  slug: string;
  title: string;
  author: string;
  category: Book["category"];
  tagline: string;
  emoji: string;
  cached: boolean;
  createdAt: number;
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
    createdAt: 0,
  };
}

// AI-generated books (newest first).
export async function listGeneratedBooks(): Promise<BookSummary[]> {
  if (supaCacheEnabled()) return (await supaGenerated()).map(toSummary);
  if (await dbAvailable()) return (await dbGenerated()).map(toSummary);
  const files = await fileGeneratedFull();
  return files.map(toSummary);
}

// Every book (seed + generated), seeds first.
export async function listAllBooks(): Promise<Book[]> {
  if (supaCacheEnabled()) {
    const generated = await supaGenerated();
    const seedSet = new Set(seedBooks.map((b) => b.slug));
    return [...seedBooks, ...generated.filter((b) => !seedSet.has(b.slug))];
  }
  if (await dbAvailable()) return dbAll();
  const generated = await fileGeneratedFull();
  const seedSet = new Set(seedBooks.map((b) => b.slug));
  return [...seedBooks, ...generated.filter((b) => !seedSet.has(b.slug))];
}

// Dynamic search across the whole library.
export async function searchAllBooks(query: string): Promise<Book[]> {
  const all = await listAllBooks();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((b) =>
    [b.title, b.author, b.category, ...b.tags].some((f) =>
      f.toLowerCase().includes(q)
    )
  );
}
