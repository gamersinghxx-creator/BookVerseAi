# Contributing to BookVerse AI

## Setup

```bash
npm install
npx playwright install chromium   # once, for e2e
cp .env.example .env.local        # optional — the app runs without it
npm run dev                        # http://localhost:3000
```

Requires **Node 22+** (for `node:sqlite`; older Node falls back to a JSON file cache).

## The commands

| Command | What |
|---|---|
| `npm run dev` | dev server (Turbopack) |
| `npm run build` / `npm start` | production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint 9 flat config |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (builds + serves on :3100) |
| `npm run eval` | generation-quality eval — real API calls, run when tuning the prompt |
| `npm run check` | typecheck + lint + unit — **must pass before a PR** |

## Conventions

Read `docs/PROJECT_BIBLE.md §12` and `docs/ARCHITECTURE.md` first. The short version:

- **Server Components by default.** Add `"use client"` only for interactivity,
  browser APIs, or Framer Motion.
- **Never import a data source into a component.** All data goes through
  `lib/store.ts`. This is the one rule.
- **Design tokens, not arbitrary values.** Use the type scale (`text-lead`,
  `text-h2`, …) and colour tokens (`text-ink-soft`, `bg-paper`, …). No `text-[17px]`,
  no raw hex in components.
- **Entrance animations are transform-only.** Content must be visible and readable
  even if the animation never runs (throttled tab, slow device, crawler). Use the
  variants in `lib/motion.ts`.
- **API routes:** always `route(name, handler)` from `lib/http.ts` + a zod schema.
  Never return a bare string error — the envelope is `{ error: { code, message, requestId } }`.
- **Logging:** `import { log } from "@/lib/log"`. Never `console.*` in app code.
  Never put secrets in log `meta`.
- **External dependencies** must be time-boxed and have a fallback (Principle #5).
  See `lib/resilience.ts`.
- Named exports. PascalCase components, camelCase utilities, kebab-case routes.

## Common tasks

### Add a seed book

Add a `Book` object to `lib/books.ts`. The slug becomes the route; it's picked up
by `generateStaticParams`, the sitemap, search, compare, and recommendations
automatically. Public-domain only (Principle #1).

### Add a section to the book page

1. Build the component in `components/book/`, taking `accentRgb` for colour.
2. Add a `<Section>` in `app/book/[slug]/page.tsx`, guarded by
   `{book.<field>.length > 0 && …}` so it hides for sparse books.
3. If the field is new, add it to `lib/types.ts` **and** to
   `normalizeGeneratedBook` in `lib/schemas.ts` with a fallback, **and** to the
   generation prompt in `lib/ai/prompts.ts`.

### Add an AI provider

Most providers speak the OpenAI chat API — add a preset to `cloudPresets` in
`lib/ai/config.ts`. For something exotic, implement the `AIProvider` interface
(`lib/ai/types.ts`) and wire it into `getProvider()` / `getStatus()`.

### Add an API route

`export const GET = route("name", async (req, ctx) => { … ctx.json(data) })`.
Validate the body with `parseJson(req, SomeSchema)`. Add a test. If it calls a
paid service, add a rate-limit rule: `route("name", { limit: MY_LIMITS }, …)`.
For `[slug]` routes, the slug is in `ctx.params.slug`.

### Wire error tracking / analytics

Nothing is required. To add Sentry, register a sink in `instrumentation.ts`
(`setErrorSink(...)`); server errors already flow through `reportError`. For
product analytics, set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — `lib/analytics.ts`
`track()` is already called on the key funnel events.

## Tests

- **Unit** (`tests/unit/`) — pure logic: schemas, resilience, `lib/` utilities.
- **E2E** (`tests/e2e/`) — user flows, run against a production build on desktop
  and mobile viewports. Prefer role-based locators; scope to a region when a
  label repeats.

Every new API route needs a test. Every new screen needs an e2e that it renders.

## Pull requests

- `npm run check` green locally; CI (typecheck · lint · unit · build · e2e) green.
- Docs updated in the same PR — `docs/CHANGELOG.md` always, the bible's decisions
  log for anything architectural, `docs/BOARD.md` if it closes a card.
- Keep the diff focused. One concern per PR.
