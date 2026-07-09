# BookVerse AI - Backend, Persistence, Auth & Images (setup guide)

These are the environment-dependent pieces: they need your database, keys, or
GPU/model to actually run, so they are documented here as drop-in scaffolds
with setup steps rather than shipped as pre-wired code. The web app already
works end to end without any of them (file cache + Ollama/mock).

The single seam for all persistence is `lib/store.ts`. Everything below swaps
its implementation without touching the UI.

---

## 1. Postgres / Supabase cache (replace the file cache)

Today generated books are JSON files in `.bookverse-cache/`. To persist in
Postgres (e.g. Supabase), keep the same `getBookBySlug` / `saveGeneratedBook`
signatures and change the body.

Schema:

```sql
create table books (
  slug text primary key,
  data jsonb not null,          -- the full Book object
  created_at timestamptz default now()
);
```

Adapter (`lib/store.supabase.ts`):

```ts
import { createClient } from "@supabase/supabase-js";
import type { Book } from "./types";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getGeneratedBook(slug: string): Promise<Book | null> {
  const { data } = await supabase.from("books").select("data").eq("slug", slug).single();
  return (data?.data as Book) ?? null;
}
export async function saveGeneratedBook(book: Book) {
  await supabase.from("books").upsert({ slug: book.slug, data: book });
}
export async function listGeneratedBooks() {
  const { data } = await supabase
    .from("books").select("slug,data,created_at").order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({ ...toSummary(r.data), createdAt: +new Date(r.created_at) }));
}
```

Steps: `npm i @supabase/supabase-js`, create the table, set `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, then have `lib/store.ts` delegate
to the Supabase adapter when those envs are present (else fall back to files).

---

## 2. .NET 9 Web API (the report's target backend)

If you want the AI + persistence behind a separate service (per the project
report), expose endpoints returning the exact `Book` shape from `lib/types.ts`.

Endpoints:

- `GET  /api/books/{slug}`   -> Book (cache lookup)
- `GET  /api/books`          -> BookSummary[]
- `POST /api/generate`       -> { title } => Book (generate + cache)
- `POST /api/chat`           -> { slug, messages } => streamed text

Minimal project:

```bash
dotnet new webapi -n BookVerse.Api
cd BookVerse.Api
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

`Program.cs` (sketch):

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<BookDb>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("Books")));
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();

app.MapGet("/api/books/{slug}", async (string slug, BookDb db) =>
    await db.Books.FindAsync(slug) is { } b ? Results.Content(b.Data, "application/json") : Results.NotFound());

app.MapPost("/api/generate", async (GenerateReq req, BookDb db, IAiClient ai) => {
    var slug = Slug.Of(req.Title);
    var existing = await db.Books.FindAsync(slug);
    if (existing is not null) return Results.Content(existing.Data, "application/json");
    var json = await ai.GenerateBookJson(req.Title);   // calls Ollama /api/generate
    db.Books.Add(new BookRow { Slug = slug, Data = json });
    await db.SaveChangesAsync();
    return Results.Content(json, "application/json");
});
app.Run();
```

Then point the Next app at it: replace `lib/store.ts` reads and the `/api/*`
routes with `fetch(process.env.NEXT_PUBLIC_API_URL + "/api/...")`. Because the
UI already only depends on the `Book` shape, no components change.

Note: this duplicates the working Next API routes. Only adopt it if you
specifically want the .NET service; otherwise the Next routes are production-ready.

---

## 3. Real image generation for sketches (SDXL / FLUX / ComfyUI)

Sketches are currently gradient + emoji placeholders. To paint real concept art:

1. Add `imageUrl?: string` to the `Sketch` type in `lib/types.ts`.
2. Add an adapter `lib/ai/images.ts`:

```ts
export async function paintSketch(prompt: string): Promise<string | null> {
  const url = process.env.IMAGE_API_URL;              // e.g. ComfyUI / Automatic1111
  if (!url) return null;                               // graceful: keep placeholder
  const res = await fetch(`${url}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, width: 768, height: 512 }),
  });
  if (!res.ok) return null;
  const { image } = await res.json();                 // base64 or URL
  return image;
}
```

3. In `app/api/generate/route.ts`, after normalizing the book, optionally
   `paintSketch(s.caption)` for each sketch and store `imageUrl` when returned.
4. In `components/book/Sketches.tsx`, render `<img>` when `imageUrl` exists,
   else the current gradient placeholder.

Keep it cache-first (images stored with the book) to preserve near-zero cost.

---

## 4. Authentication + per-user shelves

Today "My Shelf" is local (browser `localStorage`) - instant, no account. To add
real accounts and sync shelves across devices:

Recommended: **Supabase Auth** (pairs with the Postgres cache above).

1. `npm i @supabase/supabase-js @supabase/ssr`
2. Enable email/OAuth providers in the Supabase dashboard.
3. Add a `shelves` table:

```sql
create table shelves (
  user_id uuid references auth.users(id),
  slug text,
  data jsonb,
  primary key (user_id, slug)
);
alter table shelves enable row level security;
create policy "own rows" on shelves
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

4. Wrap the app in a Supabase provider, add a sign-in button in `Nav.tsx`.
5. Upgrade `lib/shelf.ts`: when signed in, read/write `shelves` via Supabase;
   when signed out, keep using `localStorage`. On sign-in, merge the local
   shelf into the account (one-time migration).

The `useShelf()` hook is the only integration point - its `{ items, has, toggle,
remove }` API stays identical, so no components change.

---

## Summary of env variables

```
# AI (already used)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain

# Persistence (optional)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# .NET backend (optional)
NEXT_PUBLIC_API_URL=http://localhost:5080

# Images (optional)
IMAGE_API_URL=http://127.0.0.1:8188
```
