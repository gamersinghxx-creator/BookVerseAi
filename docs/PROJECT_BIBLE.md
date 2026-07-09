# BookVerse AI — Project Bible

> The living single-source-of-truth for BookVerse AI. Update this whenever
> scope, architecture, or conventions change. Last updated: 2026-07-06.

## 1. Vision

A beautiful, AI-powered web app where a user enters a book title and receives a
visually engaging, structured summary — conceptual AI sketches, timelines, key
lessons, mind maps, character maps, and an interactive AI tutor. The goal is to
help users **understand a book quickly, not replace reading it.**

## 2. Principles (non-negotiable)

1. **Transformative, not reproductive.** Summaries paraphrase and teach; never
   reproduce copyrighted text. Prefer public-domain works initially and always
   attribute + encourage reading the original.
2. **Generate once, serve forever.** Every AI generation is cached permanently
   to keep cost near zero (target ₹0–₹2,000 for the MVP).
3. **Premium, calm UI.** Warm, luminous, motion-rich but never noisy.
4. **Educational & visual.** Favor timelines, maps, and sketches over walls of text.

## 3. Target users

Students, professionals, entrepreneurs, casual readers, and book clubs.

## 4. Feature scope

### MVP (this build — frontend, mock data)
Book search · rich book page · structured summary · chapter breakdown · key
lessons · conceptual AI sketches · timeline · character map (fiction) · mind map
· AI Q&A tutor · cached-summary model · responsive UI.

### Future
Audio narration · recommendation engine · gamification · mobile app · book
comparisons · classroom edition.

## 5. Architecture (target)

```
User → Search Book → Cached?
  ├─ Yes → return cached summary
  └─ No  → generate summary → generate visuals → store permanently → return
```

The current build implements the **frontend + the cached-response shape** with
mock data. The domain types in `lib/types.ts` intentionally mirror what a real
generation backend would return, so the UI can swap mock → live API with no
component changes.

## 6. Tech stack

| Layer | Choice | Status in this build |
|---|---|---|
| Frontend | Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion | ✅ implemented |
| Backend | .NET 9 Web API, EF Core | ⏳ not started (planned) |
| Database | SQLite via `node:sqlite` (local, zero-dep); Postgres/Supabase optional | ✅ real DB, auto-seeded (file-cache fallback) |
| AI (text) | Qwen / Llama / Gemma / Mistral via Ollama (local) | ✅ wired via /api routes (mock fallback) |
| AI (image) | Stable Diffusion XL / FLUX / ComfyUI | ⏳ placeholder sketches |
| Hosting | Vercel (web), Railway/Render (API), Supabase (DB) | ⏳ planned |

> GSAP is listed in the original report but Framer Motion covers all current
> animation needs; GSAP can be added later for scroll-timeline effects.

## 7. Repository layout

```
BookVerseAi/
├─ app/
│  ├─ layout.tsx            # root layout, fonts, navbar/footer
│  ├─ page.tsx              # home (hero + search + features)
│  ├─ not-found.tsx
│  └─ book/[slug]/page.tsx  # rich book page (static-generated per book)
├─ components/
│  ├─ Navbar / Footer / Hero / Features
│  ├─ BookCard / SearchLibrary
│  └─ book/  Section, BookHeader, Timeline, MindMap,
│            CharacterMap, Sketches, AITutor
├─ lib/
│  ├─ types.ts              # domain model (mirrors future API)
│  └─ books.ts              # mock library + getBook/searchBooks
├─ docs/
│  ├─ PROJECT_BIBLE.md      # this file
│  └─ PROJECT_HANDOFF.md    # current state + next steps
└─ config: package.json, tsconfig, tailwind, next, postcss
```

## 8. Data model

See `lib/types.ts`. A `Book` carries: metadata (title, author, year, category,
tags, cover, rating, readingTime, `cached`), `overview`, `summary[]`,
`chapters[]`, `lessons[]`, `timeline[]`, `characters[]` (empty for non-fiction),
`mindMap[]` (parent-linked nodes), `sketches[]`, and pre-baked `qa[]` for the
mock tutor.

## 9. Design system - "Liquid Light" (redesigned 2026-07-06)

- **Concept:** a warm-white "paper" world where colour behaves like living ink -
  soft blooms of sky blue, crimson, and leaf green that breathe and mix, reacting
  to the pointer. Light, airy, emotional; deliberately not another dark theme.
- **Palette:** warm ivory `paper` base, warm near-black `ink` text, and five
  living inks - sky, crimson, leaf, amber, iris (each with an `ink` shade dark
  enough for text on paper). Tokens live in `tailwind.config.ts` + `globals.css`.
- **Type:** Fraunces (expressive display serif) + Space Grotesk (UI/labels) +
  Inter (body), loaded via stylesheet link.
- **Signature:** `components/fx/LiquidLight.tsx` - a GPU-light Canvas 2D field of
  multiply-blended ink blooms (breathing, cursor-reactive). Plus a trailing
  custom cursor glow and an SVG paper-grain overlay.
- **Primitives (in `globals.css`):** `.card`, `.glass`, `.btn-primary`,
  `.btn-ghost`, `.pill`, `.eyebrow`, `.display`, `.ink-gradient`, `.link-underline`.
- **Motion:** Framer Motion for kinetic type, scroll reveals (`fx/Reveal`), the
  scroll-story ink thread, orb float/parallax, and the mind-map draw-in.
- **Accessibility/performance:** full `prefers-reduced-motion` fallbacks (canvas
  renders one static frame, transitions collapse), DPR capped at 1.5, canvas
  pauses when the tab is hidden, skip-to-content link, aria-hidden on decoration,
  keyboard-focusable controls, warm-charcoal-on-ivory contrast.

## 10. Legal posture

Public-domain titles only in the MVP (The Art of War, Meditations, Pride and
Prejudice, Frankenstein). Every book page footer restates the transformative
disclaimer and encourages buying the original.

## 11. Conventions

- Server components by default; add `"use client"` only where interactivity or
  Framer Motion is needed.
- Keep the mock/live boundary at `lib/`. Components never assume the data source.
- Path alias `@/*` maps to repo root.

## 12. Roadmap

- **Phase 1 (current):** auth, search, summary, cache, UI. → UI + mock cache done; auth pending.
- **Phase 2 (done):** live AI chat + generate-any-book via Next.js API routes + Ollama (mock fallback), file cache; mind maps/timelines/character graphs live.
- **Phase 3:** audio, personalization, community, premium.

## 13. Success metrics

Search-to-read conversion · time on page · repeat users · cache hit rate · user
satisfaction.
