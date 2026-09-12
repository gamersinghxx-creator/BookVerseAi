# BookVerse AI — Backend, Persistence, Auth & Images (setup guide)

The Supabase pieces (Postgres cache + Auth + synced shelf) are **already wired**
and env-gated — this section explains how they work and how to point them at your
own project. The image pipeline (§3) and the optional .NET backend (§2) are
scaffolds. The app runs end to end without any of them (SQLite / file cache +
mock or Ollama).

The single seam for all persistence is `lib/store.ts`. See `docs/ARCHITECTURE.md`.

---

## 1. Postgres / Supabase cache — already implemented

`lib/store.ts` selects, in order: **Supabase** (when `SUPABASE_SERVICE_ROLE_KEY`
is set) → **embedded SQLite** (`node:sqlite`) → **per-slug JSON files**. The
Supabase path is wrapped in `attempt()` (`lib/resilience.ts`): each call aborts
after 2.5–3s and a process-global circuit breaker opens after two failures, so a
paused or unreachable Supabase degrades to SQLite instantly instead of hanging.

- Adapter: `lib/store.supabase.ts` — each function aborts via
  `AbortSignal.timeout` and **throws** on error so `attempt()` sees the failure.
- Schema: `supabase/schema.sql` (the `books` table plus flat columns for cheap
  listing; RLS on, no policies → service-role only).
- Seed books are **not** stored in Postgres — they live in `lib/books.ts` and are
  merged in by `lib/store.ts`, so there's no seeding migration.

**To use your own project:** create a Supabase project, run `supabase/schema.sql`
in the SQL editor, and set `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
Remove them and the app is back on SQLite — no code change.

---

## 2. .NET 9 Web API (optional alternative backend)

The Next.js API routes **are** the backend and are production-ready. This section
is only for teams that specifically want the AI + persistence behind a separate
.NET service. Expose endpoints returning the exact `Book` shape from
`lib/types.ts`.

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

Sketches are currently gradient + emoji placeholders (`components/book/Sketches.tsx`).
To paint real concept art:

1. Add `imageUrl?: string` to the `Sketch` type in `lib/types.ts` **and** to the
   `RawSketch` schema in `lib/schemas.ts` so generated books can carry it.
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

## 4. Authentication + synced shelves — already implemented

Magic-link email + optional Google OAuth via **Supabase Auth**, env-gated on
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- `components/AuthButton.tsx` in the nav (renders nothing until the env vars are set).
- `proxy.ts` refreshes the session on every request, time-boxed to 2s.
- `app/auth/callback/route.ts` exchanges the code for a session.
- Clients: `lib/supabase/{client,server,admin}.ts`.
- `lib/shelf.ts` keeps the identical `useShelf()` API but reads/writes the
  per-user `shelves` table (RLS-protected) when signed in, `localStorage` when
  signed out. Local bookmarks merge into the account once on first sign-in.
- `shelves` table + RLS policies are in `supabase/schema.sql`.

**To use your own project:** in the Supabase dashboard enable the Email provider
(and Google if wanted), set the redirect URLs to `<site>/auth/callback`, and add
the three env vars. See `DEPLOY.md §3`.

---

## Summary of env variables

See `.env.example` for the authoritative list. Persistence + auth need:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # SECRET — server only
```

Optional pieces from this doc:

```
IMAGE_API_URL=http://127.0.0.1:8188            # §3 image generation
NEXT_PUBLIC_API_URL=http://localhost:5080       # §2 optional .NET backend
```
