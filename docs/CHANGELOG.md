# Changelog

## Rebuild — 2026-09-08

A production-readiness pass across the whole project. Delivered in six stages.

### Stage 1 — P0 fixes

- **Resilience layer** (`lib/resilience.ts`): `withTimeout` + a process-global
  circuit breaker. `lib/store.ts` routes every Supabase call through it. A dead
  hosted DB went from a **7s hang on every request** to ~2 slow requests per 30s.
- **Honest AI status**: `getStatus()` verifies the configured model against the
  provider's `/models` endpoint (30s cache). The nav badge now shows "Model
  unavailable" instead of a false green "AI live".
- Groq default model `llama-3.3-70b-versatile` (decommissioned) → `openai/gpt-oss-120b`.
- `middleware.ts` → `proxy.ts` (Next 16); session refresh time-boxed to 2s.
- Reduced-motion cursor bug fixed (desktop + reduced-motion had no visible cursor).
- Removed committed junk (`_write_test.txt`, `tsconfig.tsbuildinfo`); added `.gitattributes`.
- `lib/log.ts` structured logger.
- Scrubbed live secrets from `.env.local`.

### Stage 2 — architecture, API contracts, tests, CI

- **`lib/http.ts`** `route()` wrapper: request id, scoped logger, zod validation
  (`parseJson`), one error envelope `{ error: { code, message, requestId } }`.
  All five API routes rewired.
- **`lib/schemas.ts`**: `GenerateInput`/`ChatInput` + a rewritten
  `normalizeGeneratedBook` that repairs multi-root / dangling-parent mind maps
  and clamps all sizes.
- Unified seed + generated books everywhere (`related.ts`, `Related`, `/compare`,
  `sitemap.ts`). `RecentlySummoned` wired into the home page.
- Deleted 4 dead stub components. Removed `dbAll` (unused).
- ESLint 9 flat config (`next lint` was removed in Next 16). Scripts: `typecheck`,
  `test`, `test:e2e`, `check`.
- Vitest (`tests/unit/`, 26 tests) + Playwright (`tests/e2e/`, desktop + mobile).
- `.github/workflows/ci.yml` — typecheck · lint · unit · build · e2e.
- `next` 16.2.10 → 16.3.4 (`npm audit fix` — closed a Turbopack proxy-bypass
  advisory; 0 vulnerabilities).
- **Real 404s**: `notFound()` was streaming HTTP 200 because the global
  `app/loading.tsx` wrapped every route in Suspense. Removed it; the book
  existence check moved to `app/book/[slug]/layout.tsx`.
- Hero `<h1>` had no spaces in its DOM text ("Stepinsideanybook.") — added an
  `sr-only` real heading.

### Stage 3 — design system foundation

- Full token layer in `tailwind.config.ts` + `globals.css`: semantic type scale,
  spacing, radii, elevation, motion tokens.
- **Contrast fix**: `ink-faint` (#8A7C74, ~3.8:1 on paper — failed AA) → #6B5C54.
- `next/font/google` self-hosts Fraunces / Space Grotesk / Inter.
- `lib/motion.ts` motion system. **Content is never gated behind a JS animation**
  — `fadeUp` and the critical components are transform-only, so the hero
  headline, book-header emoji, and sections stay visible if the animation clock
  stalls.
- `components/ui/` primitives: `Button`, `Card`, `Pill`, `Eyebrow`, `IconTile`,
  `SectionHeading`.
- Removed the dead `tone` field (`"from-plum-500 to-gold-500"` — `plum`/`gold`
  never existed in the palette) from the `Sketch` and `Book.cover` types and all
  call sites. `MindMap` is now accent-driven.

### Stage 4 — landing page rebuild

- Hero parallax rewritten with `useMotionValue`/`useSpring` (was `setState` on
  every mousemove); added a benefits strip.
- `Story` ("The journey") rebuilt as a scroll-driven narrative — each act scales
  and lifts as it enters the reading zone.
- New closing CTA section (`components/home/ClosingCta.tsx`).
- `Footer` gained nav links. `LivingSearch` gained a `label` prop.

### Stage 5 — inner product redesign

- Book page: token pass; sections render only when populated.
- `AITutor` rewritten: stop button (`AbortController`), retry-on-error, `aria-live`.
- `Timeline` (→ `<ol>`), `CharacterMap` (dangling-connection guard), `Sketches`,
  shelf (→ `<ul>`), compare, 404 / error pages — all on the design system.
- New `components/fx/RouteProgress.tsx` — thin top progress bar for navigation.

### Stage 6 — docs, board, license

- Consolidated three overlapping bibles into one `docs/PROJECT_BIBLE.md`.
- New `docs/ARCHITECTURE.md`, `docs/BOARD.md`, `CONTRIBUTING.md`, `docs/CHANGELOG.md`.
- Rewrote `README.md`; `.env.example` made authoritative.
- Added `LICENSE`.

### Test / build status at end of the 6-stage rebuild

`npm run check` (typecheck + lint + 26 unit tests) green · `npm run build` green ·
`npx playwright test` 24/24 (desktop + mobile) · 0 npm vulnerabilities.

---

## Post-rebuild hardening — 2026-09-08

Filling the launch-readiness gaps identified in `docs/BOARD.md`.

### Launch safety

- **Rate limiting** (`lib/rate-limit.ts`): fixed-window limiter, per client IP,
  applied to `/api/generate` (5/min, 60/day) and `/api/chat` (20/min, 400/day) —
  all tunable via env. Wired into `lib/http.ts route()` as a `limit` option;
  429 responses carry `Retry-After`. `RATE_LIMIT_DISABLED=1` for local/tests.
- **Observability seam** (`lib/observability.ts`): `reportError` + `track`, both
  no-ops until a sink is registered in `instrumentation.ts` (Sentry / PostHog
  drop-in). 5xx route errors auto-forward. Client analytics via
  `components/Analytics.tsx` + `lib/analytics.ts` (Plausible, env-gated) — the
  search → summon → open-book funnel is instrumented.
- 501 "feature not configured" responses no longer page as errors.

### Accounts & content lifecycle

- **Account management** (`/account`): view email, sign out, and **delete
  account** (typed confirmation → `DELETE /api/account` via the service-role
  admin client; `shelves` rows cascade). Linked from the nav menu.
- **Regenerate a poor guide**: `POST /api/generate` accepts `force: true` (busts
  the cache for generated books only, never seed books).
- **Report a bad guide**: `POST /api/books/[slug]/report` (rate-limited) — logged
  + tracked for review.
- **Admin delete**: `DELETE /api/books/[slug]` gated by an `ADMIN_EMAILS`
  allowlist (`lib/admin.ts`). `components/book/GuideActions.tsx` surfaces
  regenerate / report / (admin) delete on generated book pages.

### Content

- Seed library **4 → 10** books: added The Prince, Tao Te Ching, Walden, The
  Republic, Narrative of the Life of Frederick Douglass, Dracula — full
  hand-written transformative guides, all public-domain.

### Product polish

- **Ranked search** (`lib/search.ts`): exact title > prefix > word-boundary >
  author > tag > substring, ties broken on rating. Replaces `includes()` in
  `searchAllBooks`; `/api/library` gained a `limit` param.
- **Tutor markdown** (`lib/markdown.tsx`): safe React-node renderer (no
  `dangerouslySetInnerHTML`) for bold / italic / code / lists in answers.
- **Tutor persistence**: the conversation is saved per book in localStorage,
  with a clear-conversation button.
- **Compare deep-linking**: `?a=slug&b=slug` in the URL, restored on load,
  making a comparison shareable.
- **Per-book OG images**: `app/book/[slug]/opengraph-image.tsx` — title, author,
  accent colour.

### Tooling

- Lighthouse CI budget (`.lighthouserc.json` + a `lighthouse` job via
  `treosh/lighthouse-ci-action`, kept out of local deps). a11y ≥ 0.95 fails the
  build; perf ≥ 0.85 warns.
- **Generation eval harness** (`tests/eval/`, `npm run eval`): scores real
  generations on structure completeness + an accuracy spot-check against a set
  of known books. Manual — makes real API calls.
- +15 unit tests (rate-limit, search, markdown), +11 e2e (account, guide
  actions, compare deep-link, search ranking).

### Status

`npm run check` (41 unit) green · `npm run build` green · `npx playwright test`
40/40 · 0 npm vulnerabilities.
