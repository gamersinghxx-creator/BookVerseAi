# 📖 BookVerse AI

> **Step inside any book.** An immersive, AI-powered web app that turns any book
> into a living study guide — structured summary, chapter breakdown, key lessons,
> timeline, radial mind map, character map, conceptual sketches, and a
> book-grounded AI tutor — all painted in warm light.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss)
![Tests](https://img.shields.io/badge/tests-vitest_%2B_playwright-6E9F18)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## Quick start

**Requires Node 22+** (for the built-in `node:sqlite`; older Node falls back to a
JSON file cache).

```bash
npm install
npm run dev          # → http://localhost:3000
```

That's it. With no configuration the app runs fully:

- **AI** → a grounded offline mock (real, structured previews — no keys needed)
- **Database** → embedded SQLite, auto-seeded with 10 public-domain books
- **Shelf** → browser localStorage

### Enable real AI

Copy `.env.example` to `.env.local` and set a provider:

```bash
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

Supported: **Groq** (default model `openai/gpt-oss-120b`), **OpenAI**, **Gemini**,
any OpenAI-compatible endpoint, or a local **Ollama** (`AI_PROVIDER=ollama`). The
nav badge shows the live status — green only when the configured model is
actually reachable. If a provider or model is unavailable the app degrades to the
mock; it never hard-fails.

### Enable hosted persistence + accounts

Set the three `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` vars and run
`supabase/schema.sql`. See **[DEPLOY.md](DEPLOY.md)**. Everything is env-gated —
remove the keys and the app behaves exactly as before.

---

## Commands

| Command | |
|---|---|
| `npm run dev` | dev server (Turbopack) |
| `npm run build` / `npm start` | production build / serve |
| `npm run check` | typecheck + lint + unit tests |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright (desktop + mobile) — needs `npx playwright install chromium` once |
| `npm run eval` | generation-quality eval (real API calls; set `AI_PROVIDER` + a key) |
| `npm run typecheck` / `npm run lint` | individually |

---

## How it works

```
Enter a title
  → seed book?      → serve from code (instant)
  → cached?         → serve from Supabase / SQLite / file  (each time-boxed)
  → otherwise       → POST /api/generate
                        → a provider writes a Book-shaped JSON study guide
                        → normalised, validated, cached forever
                        → rich book page renders
```

Every external dependency (hosted DB, remote model, session refresh) is wrapped in
a timeout + circuit breaker, so a slow or dead service degrades instantly instead
of hanging a request.

Full detail: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Project structure

```
app/          routes + API (every API route uses lib/http.ts route())
components/    ui/ (design primitives) · book/ · fx/ · home/ · account/ · screen components
lib/          types · store (the data seam) · schemas (zod) · http · log ·
              resilience · rate-limit · observability · search · motion · ai/ · supabase/
tests/        unit/ (Vitest) · e2e/ (Playwright) · eval/ (generation quality)
docs/         PROJECT_BIBLE · ARCHITECTURE · BOARD · CHANGELOG · BACKEND_AND_AUTH
```

---

## Design system — "Liquid Light"

A warm-white "paper" world where colour behaves like living ink. **One palette,
light only.** A full token layer (type scale, spacing, elevation, motion) lives
in `tailwind.config.ts`; primitives in `components/ui/`. Entrance animations are
transform-only, so content is always visible and the whole thing degrades
gracefully under `prefers-reduced-motion`.

Fonts: **Fraunces** (display) · **Space Grotesk** (UI) · **Inter** (body),
self-hosted via `next/font`.

---

## Documentation

| Doc | |
|---|---|
| [docs/PROJECT_BIBLE.md](docs/PROJECT_BIBLE.md) | vision, principles, architecture, data model, design system, roadmap |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | how the pieces fit and why |
| [docs/BOARD.md](docs/BOARD.md) | Backlog → … → Done, with priorities and acceptance criteria |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | what changed |
| [docs/BACKEND_AND_AUTH.md](docs/BACKEND_AND_AUTH.md) | Postgres, auth, image generation, optional .NET backend |
| [CONTRIBUTING.md](CONTRIBUTING.md) | conventions and common tasks |
| [DEPLOY.md](DEPLOY.md) | Vercel + Supabase, step by step |
| [docs/PENDING.md](docs/PENDING.md) | short list of manual setup tasks (keys, Supabase, deploy) |

---

## Legal

Summaries are **transformative and educational** — they paraphrase and teach,
never reproduce copyrighted text. The seed library is public-domain only. Every
book page credits the author and points to the original. See
[docs/PROJECT_BIBLE.md §15](docs/PROJECT_BIBLE.md).

Proprietary — see [LICENSE](LICENSE).
