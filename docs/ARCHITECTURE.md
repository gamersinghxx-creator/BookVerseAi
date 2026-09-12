# Architecture

How BookVerse AI is put together and why. Companion to `PROJECT_BIBLE.md §5`.

## The one rule

**Components never know where data comes from.** Every read and write goes
through `lib/store.ts`. Swapping SQLite for Postgres, or the mock AI for a hosted
model, touches `lib/` only — no component changes.

## Request lifecycle

### A book page (`/book/[slug]`)

1. `app/book/[slug]/layout.tsx` calls `loadBook(slug)` (a React `cache()` wrapper
   around `getBookBySlug`). If the book doesn't exist it calls `notFound()` —
   **here, above the `loading.tsx` Suspense boundary**, so the response carries a
   real HTTP 404.
2. `page.tsx` calls `loadBook(slug)` again — deduped by `cache()`, so one lookup.
3. Seed books resolve from `lib/books.ts` instantly. Generated books come from
   the persistence chain.
4. Each content section renders only if its data is non-empty.

### Generating a book (`POST /api/generate`)

1. `route("generate", …)` assigns a request id and a scoped logger.
2. `parseJson(req, GenerateInput)` — zod validates `{ title }`.
3. `getBookBySlug(slugify(title))` — cache-first. Hit → return `source: "cache"`.
4. `getProvider()` — picks Groq/OpenAI/Ollama by env, or `null`.
   - `null` → `mockGeneratedBook(title)`, saved, `source: "mock"`.
   - provider → `provider.complete(prompt, { json: true })` → `extractJson` →
     `normalizeGeneratedBook` → `saveGeneratedBook`.
   - provider throws → mock preview saved, `source: "mock"`, `note: …`.
5. Response always has the standard envelope on error.

## The persistence chain (`lib/store.ts`)

```
getGeneratedBook / saveGeneratedBook / listAllBooks / …
        │
        ▼
  supaCacheEnabled()?  ──no──►  dbAvailable()?  ──no──►  JSON files
        │yes                        │yes
        ▼                           ▼
  attempt("supabase", 3000ms, …)   node:sqlite
        │
   ok ──► use it
   fail ──► fall through to SQLite  (and the circuit opens for 30s)
```

`attempt()` (`lib/resilience.ts`):

- `withTimeout` races the call against a deadline — the caller **always** unblocks
  in ≤ 3s.
- A process-global circuit breaker (`globalThis`, so it's shared across Next's
  per-route bundles) opens after 2 consecutive failures for 30s. While open,
  calls short-circuit to the fallback without trying.
- Net effect: a dead Supabase costs ~2 slow requests per 30s window, then
  nothing — versus one 7s hang per request before the rebuild.

The Supabase adapter (`lib/store.supabase.ts`) also aborts each query itself via
`AbortSignal.timeout(2500)` and **throws** on error (older code swallowed it), so
`attempt()` can see the failure.

## The AI layer (`lib/ai/`)

```
lib/ai/index.ts
  getProvider()   → OpenAICompatProvider (Groq/OpenAI/Gemini) | OllamaProvider | null
  getStatus()     → verifies the configured model via the provider's /models
                    endpoint (30s cache). "modelReady" means the model is really
                    in the account's list — not just "a key string exists".
  extractJson()   → pulls a JSON object out of prose / fenced model output
  normalizeGeneratedBook  → re-exported from lib/schemas.ts

lib/ai/config.ts   → AI_PROVIDER + cloud presets + resolveCloud()
lib/ai/prompts.ts  → grounding prompt (tutor) + generation prompt (Book JSON schema)
lib/ai/mock.ts     → mockTutorAnswer (keyword match on qa[]) + mockGeneratedBook
```

Providers implement one interface (`AIProvider`): `available()`, `models()`,
`chatStream()`, `complete()`.

## API plumbing (`lib/http.ts`)

`route(name, [options], handler)` returns a Next route handler that:

- generates / propagates `x-request-id`, exposes `ctx.params` for `[slug]` routes
- builds a request-scoped logger (`log.child({ route, requestId })`)
- applies `options.limit` rate rules per client IP before the handler runs
  (429 + `Retry-After` on exceed) — see `lib/rate-limit.ts`
- gives the handler `ctx.json(data)` for success responses
- catches `ApiError`, `ZodError`, and unknown errors → one envelope:
  `{ error: { code, message, requestId, details? } }` with the right status
- logs `request.ok` / `request.rejected` / `request.error` with timing; forwards
  5xx (not 501) to `reportError` in `lib/observability.ts`

## Rate limiting (`lib/rate-limit.ts`)

Fixed-window, per-IP, in-memory (state on `globalThis` so it's shared across
Next's per-route bundles — but still per serverless instance). `/api/generate`
and `/api/chat` each carry a burst limit and a daily cap, all env-tunable.
`RATE_LIMIT_DISABLED=1` bypasses it for local dev and the e2e suite. A shared
Upstash-backed store is a documented "Ready" card for multi-instance deploys.

## Observability (`lib/observability.ts` + `instrumentation.ts`)

`reportError(err, ctx)` and `track(event, props)` — both log to stdout always and
call a registered sink if one exists. `instrumentation.ts` (Next's startup hook)
is where you `setErrorSink` (Sentry) / `setEventSink` (PostHog). Client-side,
`components/Analytics.tsx` loads Plausible when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is
set and `lib/analytics.ts` `track()` fires the funnel events (search → summon →
open-book → tutor).

## Admin (`lib/admin.ts`)

`ADMIN_EMAILS` (comma-separated) is the entire admin model. `requireAdmin()`
throws `ApiError` unless the caller is a signed-in email on the list;
`isAdminUser()` is the soft version for UI gating. Gates `DELETE /api/books/[slug]`.

## Domain validation (`lib/schemas.ts`)

- `GenerateInput`, `ChatInput` — request bodies.
- `normalizeGeneratedBook(raw, slug)` — turns untrusted model JSON into a valid
  `Book`: every field has a fallback, strings and arrays are length-clamped, and
  `repairMindMap` guarantees exactly one root with only valid parent references.
  Zod v4 note: `z.unknown().transform()` requires the key to be present — use
  `.optional()` first (see the `str`/`strArray` helpers).

## State management

| State | Mechanism |
|---|---|
| Book data | RSC + `lib/store.ts`, passed as props |
| Shelf | `useSyncExternalStore` — localStorage when signed out, a per-user `shelves` row when signed in; local items merge into the account once on first sign-in. `useShelf()` API is identical either way. |
| Search / chat / UI | `useState` in the relevant client component |
| AI status | `useEffect` poll of `/api/health` (15s) |
| Route progress | `usePathname` + a document click listener (`components/fx/RouteProgress.tsx`) |

No external state library.

## Rendering strategy

| Route | Strategy |
|---|---|
| `/` | `force-dynamic` (library reflects the live DB) |
| `/book/[slug]` (seed) | SSG via `generateStaticParams`; per-book OG image |
| `/book/[slug]` (generated) | on-demand (`dynamicParams`) |
| `/shelf` `/compare` `/account` | client / dynamic |
| `/api/*` | dynamic, `nodejs` runtime |
| `/sitemap.xml` | dynamic + `revalidate: 3600` |

Note: `app/book/[slug]/page.tsx` calls `isAdminUser()` (which reads cookies) only
for non-seed slugs, so seed book pages stay statically generated.

## Auth (`proxy.ts` + `lib/supabase/`)

`proxy.ts` (Next 16's renamed `middleware.ts`) refreshes the Supabase session on
every request, **time-boxed to 2s** so a dead Supabase can't stall routing.
Clients: `lib/supabase/client.ts` (browser), `server.ts` (RSC, request cookies),
`admin.ts` (service-role, server-only — never import into client code).
