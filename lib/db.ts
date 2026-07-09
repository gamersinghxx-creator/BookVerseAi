import type { Book } from "./types";
import { books as seedBooks } from "./books";

// Real embedded database using Node's built-in SQLite (node:sqlite, Node 22+).
// No native build, no external service. If the runtime lacks node:sqlite, every
// function returns a falsy/empty result and lib/store.ts falls back to the JSON
// file cache - so the app stays fully functional everywhere.

/* eslint-disable @typescript-eslint/no-explicit-any */
type DB = any;
let dbPromise: Promise<DB | null> | undefined;

async function getDb(): Promise<DB | null> {
  if (dbPromise) return dbPromise;
  dbPromise = (async () => {
    try {
      const sqlite: any = await import("node:sqlite");
      const { mkdirSync } = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), ".bookverse-cache");
      mkdirSync(dir, { recursive: true });
      const d = new sqlite.DatabaseSync(path.join(dir, "books.db"));
      d.exec(`CREATE TABLE IF NOT EXISTS books (
        slug TEXT PRIMARY KEY,
        title TEXT,
        author TEXT,
        category TEXT,
        tagline TEXT,
        emoji TEXT,
        source TEXT,
        data TEXT NOT NULL,
        created_at INTEGER
      )`);
      seedIfEmpty(d);
      return d;
    } catch {
      return null;
    }
  })();
  return dbPromise;
}

function seedIfEmpty(d: DB) {
  const row = d.prepare("SELECT COUNT(*) AS n FROM books").get() as { n: number };
  if (row.n > 0) return;
  const ins = d.prepare(
    `INSERT OR IGNORE INTO books
     (slug,title,author,category,tagline,emoji,source,data,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)`
  );
  const now = Date.now();
  seedBooks.forEach((b, i) => {
    ins.run(
      b.slug, b.title, b.author, b.category, b.tagline, b.cover.emoji,
      "seed", JSON.stringify(b), now - (seedBooks.length - i)
    );
  });
}

export async function dbAvailable(): Promise<boolean> {
  return (await getDb()) !== null;
}

export async function dbGet(slug: string): Promise<Book | null> {
  const d = await getDb();
  if (!d) return null;
  const r = d.prepare("SELECT data FROM books WHERE slug = ?").get(slug) as
    | { data: string }
    | undefined;
  return r ? (JSON.parse(r.data) as Book) : null;
}

export async function dbUpsert(book: Book, source: string): Promise<boolean> {
  const d = await getDb();
  if (!d) return false;
  d.prepare(
    `INSERT INTO books
       (slug,title,author,category,tagline,emoji,source,data,created_at)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON CONFLICT(slug) DO UPDATE SET
       title=excluded.title, author=excluded.author, category=excluded.category,
       tagline=excluded.tagline, emoji=excluded.emoji, data=excluded.data`
  ).run(
    book.slug, book.title, book.author, book.category, book.tagline,
    book.cover.emoji, source, JSON.stringify(book), Date.now()
  );
  return true;
}

// All books, seeds first, then newest generated.
export async function dbAll(): Promise<Book[]> {
  const d = await getDb();
  if (!d) return [];
  const rows = d
    .prepare(
      "SELECT data FROM books ORDER BY (source='seed') DESC, created_at DESC"
    )
    .all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data) as Book);
}

// Generated books only, newest first.
export async function dbGenerated(): Promise<Book[]> {
  const d = await getDb();
  if (!d) return [];
  const rows = d
    .prepare("SELECT data FROM books WHERE source != 'seed' ORDER BY created_at DESC")
    .all() as { data: string }[];
  return rows.map((r) => JSON.parse(r.data) as Book);
}
