# 📖 BookVerse AI — Project Bible

> The single source of truth for BookVerse AI: vision, principles, architecture,
> data model, design system, conventions, and roadmap. Update it whenever scope,
> architecture, or conventions change.
>
> **Last updated:** 2026-09-08 (post-rebuild). Supersedes the former
> `BookVerse_AI_Project_Bible.md`, `BookVerse_AI_Project_Report.md`, and
> `docs/PROJECT_HANDOFF.md`.

---

## 1. Vision & mission

**"Step inside any book."**

An immersive, AI-powered web app where a reader enters a book title and receives
a *living study guide* — a structured summary, chapter breakdown, key lessons, a
timeline, a radial mind map, a character map (for fiction), conceptual sketches,
and a book-grounded AI tutor. The goal is to help people **understand a book
quickly — an invitation to read it, never a replacement.**

The experience should be:

- **Beautiful** enough to inspire curiosity
- **Intelligent** enough to teach effectively
- **Affordable** enough to run at near-zero cost
- **Ethical** enough to send people to the originals

## 2. Principles (non-negotiable)

| # | Principle | Meaning |
|---|---|---|
| 1 | **Transformative, not reproductive** | Summaries paraphrase and teach; they never reproduce copyrighted text. Prefer public-domain works. Always attribute and encourage reading the original. |
| 2 | **Generate once, serve forever** | Every AI generation is cached permanently. Repeat requests are instant and free. |
| 3 | **Premium, calm UI** | Warm, luminous, motion-rich but never noisy. Every pixel intentional. |
| 4 | **Educational & visual** | Favour timelines, maps and graphs over walls of text. |
| 5 | **Graceful degradation** | The app works fully with no database, no AI provider, and no network. Every external dependency is time-boxed and falls back. |
| 6 | **Component ↔ data boundary** | Components never know where data comes from. The seam lives entirely in `lib/`. |
| 7 | **Content is never gated behind motion** | Entrance animations enhance; content is visible and readable even if the animation never runs. |

## 3. Target users

Students · professionals · entrepreneurs · casual readers · book clubs · educators.

## 4. Feature scope

### Shipped

| Feature | Where |
|---|---|
| Living search — type a title, get suggestions or summon it | `components/LivingSearch.tsx` |
| Rich book pages — up to 9 content sections | `app/book/[slug]/` |
| Generate any book (cache-first) | `app/api/generate/route.ts` |
| Book-grounded AI tutor (streaming, stop, retry) | `components/book/AITutor.tsx` |
| Timeline · radial mind map · character map · conceptual sketches | `components/book/*` |
| My Shelf — local, syncs to the account when signed in | `lib/shelf.ts`, `app/shelf/` |
| Compare two books side by side (seed + generated) | `app/compare/` |
| Recently summoned rail | `components/RecentlySummoned.tsx` |
| Live AI status badge (honest — verifies the model) | `components/AIStatus.tsx` |
| Scroll-driven landing narrative + closing CTA | `components/Story.tsx`, `components/home/ClosingCta.tsx` |
| SEO + PWA — sitemap, robots, manifest, OG images | `app/{sitemap,robots,manifest,opengraph-image,icon}` |
| Structured logging + typed API error envelope | `lib/log.ts`, `lib/http.ts` |
| Resilience layer — timeout + circuit breaker | `lib/resilience.ts` |
| Rate limiting on the paid AI endpoints | `lib/rate-limit.ts` |
| Observability seam — error + event sinks (no-op without config) | `lib/observability.ts`, `instrumentation.ts` |
| Account management — settings + delete account | `app/account/`, `app/api/account/route.ts` |
| Regenerate / report / admin-delete a generated guide | `components/book/GuideActions.tsx`, `app/api/books/[slug]/` |
| Ranked library search | `lib/search.ts` |

### Future (see `docs/BOARD.md`)

Real image generation (SDXL / FLUX / ComfyUI) · audio narration · ML
recommendations · gamification · classroom edition · community.

## 5. Architecture

### System flow

```
User enters a title
        │
        ▼
   getBookBySlug(slug)
        │
  ┌─ seed library? ──── yes ──► return (instant, from code)
  │
  no
  │
  ▼
  generated cache?  (Supabase → SQLite → JSON file, each time-boxed)
  │                            │
  yes ──► return               no
                                │
                                ▼
                       POST /api/generate
                          │
                 provider reachable?   (getProvider — Groq/OpenAI/Ollama)
                   │                        │
                  yes                      no
                   │                        │
       model → JSON → normalize      grounded mock preview
       (lib/schemas normalizeGeneratedBook)     │
                   │                        │
                   └──────► saveGeneratedBook  ("generate once")
                                  │
                                  ▼
                          render rich book page
```

### Layers

```
┌───────────────────────────────────────────────┐
│  UI          app/ (routes) + components/       │
│              RSC by default; client islands    │
│              components/ui/ = design primitives │
├───────────────────────────────────────────────┤
│  API         app/api/*  — every route wrapped   │
│              in lib/http.ts route(): request id,│
│              structured log, zod, error envelope│
├───────────────────────────────────────────────┤
│  Data        lib/store.ts — the only seam.      │
│              Supabase → SQLite → file, each      │
│              behind lib/resilience.ts attempt()  │
├───────────────────────────────────────────────┤
│  AI          lib/ai/ — provider selection,       │
│              streaming, prompts, mock fallback   │
│  Domain      lib/schemas.ts — zod validation +   │
│              tolerant Book normalisation         │
├───────────────────────────────────────────────┤
│  External    Supabase (opt) · Groq/OpenAI/Ollama │
│              (opt) · ComfyUI (future)            │
└───────────────────────────────────────────────┘
```

### Key decisions

- **Next.js API routes are the backend.** A separate .NET service is documented
  in `docs/BACKEND_AND_AUTH.md §2` as an option, not a requirement.
- **The `lib/store.ts` seam.** Persistence order: Supabase (when
  `SUPABASE_SERVICE_ROLE_KEY` is set) → embedded SQLite (`node:sqlite`, Node 22+)
  → per-slug JSON files. Every remote call goes through `attempt()` — a 2.5–3s
  timeout plus a process-global circuit breaker, so a dead hosted DB costs one
  timeout per 30s cooldown, never one per request.
- **Seed library lives in code** (`lib/books.ts`), always merged in by
  `lib/store.ts`. Seed books resolve instantly regardless of backend health.
- **SSG for seed book pages**, on-demand for generated ones (`dynamicParams`).
- **404 correctness:** `notFound()` streams HTTP 200 when a Suspense boundary
  (`loading.tsx`) wraps the route — a documented Next limitation. Resolved by
  removing the global `app/loading.tsx` (replaced by `components/fx/RouteProgress.tsx`)
  and doing the existence check in `app/book/[slug]/layout.tsx`, above the
  segment's `loading.tsx`. A `RouteProgress` bar covers navigation feedback.

## 6. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack) | `proxy.ts` (formerly `middleware.ts`) refreshes the Supabase session, time-boxed |
| UI | React 18, TypeScript 5 (strict) | RSC by default |
| Styling | Tailwind CSS 3 | Full token layer in `tailwind.config.ts` |
| Animation | Framer Motion 11 | Shared language in `lib/motion.ts`; transform-only entrances |
| Icons | lucide-react | |
| Fonts | Fraunces / Space Grotesk / Inter via `next/font/google` | self-hosted, no external request |
| DB (dev / self-host) | `node:sqlite` | zero-dep, auto-seeds |
| DB (hosted) | Supabase Postgres | env-gated, optional |
| Auth | Supabase Auth (magic link + Google) | env-gated, optional |
| AI (prod) | Groq / OpenAI / Gemini via one OpenAI-compatible provider | default model `openai/gpt-oss-120b` |
| AI (local) | Ollama | `AI_PROVIDER=ollama` |
| AI (fallback) | grounded mock | always available |
| Validation | zod 4 | API inputs + AI output normalisation |
| Tests | Vitest (unit) + Playwright (e2e) | `npm run check`, `npm run test:e2e` |
| CI | GitHub Actions | typecheck · lint · unit · build · e2e |
| Hosting | Vercel + Supabase | see `DEPLOY.md` |

## 7. Repository layout

```
app/
  layout.tsx              root layout — fonts, Nav, Footer, FX, RouteProgress
  page.tsx                home — Hero → Library → Story → RecentlySummoned → ClosingCta
  globals.css             token mirror + CSS primitives
  error.tsx               global error boundary (logs)
  not-found.tsx           404
  book/[slug]/
    layout.tsx            existence check → real 404
    _data.ts             request-deduped loadBook (React cache)
    page.tsx             rich book page (sections render only when populated)
    loading.tsx           skeleton
    error.tsx             per-book error boundary (logs)
  compare/ shelf/         client screens
  auth/callback/          OAuth / magic-link exchange
  api/
    generate  chat  books  library  health   — all via lib/http.ts route()
  api/  ... generate  chat  books  books/[slug]  books/[slug]/report
             library  health  account
  account/               settings + delete-account (client)
  {sitemap,robots,manifest,icon,opengraph-image}
instrumentation.ts        startup hook — wire Sentry / analytics sinks here
components/
  ui/                     Button, Card, Pill, Eyebrow, IconTile, SectionHeading
  Analytics.tsx           Plausible loader (env-gated)
  account/AccountClient.tsx
  home/ClosingCta.tsx
  compare/CompareClient.tsx
  book/                   BookHeader, Section, Timeline, MindMap, CharacterMap,
                          Sketches, AITutor, Related, GuideActions
  fx/                     LiquidLight, Cursor, Reveal, RouteProgress
  Hero, Library, BookOrb, Story, Nav, Footer, AIStatus, AuthButton,
  LivingSearch, ShelfButton, RecentlySummoned
lib/
  types.ts               Book domain model (the contract)
  books.ts               seed library (10 public-domain titles)
  store.ts               the persistence seam
  store.supabase.ts      Supabase adapter (aborts + throws)
  db.ts                  node:sqlite adapter
  shelf.ts               localStorage ↔ Supabase shelf (one hook)
  schemas.ts             zod: API inputs + normalizeGeneratedBook
  http.ts                route() wrapper (id, log, rate limit, envelope)
  log.ts                 structured JSON logger
  observability.ts       reportError / track — sinks are pluggable
  rate-limit.ts          per-IP fixed-window limiter
  resilience.ts          withTimeout + circuit breaker + attempt()
  search.ts              ranked library search
  markdown.tsx           safe markdown → React nodes (tutor answers)
  admin.ts               ADMIN_EMAILS allowlist
  analytics.ts           client-side track()
  motion.ts              shared Framer variants / easings
  cn.ts  accents.ts  related.ts
  ai/                    config, index (provider + status), ollama,
                         openai-compat, prompts, mock, types
  supabase/              env, client, server, admin
supabase/schema.sql
tests/  unit/ (Vitest)  e2e/ (Playwright)  eval/ (generation quality)
docs/  PROJECT_BIBLE.md  ARCHITECTURE.md  BOARD.md  BACKEND_AND_AUTH.md  CHANGELOG.md
```

## 8. Data model

`lib/types.ts` — the `Book` type is the contract between the UI and every data
source. It is deliberately the exact shape a generation backend returns.

| Field | Type | Notes |
|---|---|---|
| `slug` `title` `author` `year` | string | |
| `category` | `"fiction" \| "non-fiction"` | drives which sections show |
| `tags` | string[] | search + recommendations |
| `cover` | `{ emoji }` | colour comes from the per-book accent, not stored |
| `tagline` `readingTime` | string | |
| `rating` | number | 0–5 |
| `cached` | boolean | surfaced in the header |
| `overview` | string | |
| `summary` | string[] | |
| `chapters` | `{ number, title, summary }[]` | |
| `lessons` | `{ title, detail }[]` | |
| `timeline` | `{ label, title, detail }[]` | |
| `characters` | `Character[]` | `[]` for non-fiction |
| `mindMap` | `{ id, label, parent }[]` | exactly one `parent: null` root (enforced by the normaliser) |
| `sketches` | `{ caption, emoji }[]` | |
| `qa` | `{ q, a }[]` | tutor grounding + suggested questions |

Untrusted model output is coerced to a valid `Book` by
`normalizeGeneratedBook` in `lib/schemas.ts`: every field has a fallback, arrays
and strings are length-clamped, and the mind map is repaired to a single valid
tree.

## 9. Design system — "Liquid Light"

A warm-white "paper" world where colour behaves like living ink. **One palette,
light only — deliberately not a dark theme.**

### Tokens (`tailwind.config.ts` + `globals.css`)

- **Colour:** `paper` / `paper-soft` / `paper-deep`; `ink` / `ink-soft` /
  `ink-faint` (all AA on paper) / `ink-hush` (decorative only). Five living inks —
  `sky` `crimson` `leaf` `amber` `iris` — each with a `.ink` shade dark enough
  for text and a `.soft` tint.
- **Type scale:** `eyebrow` `label` `body-sm` `body` `lead` `h3` `h2` `display`
  `hero`, each with paired line-height and tracking. No arbitrary `text-[clamp()]`.
- **Spacing / radii / elevation:** `section-y`, `gutter`, `rounded-card/panel/field`,
  `shadow-card/float/pop/focus`.
- **Motion:** `ease-out-expo`, `duration-fast/slow`; shared variants in `lib/motion.ts`.
- Per-book accent from `lib/accents.ts` (hash of the slug → one of the five inks),
  applied to the header, section icons, timeline, mind map and character map.

### Primitives

- CSS: `.card` `.glass` `.btn-primary` `.btn-ghost` `.pill` `.eyebrow` `.display`
  `.ink-gradient` `.link-underline` `.u-container` (all token-based).
- React (`components/ui/`): `Button` (primary/ghost/subtle, polymorphic — renders
  `<Link>`, `<a>`, or `<button>`), `Card`, `Pill`, `Eyebrow`, `IconTile`,
  `SectionHeading`.

### Signature effects

- `LiquidLight` — GPU-light Canvas 2D field of multiply-blended ink blooms,
  breathing, cursor-reactive. DPR capped at 1.5, pauses when the tab is hidden,
  one static frame under reduced motion.
- `Cursor` — trailing multiply-blend glow. Disabled on touch **and** reduced
  motion (so the native cursor is never hidden without a replacement).
- `.grain` — SVG paper texture.

### Accessibility

- Global `:focus-visible` ring. Skip-to-content link.
- `prefers-reduced-motion`: Framer entrances are transform-only (content stays
  visible), the CSS block collapses transitions, `LiquidLight` renders one frame,
  `Cursor` bails.
- Semantic HTML: `<ol>`/`<ul>` for lists, one `<h1>` per page, `aria-hidden` on
  decoration, `aria-live` on the streaming tutor, real labels on every control.
- Body text meets WCAG AA on paper.

## 10. API contract

Every route is wrapped by `route(name, [options], handler)` in `lib/http.ts`:
a request id (echoed as `x-request-id`), a request-scoped structured logger,
optional per-IP rate limiting, one error envelope —
`{ error: { code, message, requestId } }` — and 5xx errors forwarded to the
observability sink.

| Method | Route | Body / query | Response | Limits |
|---|---|---|---|---|
| `POST` | `/api/generate` | `{ title, force? }` (`GenerateInput`) | `{ book, slug, source }` | 5/min, 60/day per IP |
| `POST` | `/api/chat` | `{ slug, messages[] }` (`ChatInput`) | `text/plain` stream; `X-AI-Provider` | 20/min, 400/day |
| `GET` | `/api/books` | — | `{ books: BookSummary[] }` (generated only) | — |
| `DELETE` | `/api/books/[slug]` | — | `{ ok, slug }` | admin only (`ADMIN_EMAILS`) |
| `POST` | `/api/books/[slug]/report` | `{ reason, note? }` | `{ ok }` | 5/min |
| `GET` | `/api/library` | `?q=&limit=` | `{ books: [...] }` (ranked, seed + generated) | — |
| `GET` | `/api/health` | — | `{ provider, available, model, modelReady, verified }` | — |
| `DELETE` | `/api/account` | — | `{ ok }` | signed-in user; deletes self |

429 responses carry `Retry-After`. `RATE_LIMIT_DISABLED=1` bypasses limits
(local dev / tests).

## 11. Environment variables

See `.env.example` (authoritative). Everything is optional — with nothing set the
app runs on the offline mock AI, embedded SQLite, and a localStorage shelf.

- `AI_PROVIDER` = `ollama` (default) · `groq` · `gemini` · `openai` · `openai-compat` · `mock`
- Provider keys: `GROQ_API_KEY` / `GEMINI_API_KEY` / `OPENAI_API_KEY`, optional `*_MODEL`
- `OLLAMA_BASE_URL` `OLLAMA_MODEL` `AI_PROBE_TIMEOUT_MS`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL` `NEXT_PUBLIC_SUPABASE_ANON_KEY` `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` — comma-separated; who can delete generated guides (no admin without it)
- `LOG_LEVEL` = `debug` | `info` | `warn` | `error`
- `RATE_LIMIT_{GENERATE,CHAT}_PER_{MIN,DAY}`, `RATE_LIMIT_DISABLED`
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_PLAUSIBLE_SRC` — optional client analytics

## 12. Conventions

- **RSC by default;** add `"use client"` only for interactivity / browser APIs / Framer Motion.
- **Path alias** `@/*` → repo root.
- **Data boundary:** components never import a data source — everything through `lib/`.
- **Design tokens over arbitraries:** use the type scale and colour tokens, not `text-[..]` / hex.
- **Motion:** entrance animations are transform-only (Principle #7). Use `lib/motion.ts`.
- **API routes:** always `route()` + zod. Never return a bare string error.
- **Logging:** `lib/log.ts`, never `console.*` directly in app code; never log secrets.
- Named exports preferred. PascalCase components, camelCase utils, kebab-case routes.
- `npm run check` (typecheck + lint + unit) must pass before a PR.

## 13. Testing

- **Unit (Vitest, `tests/unit/`):** resilience (timeout, breaker), `normalizeGeneratedBook`
  (malformed input, multi-root mind map, clamping), API schemas, `slugify`,
  `relatedBooks`, `mockTutorAnswer`, `extractJson`.
- **E2E (Playwright, `tests/e2e/`, desktop + mobile):** core pages, real 404,
  API error envelope, health shape, living search → navigate, shelf add/remove,
  reduced-motion cursor, the journey + CTA, tutor answering, route progress.
- CI runs all of it on every push / PR.

## 14. Performance budget

| Metric | Target |
|---|---|
| Home / book First Load JS | < 150 kB |
| Canvas DPR | ≤ 1.5, pauses when hidden |
| Repeat book request | cache hit, < 50 ms |
| Dead external service | ≤ 2 slow requests per 30 s, never per-request |
| Lighthouse (mobile) perf / a11y | ≥ 90 |

## 15. Legal posture

Public-domain seed library (10 titles: The Art of War, Meditations, Pride and
Prejudice, Frankenstein, The Prince, Tao Te Ching, Walden, The Republic,
Narrative of the Life of Frederick Douglass, Dracula). Summaries are
transformative and educational — they paraphrase, analyse and teach; they do not
reproduce the text. Every book page and the landing CTA restate this and point to
the original. User-generated guides work the same way and carry a "freshly
painted" / "generated" indicator; a `report` control flags a bad one, and an
admin (`ADMIN_EMAILS`) can delete it.

## 16. Cost strategy

Target ₹0–₹2,000 for the MVP. Local/mock AI is free; hosted generation (Groq) is
cents per book and **cached forever**, so cost amortises to ~zero. SQLite for
dev/self-host; Supabase + Vercel free tiers for hosted.

## 17. Decisions log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-06 | Frontend MVP with mock data first; `Book` type mirrors the future API | validate UX before wiring AI |
| 2026-07-06 | "Liquid Light" warm-white design system | differentiate from dark-theme competitors |
| 2026-07-06 | Ollama + mock fallback; `node:sqlite` + file fallback | zero-cost, always-works |
| 2026-07-09 | Supabase (Postgres + Auth + synced shelf), env-gated | durable hosted persistence |
| 2026-07-09 | One OpenAI-compatible provider for Groq/Gemini/OpenAI | switch provider with one env var |
| 2026-09-08 | **Rebuild**: resilience layer, honest AI status, `proxy.ts`, `next/font`, token layer, `lib/http.ts` + zod, Vitest + Playwright + CI, transform-only motion, real 404s | production-readiness pass — see `docs/CHANGELOG.md` |
| 2026-09-08 | Default Groq model → `openai/gpt-oss-120b` | `llama-3.3-70b-versatile` was decommissioned |
| 2026-09-08 | Light-only; no dark theme | commit to the single distinctive identity |
| 2026-09-08 | **Hardening**: rate limiting, observability seam, account deletion, regenerate/report/admin-delete, ranked search, tutor markdown + persistence, seed library 4→10, Lighthouse CI, eval harness | close the launch-readiness gaps in `docs/BOARD.md` |
| 2026-09-08 | Rate limiter is in-memory, per-instance | good enough for a single instance; Upstash is a documented "Ready" card for multi-instance |
| 2026-09-08 | `lib/ai` uses relative imports, not `@/lib` | so the eval harness and any Node script can import the AI layer directly |

## 18. Risks & mitigations

| Risk | Mitigation |
|---|---|
| AI generates an inaccurate summary | prompt grounded in the book; disclaimers; "generated" indicator; encourage originals |
| A provider model is decommissioned | `getStatus()` verifies the model via `/models`; badge shows "Model unavailable"; `*_MODEL` env override |
| Hosted DB down / paused | `attempt()` timeout + circuit breaker → instant fallback to SQLite/file |
| SQLite doesn't persist on serverless | Supabase adapter auto-selected in hosted prod |
| Copyright | public-domain seed; transformative summaries; attribution |
| Low-end device / throttled tab | transform-only entrances; DPR cap; reduced-motion paths |

## 19. Long-term vision

The most visually engaging book-knowledge platform — knowledge made *spatial*,
learning made *beautiful*, access made *democratic*, and reading *encouraged*.
BookVerse AI is an invitation to read deeper.
