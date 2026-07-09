# BookVerse AI — Project Handoff

> Snapshot of where the project stands and what to do next.
> Last updated: 2026-07-06.

## Current state

The **frontend MVP** is built, **runs on Next.js 16**, and is **verified end to
end**: `npm run build` passes, and a production server was smoke-tested — the
home page and all four book pages return HTTP 200, unknown slugs return 404, and
every section renders (including the fiction-only character map). It runs
entirely on typed mock data — no backend or API keys required.

### What works today

- **Home page** (`/`): animated hero, live client-side book search with
  title/author/topic matching and Fiction / Non-fiction filters, feature grid.
- **Book pages** (`/book/[slug]`), statically generated for four public-domain
  titles: The Art of War, Meditations, Pride and Prejudice, Frankenstein.
  Each page has: header, overview, structured summary, chapter breakdown, key
  lessons, conceptual AI sketches (placeholders), timeline, character map
  (fiction only), radial SVG mind map, and an interactive AI-tutor chat.
- **AI tutor**: a mock that keyword-matches questions to pre-baked Q&A and
  simulates a "thinking" delay. Ready to swap for a real endpoint.
- **Cache model**: each book carries a `cached` flag surfaced in the UI, and
  `not-found` explains that a real search would trigger fresh generation —
  demonstrating the "generate once, serve forever" design.
- Fully responsive, dark premium theme, Framer Motion throughout.

### Build result

```
Route (app)                    Size      First Load JS
/                              10.5 kB   141 kB
/book/[slug]  (SSG x4)         5.55 kB   136 kB
```

## How to run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verified passing)
```

Requires Node 18+. Fonts load from Google Fonts via a stylesheet `<link>`, so
the build does not depend on fetching fonts at compile time.

## Where things live

- Mock data & domain types: `lib/books.ts`, `lib/types.ts`.
- Page-level sections: `components/book/*`.
- Home/shared UI: `components/*`.
- The mock→live boundary is entirely inside `lib/`; components never assume the
  data source, so wiring a real backend touches only that layer.

## Known items / notes

- **Security:** resolved — upgraded to `next@^16.2.10` (from 14.2.5).
- **Next 16 note:** route `params` are now async (a Promise). `app/book/[slug]/
  page.tsx` awaits them (`const { slug } = await params;`) in both the page and
  `generateMetadata`. Apply the same pattern to any new dynamic routes.
- Conceptual sketches are gradient + emoji placeholders, clearly labelled "AI
  concept", pending the real image pipeline (SDXL / FLUX / ComfyUI).
- GSAP (in the original stack) is not used; Framer Motion covers current needs.

## Next steps (recommended order)

1. **Backend (.NET 9 + EF Core)**: expose `GET /books/{slug}` and
   `POST /generate` returning the exact `Book` shape from `lib/types.ts`.
2. **Postgres/Supabase cache**: persist generated books; check cache before
   generating.
3. **Real AI text generation** via Ollama (Qwen/Llama/Gemma/Mistral) behind the
   `POST /generate` endpoint; replace the mock tutor's `answer()` with a call to
   a grounded chat endpoint.
4. **Real image generation** to replace placeholder sketches.
5. **Auth** (Phase 1 item still open) and user features.
6. Turn `lib/books.ts` reads into `fetch()` calls against the API; the UI should
   need no other changes.

## Decisions log

- 2026-07-06: Scoped first build to **frontend MVP with mock data** (per user).
  Chose to mirror the future API response shape in `lib/types.ts` so the swap to
  live data is a `lib/`-only change.
- 2026-07-06: Replaced `next/font/google` with a plain font `<link>` to remove a
  build-time network dependency on Google Fonts.
- 2026-07-06: Upgraded to Next.js 16 and adopted async route `params`
  (`await params`) in the dynamic book route — required by Next 15+.
- 2026-07-06: `Section` accepts a rendered icon **element** (ReactNode) rather
  than a component, so server pages can use it without passing a function across
  the server/client boundary.

---

## Phase 2 — live AI (added 2026-07-06)

Phase 2 wires real AI into the app via **Next.js API routes** with a **local
Ollama** runtime and a graceful mock fallback (no cloud keys, near-zero cost).

### New capabilities

- **Live AI tutor.** `components/book/AITutor.tsx` streams answers from
  `POST /api/chat`. The route grounds the model in the specific book (overview,
  summary, lessons, chapters) so answers stay on-topic. If Ollama is not
  running, it streams a grounded answer from the book's Q&A instead — same UX.
- **Generate any book.** Search a title that isn't in the library and click
  **Generate with AI**. `POST /api/generate` asks the model for a full
  Book-shaped JSON study guide, normalizes/repairs it, caches it to disk, and
  the new page renders on demand. Without Ollama it saves a clearly-labelled
  preview so the flow still works.
- **Cache — generate once, serve forever.** Generated books are written to
  `.bookverse-cache/<slug>.json`. Repeat requests are served from cache
  (verified: second generate returns `source: "cache"`).

### New files

- `lib/ai/` — `types.ts`, `config.ts`, `ollama.ts` (streaming client),
  `prompts.ts` (grounding + generation prompts), `mock.ts` (offline fallbacks),
  `index.ts` (provider selection, JSON extraction, Book normalization).
- `lib/store.ts` — seed + generated book lookup, slugify, file cache.
- `app/api/chat/route.ts`, `app/api/generate/route.ts`.
- `.env.example` — AI settings.

### Running with real AI (Ollama)

1. Install Ollama, then `ollama pull llama3.2` (or set `OLLAMA_MODEL`).
2. `ollama serve` (usually automatic).
3. `npm run dev`. The app auto-detects Ollama; if it's down it falls back to
   mock. Override via `.env.local` (see `.env.example`).

### Verified

`next build` passes. Production smoke test (Ollama absent): `/api/chat` streams
a grounded answer (200, `X-AI-Provider: mock`); `/api/generate` creates and
caches a book; the generated page renders (200); regeneration hits the cache.

### Still open

- Wiring Ollama was verified by code path + mock fallback; run it against a real
  local model to tune prompts and JSON reliability.
- Real image generation for sketches (still placeholders).
- Move the file cache to Postgres/Supabase and add the .NET backend (Phase 3 /
  infra), plus auth.

---

## Liquid Light redesign (2026-07-06)

Full UI/UX rethink away from the dark theme into a warm-white "living ink"
world (see Bible section 9). Highlights:

- **New design system:** warm paper + five living inks, Fraunces / Space Grotesk
  / Inter, new primitives in `globals.css`, tokens in `tailwind.config.ts`.
- **Signature engine:** `components/fx/LiquidLight.tsx` (breathing, cursor-reactive
  Canvas ink field), `fx/Cursor.tsx` (trailing glow), `fx/Reveal.tsx`, grain overlay.
- **Cinematic hero:** kinetic rising type + a "living search" (`LivingSearch.tsx`)
  that blooms with light and summons any book.
- **Library as a constellation:** `BookOrb.tsx` + `Library.tsx` (organic offsets,
  colour auras) replace the old grid/cards.
- **Scroll-story:** `Story.tsx` - four acts on a filling ink thread.
- **Book pages + all modules restyled** to the light palette, each page keyed to a
  per-book accent (`lib/accents.ts`): header, sections, timeline, mind map,
  character map, sketches, tutor, and 404.
- **Deprecated (kept as empty stubs; drive blocks deletion):** `Navbar`,
  `BookCard`, `Features`, `SearchLibrary`.
- **Verified:** `next build` passes; production smoke test - home + all book pages
  200, unknown slug 404, new fonts/markers present, skip-link + reduced-motion in place.

---

## Full in-app functionality (2026-07-06)

Completed the web app's own functionality (all built + verified via production
build and smoke test):

- **Recommendations:** `components/book/Related.tsx` + `lib/related.ts` - a
  "Continue wandering" rail of related books on every book page (tag/category overlap).
- **Generated books surfaced:** `GET /api/books` + `components/RecentlySummoned.tsx`
  - a "Recently summoned" section on the home page, so a summoned book is never a
  dead end. `lib/store.ts` gained `listGeneratedBooks()`.
- **Cinematic summoning:** full-screen "painting" overlay in `LivingSearch.tsx`
  with rotating stage narrative while the AI generates.
- **Route states:** `app/loading.tsx`, `app/error.tsx`, and per-book
  `loading.tsx` / `error.tsx`.
- **SEO / PWA:** `app/manifest.ts`, `app/sitemap.ts`, `app/robots.ts`,
  generated `app/icon.tsx` and `app/opengraph-image.tsx`, plus full OpenGraph /
  Twitter metadata in `layout.tsx`.
- **My Shelf (local):** `lib/shelf.ts` (localStorage, reactive via
  `useSyncExternalStore`), `components/ShelfButton.tsx`, `app/shelf/page.tsx`,
  bookmark on every orb + book header, and a Nav link. No account needed.
- **Compare mode:** `app/compare/page.tsx` - pick two books, see promise,
  overview, and key lessons side by side. Nav link added.

**Verified:** `next build` passes (14 routes). Smoke test: `/`, `/shelf`,
`/compare`, book pages, `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`,
`/icon`, `/opengraph-image`, `/api/books` all 200; generating a new title makes
it appear in `/api/books`; the related rail, compare, and shelf all render.

### Env-dependent pieces (documented, not auto-wired)

These need your keys / DB / GPU to run, so they're written up as drop-in
scaffolds with setup steps in **`docs/BACKEND_AND_AUTH.md`**:

- Postgres/Supabase cache (swap the file store at the `lib/store.ts` seam).
- .NET 9 Web API mirroring the `Book` shape (optional; Next routes already work).
- Real image generation for sketches (SDXL / FLUX / ComfyUI adapter).
- Real accounts / auth (Supabase Auth) + syncing the local shelf per-user - the
  `useShelf()` API stays identical, so no components change.

---

## Dynamic database (2026-07-06)

The app is now driven by a **real embedded database** instead of hardcoded/mock
data, with no external service and no native build.

- **`lib/db.ts`** uses Node's built-in **`node:sqlite`** (Node 22+). On first
  run it creates `.bookverse-cache/books.db`, defines a `books` table, and
  **auto-seeds** the four curated books. Generated books are upserted here too,
  so seed + generated live in one growing store.
- **Graceful fallback:** if `node:sqlite` is unavailable (older Node), every DB
  call no-ops and `lib/store.ts` falls back to the JSON file cache - the app
  stays fully functional.
- **`lib/store.ts`** now routes all reads/writes through the DB (with fallback)
  and exposes `listAllBooks()` and `searchAllBooks(q)`.
- **Dynamic library + search:** the home page is `force-dynamic` and
  server-renders the whole library from the DB (so newly summoned books appear
  immediately); `LivingSearch` pulls live suggestions from `GET /api/library?q=`
  across the entire store; `GET /api/books` lists generated books.
- **Types:** `types/node-sqlite.d.ts` provides an ambient declaration until
  `@types/node` ships them.

**Verified:** clean DB seeds 4 books on boot; generating "Thinking Fast and
Slow" persisted to SQLite (5 rows: 4 seed + 1 generated) and appeared instantly
in library search, `/api/books`, the home render, and its own page; build passes
(13 routes).

**Deployment note:** on ephemeral/serverless filesystems (e.g. Vercel) the
SQLite file does not persist between invocations - use the Postgres/Supabase
adapter in `docs/BACKEND_AND_AUTH.md` for hosted production. Local/VM/self-host
runs persist normally.

---

## Ollama setup + live status (2026-07-06)

The app talks to a local Ollama server and now shows its status live.

- **`GET /api/health`** reports `{ provider, available, model, modelReady, models }`.
- **`components/AIStatus.tsx`** renders a dot + label in the nav, polling every 15s:
  green "AI live · llama3.2" (reachable + model pulled), amber "Model not pulled"
  (reachable, model missing), grey "Preview mode" (Ollama not detected).
- **`lib/ai/ollama.ts`** gained `models()` and a clearer model-not-found error.
- **`.env.local`** created with the Ollama defaults.

### To turn on real AI (on your machine)

1. Install Ollama from https://ollama.com/download (Windows installer).
2. Open a terminal and pull a model: `ollama pull llama3.2`
   (Ollama usually runs automatically after install; otherwise `ollama serve`.)
3. Start the app: `npm run dev`. The nav badge turns green ("AI live").
4. Now summoning a book writes a real AI-generated guide, and the tutor answers
   with the live model. To use a different model, set `OLLAMA_MODEL` in `.env.local`
   (e.g. `qwen2.5`, `mistral`, `gemma2`) and pull it first.

Verified (via a stubbed Ollama): all three status states report correctly and the
badge/health endpoint reflect them; build passes.

---

## Phase 3 — production infrastructure (2026-07-09)

Wired the launch infrastructure: **hosted Postgres persistence, real accounts,
and a cross-device shelf**, targeting **Supabase + Vercel**. Everything is
env-gated, so with no keys set the app still runs exactly as before (SQLite +
localStorage, no login) — Principle #5 (graceful degradation) is preserved.

### New capabilities

- **Supabase Postgres book cache.** `lib/store.supabase.ts` implements the
  "generate once, serve forever" cache against a Postgres `books` table using the
  service-role key (server-only). `lib/store.ts` now selects, in order:
  Supabase (when `SUPABASE_SERVICE_ROLE_KEY` is set) → SQLite → JSON file. This
  gives durable persistence on Vercel, whose filesystem is ephemeral.
- **Supabase Auth.** Magic-link email + optional Google OAuth. `components/
  AuthButton.tsx` in the nav; `middleware.ts` refreshes the session; `app/auth/
  callback/route.ts` exchanges the code for a session. Server/browser/admin
  clients live in `lib/supabase/`.
- **Synced shelf.** `lib/shelf.ts` keeps the identical `useShelf()` API but now
  reads/writes a per-user `shelves` table (RLS-protected) when signed in, and
  localStorage when signed out. Local bookmarks merge into the account once on
  first sign-in. No shelf-consuming component changed.

### New / changed files

- New: `lib/supabase/{env,client,server,admin}.ts`, `lib/store.supabase.ts`,
  `middleware.ts`, `app/auth/callback/route.ts`, `components/AuthButton.tsx`,
  `supabase/schema.sql`, `DEPLOY.md`.
- Changed: `lib/store.ts` (Supabase-first selection), `lib/shelf.ts` (auth-aware),
  `components/Nav.tsx` (AuthButton), `package.json` (+`@supabase/supabase-js`,
  `@supabase/ssr`), `.env.example` (Supabase vars).

### Deploy

Full step-by-step in **`DEPLOY.md`**: create the Supabase project, run
`supabase/schema.sql`, set the three env vars, configure auth redirect URLs,
push to GitHub, import into Vercel, verify. AI in production defaults to
`AI_PROVIDER=mock` (Ollama is local-only); host Ollama on a GPU VM for live AI.

### Still deferred (post-launch, by decision)

- Real image generation for sketches — kept as polished placeholders for v1 to
  hold the near-zero-cost goal (scaffold in `BACKEND_AND_AUTH.md §3`).
- Optional .NET backend — the Next.js API routes are production-ready.

### Verification note

The two new npm packages could not be installed / built in the authoring
sandbox (its registry access is blocked), so the **final `npm install &&
npm run build` must be run on your machine** — see DEPLOY.md §1. The code
follows the standard `@supabase/ssr` App Router patterns and is env-guarded so
the build passes with or without Supabase keys present.

---

## Phase 3 — cloud LLM providers (2026-07-09)

Added hosted AI so the app can generate for real in production (Ollama is
local-only and can't run on Vercel). One unified provider covers every
OpenAI-compatible API.

- **`lib/ai/openai-compat.ts`** — `OpenAICompatProvider` implements the
  `AIProvider` interface (`available` / `chatStream` / `complete`) against
  `POST /chat/completions` with SSE streaming and `response_format:
  json_object` for structured generation.
- **`lib/ai/config.ts`** — `cloudPresets` (groq / gemini / openai) + `resolveCloud()`.
  Base URL, model, and key are all env-overridable.
- **`lib/ai/index.ts`** — `getProvider()` / `getStatus()` pick the cloud provider
  when `AI_PROVIDER` is groq/gemini/openai/openai-compat; otherwise Ollama, then
  mock. `AIStatus.provider` widened to `string`.
- **`components/AIStatus.tsx`** — badge/tooltip now provider-generic.

Switching is a one-line env change (`AI_PROVIDER`). Providers supported out of
the box: **Groq** (`GROQ_API_KEY`, default `llama-3.3-70b-versatile`),
**Gemini** (`GEMINI_API_KEY`, default `gemini-2.0-flash`), **OpenAI**
(`OPENAI_API_KEY`, default `gpt-4o-mini`), and any OpenAI-compatible endpoint
via `AI_PROVIDER=openai-compat` + `LLM_BASE_URL`/`LLM_MODEL`/`LLM_API_KEY`.

Current local config: `AI_PROVIDER=groq`. For Vercel, set `AI_PROVIDER=groq` +
`GROQ_API_KEY` in the project env vars (replaces the earlier `mock` suggestion
in DEPLOY.md §5).
