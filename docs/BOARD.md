# Project Board

Columns: **Backlog → Discovery → Ready → In Progress → Review → QA → Done**
Priority: **P0** security / data-loss / app-breaking · **P1** broken core workflow
or architecture · **P2** UX / performance / maintainability · **P3** polish /
nice-to-have.

A card is **Ready** only when it has an acceptance criterion. It reaches **Done**
only when the criterion is met *and* `npm run check` + e2e are green.

_Last updated: 2026-09-08 (post-hardening)._

---

## Done

See `docs/CHANGELOG.md` for detail. The 6-stage rebuild plus the post-rebuild
hardening pass.

| P | Card | Acceptance — met |
|---|---|---|
| P0 | Dead external service can't hang the app | every route < 500 ms with no external services; dead Supabase ≤ 2 slow requests / 30 s |
| P0 | "Summon a book" produces a real guide; honest AI badge | real AI `Book` returned; badge reads "Model unavailable" when the model is gone |
| P0 | Real HTTP 404 for unknown book slugs | `curl -I /book/nope` → `404` |
| P0 | **Rate limiting on the paid AI endpoints** | `/api/generate` + `/api/chat` return 429 + `Retry-After` past the per-IP limit; env-tunable; unit-tested |
| P0 | `middleware.ts` → `proxy.ts`; live secrets scrubbed | build clean; `.env.local` has placeholders |
| P1 | Provider-agnostic persistence + resilience | one `attempt()`-guarded chain; fallback unit-tested |
| P1 | API error envelope + zod + request ids | every route returns `{ error: { code, message, requestId } }` |
| P1 | Unify seed + generated books | compare, related, sitemap all include generated books |
| P1 | **Account management + deletion** | `/account` shows email, sign out, and delete (typed confirm → user + shelf removed) |
| P1 | **Regenerate / report / admin-delete a guide** | `force` regenerates; report is recorded; `ADMIN_EMAILS` gates delete |
| P1 | ESLint flat config + CI | `npm run lint` works; CI runs typecheck · lint · unit · build · e2e · lighthouse |
| P2 | Design token layer + primitives; AA contrast | zero undefined Tailwind classes; body text passes AA |
| P2 | `next/font` self-hosting | no external font request in the network panel |
| P2 | Content never gated behind JS animation | hero + sections visible with the animation clock frozen |
| P2 | Structured logging + observability seam | JSON logs with request ids; `reportError`/`track` no-op without a sink; no secrets |
| P2 | **Ranked library search** | title match outranks tagline match; ties break on rating; unit-tested |
| P2 | **Tutor: markdown answers + conversation persistence** | bold/italic/code/lists render safely; the chat survives navigation |
| P2 | **Lighthouse-CI budget** | CI job fails on a11y < 0.95, warns on perf < 0.85 |
| P2 | **Generation eval harness** | `npm run eval` scores structure + accuracy against a known-book set |
| P3 | Landing page rebuild (scroll narrative + CTA) | journey animates on scroll; page ends on a CTA |
| P3 | Inner product on the new design language | book / shelf / compare / tutor / 404 share the system |
| P3 | **Seed library 4 → 10 books** | 10 full public-domain guides; all SSG |
| P3 | **Compare deep-linking; per-book OG images** | `?a=&b=` shareable; each book has a distinct OG card |
| P3 | Docs consolidation + board + LICENSE | one bible; README accurate; this board |

---

## QA / Review / In Progress

_(empty)_

---

## Ready

| P | Card | Acceptance criterion |
|---|---|---|
| P1 | Rotate the exposed Groq key | old key returns 401; new key set; `/api/health` → `modelReady: true` |
| P1 | Wire a fresh Supabase project | new keys: generate persists to `books`; magic-link sign-in works; bookmark appears in `shelves`; app still runs identically with keys removed |
| P2 | Shared rate-limit store (Upstash) | limits enforced across serverless instances, not per-lambda; falls back to in-memory without config |
| P2 | Register a real error sink | `instrumentation.ts` wires Sentry (or similar) behind `SENTRY_DSN`; a thrown 500 shows up there |
| P2 | E2E: auth + generate happy path | against a test Supabase project: sign in, generate, see it persist + render |
| P2 | `reports` table | `POST /api/books/[slug]/report` writes a row; a small admin view lists open reports |
| P3 | Run `npm run eval` and set a quality bar | baseline scores recorded; the prompt tuned if avg accuracy < 85% |

---

## Discovery

| P | Card | Question to answer |
|---|---|---|
| P1 | Real image generation for sketches | pipeline (ComfyUI vs hosted), cost per book, cache-first storage, `imageUrl` on `Sketch`. Scaffold in `BACKEND_AND_AUTH.md §3`. |
| P2 | Generation cost model at scale | with rate limits in place, what's the realistic monthly Groq spend at N daily active users? Do we need a paid tier? |
| P2 | Semantic search | is ranked substring search enough at 100+ books, or do we need embeddings? |
| P3 | Account: email change / OAuth linking | Supabase supports it — is it worth the UI before launch? |

---

## Backlog

| P | Card |
|---|---|
| P2 | Tutor: streaming markdown (render incrementally, not just on settle) |
| P2 | `/compare`: support 3 books; a "vs" share card |
| P2 | Sitemap freshness / `lastModified` per generated book |
| P2 | Analytics dashboard for the Bible's success metrics |
| P3 | Audio narration (TTS) of the summary |
| P3 | ML "what to read next" beyond tag overlap |
| P3 | Reading streaks / quizzes / badges |
| P3 | Classroom edition — teacher reading lists, shareable guide sets |
| P3 | Community — reviews, shared shelves |
| P3 | `.NET 9` Web API (optional alt backend, `BACKEND_AND_AUTH.md §2`) |
| P3 | Dark theme (deferred — light-only identity for now) |
| P3 | Silence the `node:sqlite` experimental warning at build |

---

## Working agreements

- Every PR: `npm run check` green, e2e green in CI, docs updated in the same PR.
- New API route → `route()` + a zod schema + at least one test; add rate limits
  if it touches a paid service.
- New screen / component → design tokens only, transform-only entrances, an a11y pass.
- New external dependency → time-boxed and behind a fallback (Principle #5).
- Update `docs/CHANGELOG.md` and the decisions log in `PROJECT_BIBLE.md` for
  anything architectural.
