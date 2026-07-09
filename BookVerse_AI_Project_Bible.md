# 📖 BookVerse AI — Project Bible

> **The single source of truth for BookVerse AI.**
> This document defines every aspect of the project — vision, principles, architecture, data model, design system, conventions, and roadmap. Update it whenever scope, architecture, or conventions change.
>
> **Last updated:** 2026-07-09

---

## Table of Contents

1. [Vision](#1-vision)
2. [Mission Statement](#2-mission-statement)
3. [Principles (Non-Negotiable)](#3-principles-non-negotiable)
4. [Target Users](#4-target-users)
5. [Feature Scope](#5-feature-scope)
6. [Architecture](#6-architecture)
7. [Tech Stack](#7-tech-stack)
8. [Repository Layout](#8-repository-layout)
9. [Data Model](#9-data-model)
10. [AI System](#10-ai-system)
11. [Database & Caching Strategy](#11-database--caching-strategy)
12. [Design System — "Liquid Light"](#12-design-system--liquid-light)
13. [API Contract](#13-api-contract)
14. [Routing & Navigation](#14-routing--navigation)
15. [Component Architecture](#15-component-architecture)
16. [State Management](#16-state-management)
17. [SEO & PWA](#17-seo--pwa)
18. [Accessibility Standards](#18-accessibility-standards)
19. [Performance Budget](#19-performance-budget)
20. [Legal Posture](#20-legal-posture)
21. [Cost Strategy](#21-cost-strategy)
22. [Environment Variables](#22-environment-variables)
23. [Conventions & Code Standards](#23-conventions--code-standards)
24. [Deployment Strategy](#24-deployment-strategy)
25. [Roadmap](#25-roadmap)
26. [Success Metrics](#26-success-metrics)
27. [Decisions Log](#27-decisions-log)
28. [Risks & Mitigations](#28-risks--mitigations)
29. [Long-Term Vision](#29-long-term-vision)

---

## 1. Vision

Build the world's most **visually engaging book knowledge platform** — an immersive, AI-powered web app where a user enters a book title and receives a living study guide: structured summaries, timelines, mind maps, character relationship graphs, conceptual AI sketches, and an interactive AI tutor. The goal is to help users **understand a book quickly — not replace reading it.**

---

## 2. Mission Statement

**"Step inside any book."**

Transform every book into an interactive, visual learning experience that is:
- Beautiful enough to inspire curiosity
- Intelligent enough to teach effectively
- Affordable enough to run near-zero cost
- Ethical enough to encourage reading the originals

---

## 3. Principles (Non-Negotiable)

| # | Principle | Meaning |
|---|---|---|
| 1 | **Transformative, not reproductive** | Summaries paraphrase and teach — never reproduce copyrighted text. Prefer public-domain works initially. Always attribute and encourage reading the original. |
| 2 | **Generate once, serve forever** | Every AI generation is cached permanently. Cost stays near zero. Repeat requests are always instant. |
| 3 | **Premium, calm UI** | Warm, luminous, motion-rich but never noisy. Every pixel should feel intentional and premium. |
| 4 | **Educational & visual** | Favour timelines, maps, graphs, and sketches over walls of text. Learning should feel spatial, not linear. |
| 5 | **Graceful degradation** | The app must work fully without Ollama, without a database, without network. Mock fallbacks everywhere. |
| 6 | **Component-data boundary** | Components never know where data comes from. The mock→live boundary lives entirely in `lib/`. |

---

## 4. Target Users

| Segment | Need |
|---|---|
| **Students** | Quick study guides, exam prep, chapter breakdowns |
| **Professionals** | Time-efficient book summaries, key lessons extraction |
| **Entrepreneurs** | Business book insights, comparative analysis |
| **Casual readers** | "Should I read this?" exploration, visual previews |
| **Book clubs** | Discussion prep, character maps, comparison mode |
| **Educators** | Classroom-ready mind maps, structured overviews |

---

## 5. Feature Scope

### ✅ MVP (Shipped — Phase 1 + 2)

| Feature | Location | Notes |
|---|---|---|
| Living search with bloom animation | `components/LivingSearch.tsx` | Client-side search + AI generation trigger |
| Rich book pages | `app/book/[slug]/page.tsx` | 8 content sections per book |
| Structured summary | `components/book/Section.tsx` | Multi-paragraph overview |
| Chapter breakdown | Book page | Numbered chapter summaries |
| Key lessons | Book page | Title + detail format |
| Conceptual AI sketches | `components/book/Sketches.tsx` | Gradient + emoji placeholders |
| Timeline | `components/book/Timeline.tsx` | Visual event thread |
| Character map | `components/book/CharacterMap.tsx` | Relationship graph (fiction only) |
| Radial mind map | `components/book/MindMap.tsx` | SVG parent-linked nodes |
| AI tutor chat | `components/book/AITutor.tsx` | Streaming, book-grounded |
| Generate any book | `app/api/generate/route.ts` | Full study guide via Ollama/mock |
| Cache (generate once, serve forever) | `lib/store.ts` + SQLite | DB + JSON file fallback |
| My Shelf (local bookmarks) | `lib/shelf.ts` | localStorage, no account needed |
| Compare mode | `app/compare/page.tsx` | Side-by-side book comparison |
| Recently summoned | `components/RecentlySummoned.tsx` | Home rail of AI-generated books |
| Live AI status badge | `components/AIStatus.tsx` | Green / amber / grey in nav |
| Embedded SQLite database | `lib/db.ts` | `node:sqlite`, auto-seeding |
| SEO + PWA | `app/sitemap.ts`, etc. | Full metadata, manifest, OG images |
| Responsive UI | All components | Mobile-first, fluid layout |

### ⏳ Future (Phase 3+)

| Feature | Priority | Notes |
|---|---|---|
| Audio narration | High | Text-to-speech for summaries |
| Recommendation engine | High | ML-powered "what to read next" |
| Real AI image generation | High | SDXL / FLUX / ComfyUI for sketches |
| Authentication (Supabase Auth) | High | Per-user shelf sync across devices |
| PostgreSQL persistence | High | Replace SQLite for hosted deploys |
| Gamification | Medium | Reading streaks, quizzes, badges |
| Book comparisons (advanced) | Medium | AI-powered deep comparison |
| Classroom edition | Medium | Teacher tools, reading lists |
| Community features | Low | Reviews, shared shelves, discussions |
| Mobile app | Low | React Native or PWA enhancement |
| Premium tier | Low | Extended features, priority generation |

---

## 6. Architecture

### System Flow

```
User → Search / Enter Book Title
        │
        ▼
   ┌─ Cached? ─┐
   │            │
  YES          NO
   │            │
   ▼            ▼
Return      Generate (Ollama / mock fallback)
cached        │
summary       ├─→ Generate text summary (structured JSON)
              ├─→ Generate visuals (placeholder / SDXL)
              ├─→ Normalize + validate Book shape
              └─→ Store permanently (SQLite + JSON file cache)
                    │
                    ▼
              Return to user → Render rich book page
```

### Architectural Layers

```
┌──────────────────────────────────────────────┐
│                   UI Layer                    │
│   app/ (routes) + components/ (presentation) │
│   React Server Components + Client Islands   │
├──────────────────────────────────────────────┤
│                Data Layer                     │
│   lib/store.ts — unified read/write          │
│   lib/db.ts — SQLite + fallback              │
│   lib/shelf.ts — localStorage                │
├──────────────────────────────────────────────┤
│                 AI Layer                      │
│   lib/ai/ — provider selection, streaming,   │
│   prompts, JSON extraction, normalization    │
├──────────────────────────────────────────────┤
│              API Layer                        │
│   app/api/ — chat, generate, books,          │
│   library, health                            │
├──────────────────────────────────────────────┤
│            External Services                  │
│   Ollama (local) · Supabase (optional)       │
│   ComfyUI (optional) · .NET API (optional)   │
└──────────────────────────────────────────────┘
```

### Key Design Decisions

- **Next.js API routes as the primary backend** — the .NET service is optional; Next routes are production-ready
- **Embedded SQLite** via `node:sqlite` (Node 22+) — zero external dependencies for development
- **Graceful fallback chain** — Ollama → mock AI, SQLite → JSON file cache, real images → emoji placeholders
- **Static generation for seed books** — SSG for the 4 curated titles, dynamic for generated ones
- **The `lib/` boundary** — components never import data sources directly; everything goes through `lib/store.ts`

---

## 7. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16 | SSR/SSG, API routes, routing |
| **UI Library** | React | 18 | Component rendering |
| **Language** | TypeScript | 5 | Type safety |
| **Styling** | Tailwind CSS | 3 | Utility-first CSS, design tokens |
| **Animation** | Framer Motion | 11 | Page transitions, scroll reveals, kinetic type |
| **Icons** | Lucide React | 0.417 | Consistent icon set |
| **Database** | `node:sqlite` (Node built-in) | — | Embedded, zero-dep persistence |
| **AI Runtime** | Ollama (local) | — | Local LLM inference |
| **AI Models** | Llama 3.2, Qwen, Mistral, Gemma | — | Text generation + chat |
| **Image Gen** | SDXL / FLUX / ComfyUI | — | Conceptual sketches (planned) |
| **Fonts** | Fraunces, Space Grotesk, Inter | — | Display, UI, body typography |

### Not Used (Noted for Clarity)

| Technology | Reason |
|---|---|
| GSAP | Listed in original report; Framer Motion covers all current animation needs |
| Redux / Zustand | `useSyncExternalStore` + server components suffice |
| Prisma / Drizzle | `node:sqlite` is used directly for simplicity |

---

## 8. Repository Layout

```
BookVerseAi/
├── app/                          # Next.js App Router pages + API
│   ├── layout.tsx                #   Root layout — fonts, Nav, Footer, FX
│   ├── page.tsx                  #   Home — Hero + LivingSearch + Library + Story
│   ├── globals.css               #   Design system primitives + CSS variables
│   ├── loading.tsx               #   Global loading state
│   ├── error.tsx                 #   Global error boundary
│   ├── not-found.tsx             #   404 page
│   ├── manifest.ts               #   PWA manifest
│   ├── sitemap.ts                #   Dynamic sitemap
│   ├── robots.ts                 #   Robots.txt
│   ├── icon.tsx                  #   Generated favicon
│   ├── opengraph-image.tsx       #   Generated OG image
│   ├── book/[slug]/              #   Dynamic book route
│   │   └── page.tsx              #     Rich book page (8 sections)
│   ├── shelf/page.tsx            #   My Shelf (bookmarks)
│   ├── compare/page.tsx          #   Side-by-side book comparison
│   └── api/
│       ├── chat/route.ts         #   POST — AI tutor streaming
│       ├── generate/route.ts     #   POST — generate full study guide
│       ├── books/route.ts        #   GET  — list generated books
│       ├── library/route.ts      #   GET  — search all books
│       └── health/route.ts       #   GET  — Ollama status
│
├── components/                   # Reusable UI components
│   ├── Hero.tsx                  #   Cinematic hero — kinetic typography
│   ├── LivingSearch.tsx          #   Bloom-animated search + summoning overlay
│   ├── Library.tsx               #   Book constellation grid
│   ├── BookOrb.tsx               #   Orb-style book card + colour aura
│   ├── Story.tsx                 #   Scroll-story with ink thread
│   ├── Nav.tsx                   #   Top navigation bar
│   ├── Footer.tsx                #   Site footer
│   ├── AIStatus.tsx              #   Ollama status badge (nav)
│   ├── ShelfButton.tsx           #   Bookmark toggle button
│   ├── RecentlySummoned.tsx      #   Home rail — recently generated books
│   ├── book/                     #   Book page section components
│   │   ├── BookHeader.tsx        #     Header + cover orb + metadata
│   │   ├── Section.tsx           #     Reusable section wrapper (icon, title, content)
│   │   ├── Timeline.tsx          #     Visual event timeline
│   │   ├── MindMap.tsx           #     Radial SVG mind map
│   │   ├── CharacterMap.tsx      #     Character relationship graph
│   │   ├── Sketches.tsx          #     Conceptual art placeholder cards
│   │   ├── AITutor.tsx           #     Streaming chat interface
│   │   └── Related.tsx           #     "Continue wandering" recommendations
│   └── fx/                       #   Visual effects layer
│       ├── LiquidLight.tsx       #     Canvas ink field (breathing, cursor-reactive)
│       ├── Cursor.tsx            #     Trailing ink glow
│       └── Reveal.tsx            #     Scroll-triggered entrance animation
│
├── lib/                          # Data layer (mock↔live boundary)
│   ├── types.ts                  #   Core domain model (Book, Chapter, etc.)
│   ├── books.ts                  #   Seed library — 4 public-domain books
│   ├── store.ts                  #   Unified data read/write (DB + cache)
│   ├── db.ts                     #   node:sqlite wrapper — auto-seed
│   ├── shelf.ts                  #   localStorage shelf (useSyncExternalStore)
│   ├── related.ts                #   Tag/category-based recommendations
│   ├── accents.ts                #   Per-book colour accents
│   └── ai/                       #   AI subsystem
│       ├── index.ts              #     Provider selection + JSON extraction
│       ├── config.ts             #     Runtime configuration
│       ├── ollama.ts             #     Ollama HTTP client (streaming)
│       ├── prompts.ts            #     System prompts (generation + chat)
│       ├── mock.ts               #     Offline fallback generator
│       └── types.ts              #     AI-specific type definitions
│
├── types/
│   └── node-sqlite.d.ts          # Ambient types for node:sqlite
│
├── docs/                         # Project documentation
│   ├── PROJECT_BIBLE.md          #   This file
│   ├── PROJECT_HANDOFF.md        #   State snapshot + next steps
│   └── BACKEND_AND_AUTH.md       #   Env-dependent setup guides
│
├── .bookverse-cache/             # Runtime — SQLite DB + JSON cache (gitignored)
├── .env.example                  # Environment variable template
├── .env.local                    # Local env overrides (gitignored)
├── package.json                  # Dependencies + scripts
├── tailwind.config.ts            # Design tokens + custom animations
├── tsconfig.json                 # TypeScript config (path alias @/*)
├── next.config.mjs               # Next.js configuration
├── postcss.config.mjs            # PostCSS pipeline
└── .gitignore                    # Git exclusions
```

---

## 9. Data Model

All types are defined in `lib/types.ts`. The `Book` type is the central entity, designed to mirror the exact shape a real AI-generation backend would return:

### Book (root entity)

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | URL-safe identifier |
| `title` | `string` | Book title |
| `author` | `string` | Author name |
| `year` | `string` | Publication year / era |
| `category` | `"fiction" \| "non-fiction"` | Genre classification |
| `tags` | `string[]` | Topic tags for search + recommendations |
| `cover` | `{ emoji, tone }` | Visual cover placeholder |
| `tagline` | `string` | One-line hook |
| `readingTime` | `string` | Estimated reading time (e.g. "12 min read") |
| `rating` | `number` | Rating (0–5) |
| `cached` | `boolean` | Whether this was served from cache |
| `overview` | `string` | Multi-paragraph overview |
| `summary` | `string[]` | Structured summary paragraphs |
| `chapters` | `Chapter[]` | Chapter-by-chapter breakdown |
| `lessons` | `Lesson[]` | Key lessons / takeaways |
| `timeline` | `TimelineEvent[]` | Chronological events |
| `characters` | `Character[]` | Character roster (empty for non-fiction) |
| `mindMap` | `MindMapNode[]` | Parent-linked concept nodes |
| `sketches` | `Sketch[]` | Conceptual AI art placeholders |
| `qa` | `{ q, a }[]` | Pre-baked Q&A for AI tutor grounding |

### Supporting Types

| Type | Fields | Purpose |
|---|---|---|
| `Chapter` | `number`, `title`, `summary` | Chapter breakdown |
| `Lesson` | `title`, `detail` | Key takeaway |
| `TimelineEvent` | `label`, `title`, `detail` | Chronological event |
| `Character` | `name`, `role`, `description`, `connections[]` | Character + relationships |
| `MindMapNode` | `id`, `label`, `parent` | Parent-linked tree node |
| `Sketch` | `caption`, `emoji`, `tone` | Art placeholder |

---

## 10. AI System

### Provider Architecture

```
lib/ai/index.ts (provider selector)
    ├── ollama.ts  → local Ollama server (preferred)
    └── mock.ts    → offline fallback (always available)
```

### Configuration (`lib/ai/config.ts`)

| Variable | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `ollama` | Runtime selection (`ollama` or `mock`) |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Model to use for generation + chat |
| `AI_PROBE_TIMEOUT_MS` | `1500` | Timeout for Ollama availability check |

### Generation Flow

1. User submits a title → `POST /api/generate`
2. Check cache (SQLite → JSON file) — if hit, return immediately
3. Build system prompt with structured JSON schema (`lib/ai/prompts.ts`)
4. Stream response from Ollama (or mock)
5. Extract JSON from response, normalize to `Book` shape
6. Validate / repair missing fields
7. Store in SQLite + JSON file cache
8. Return complete `Book` object

### Chat Flow

1. User sends message → `POST /api/chat`
2. Retrieve book context (overview, summary, lessons, chapters)
3. Build grounded system prompt with book context
4. Stream response from Ollama (or mock keyword matching)
5. Return streamed text to client

### Supported Models

| Model | Provider | Notes |
|---|---|---|
| Llama 3.2 | Ollama | Default, good balance of quality + speed |
| Qwen 2.5 | Ollama | Strong at structured JSON output |
| Mistral | Ollama | Fast, good for chat |
| Gemma 2 | Ollama | Google's model, solid performance |

---

## 11. Database & Caching Strategy

### "Generate Once, Serve Forever"

The core caching philosophy ensures near-zero operational AI cost:

```
First request:  Generate → Store → Serve     (expensive, one-time)
Every request:  Cache check → Serve           (instant, free)
```

### Storage Layers

| Layer | Technology | Purpose | Fallback |
|---|---|---|---|
| **Primary** | SQLite (`node:sqlite`) | Embedded DB, auto-seeded | JSON file cache |
| **File cache** | `.bookverse-cache/<slug>.json` | Per-book JSON files | — |
| **Future** | PostgreSQL / Supabase | Hosted production persistence | SQLite |

### Database Schema (`lib/db.ts`)

```sql
CREATE TABLE IF NOT EXISTS books (
  slug TEXT PRIMARY KEY,
  data TEXT NOT NULL,           -- full Book JSON
  is_seed INTEGER DEFAULT 0,   -- 1 for curated books
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Seeding

On first run, `lib/db.ts` auto-seeds the 4 curated public-domain books from `lib/books.ts`. Generated books are upserted alongside seed data in the same table.

---

## 12. Design System — "Liquid Light"

### Concept

A warm-white "paper" world where colour behaves like **living ink** — soft blooms of sky blue, crimson, and leaf green that breathe and mix, reacting to the pointer. Light, airy, emotional; deliberately **not** another dark theme.

### Colour Palette

#### Base Tones

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| `paper` | `#FBF6EE` | `--color-paper` | Primary background |
| `paper-soft` | `#F5ECE0` | `--color-paper-soft` | Card / glass surfaces |
| `paper-deep` | `#EDE1D2` | `--color-paper-deep` | Deeper layers |
| `ink` | `#211A18` | `--color-ink` | Primary text |
| `ink-soft` | `#5B4F49` | `--color-ink-soft` | Secondary text |
| `ink-faint` | `#8A7C74` | `--color-ink-faint` | Muted text / borders |

#### Living Inks (5 accent colours)

| Name | Default | Ink (dark) | Soft (light) | Personality |
|---|---|---|---|---|
| `sky` | `#2E9BFF` | `#0A63C4` | `#8FCBFF` | Links, highlights, knowledge |
| `crimson` | `#FF2E55` | `#CE1236` | `#FF8298` | Warnings, emphasis, passion |
| `leaf` | `#2ECB7C` | `#0E8A50` | `#88E6B4` | Success, growth, nature |
| `amber` | `#FFB13D` | `#C9821A` | `#FFD189` | Warmth, attention, insight |
| `iris` | `#7A5CFF` | `#5033C9` | `#BBAAFF` | Creative, AI, mystical |

### Typography

| Role | Font Family | Fallback | Weight Range | Usage |
|---|---|---|---|---|
| Display | **Fraunces** | Georgia, serif | 400–900 | Hero text, headings, book titles |
| UI / Labels | **Space Grotesk** | system-ui, sans-serif | 400–700 | Buttons, nav, pills, labels |
| Body | **Inter** | system-ui, sans-serif | 400–600 | Paragraphs, descriptions |

Fonts are loaded via Google Fonts `<link>` tag — no build-time network dependency.

### CSS Primitives (`globals.css`)

| Class | Purpose |
|---|---|
| `.card` | Surface container with subtle shadow |
| `.glass` | Glassmorphism surface (frosted paper) |
| `.btn-primary` | Primary action button |
| `.btn-ghost` | Secondary / ghost button |
| `.pill` | Tag / category pill |
| `.eyebrow` | Small uppercase label |
| `.display` | Large display heading |
| `.ink-gradient` | Gradient text effect |
| `.link-underline` | Animated underline link |

### Custom Animations (`tailwind.config.ts`)

| Name | Duration | Purpose |
|---|---|---|
| `breathe` | 7s | Gentle scale pulse (orbs, icons) |
| `floaty` | 8s | Vertical float (book orbs) |
| `drift` | 18s | Subtle position drift (background) |
| `shimmer` | 6s | Background gradient sweep |
| `rise` | — | Entrance from below (keyframe only) |

### Signature Visual Effects

| Component | File | Description |
|---|---|---|
| **LiquidLight** | `components/fx/LiquidLight.tsx` | Canvas 2D field of multiply-blended ink blooms — breathing animation, cursor-reactive. GPU-light, DPR-capped. |
| **Cursor** | `components/fx/Cursor.tsx` | Trailing ink glow that follows the pointer — `mix-blend-mode: multiply`. |
| **Grain** | `globals.css` (`.grain`) | SVG noise overlay for paper texture. |
| **Reveal** | `components/fx/Reveal.tsx` | Scroll-triggered Framer Motion entrance with `whileInView`. |

### Per-Book Accents (`lib/accents.ts`)

Each book gets a unique accent colour from the living inks palette, applied to its header, sections, timeline markers, and mind map nodes. This makes every book page feel distinct.

---

## 13. API Contract

### `POST /api/chat`

**Purpose:** AI tutor — streams book-grounded answers.

| Field | Type | Description |
|---|---|---|
| `slug` | `string` | Book identifier |
| `messages` | `{ role, content }[]` | Chat history |

**Response:** `text/event-stream` — chunked text.

### `POST /api/generate`

**Purpose:** Generate a full study guide for any book title.

| Field | Type | Description |
|---|---|---|
| `title` | `string` | Book title to generate |

**Response:** `Book` JSON (full entity). Header `X-Source: cache` or `generated`.

### `GET /api/books`

**Purpose:** List all AI-generated (non-seed) books.

**Response:** `BookSummary[]` — `{ slug, title, author, tagline, createdAt }`.

### `GET /api/library?q=`

**Purpose:** Search across all books (seed + generated).

**Response:** `BookSummary[]` matching the query.

### `GET /api/health`

**Purpose:** Ollama status check.

**Response:**
```json
{
  "provider": "ollama" | "mock",
  "available": boolean,
  "model": "llama3.2",
  "modelReady": boolean,
  "models": ["llama3.2", ...]
}
```

---

## 14. Routing & Navigation

| Route | Type | Description |
|---|---|---|
| `/` | Dynamic (force-dynamic) | Home — hero, search, library, story |
| `/book/[slug]` | SSG (seed) / Dynamic (generated) | Rich book page |
| `/shelf` | Client-side | My bookmarked books |
| `/compare` | Client-side | Side-by-side book comparison |
| `/api/*` | API routes | Backend endpoints |

### Navigation Elements

- **Nav** (`components/Nav.tsx`) — Logo, Shelf link, Compare link, AI status badge
- **Footer** (`components/Footer.tsx`) — Attribution, links

### Dynamic Route Note (Next.js 16)

Route `params` are async in Next 15+. All dynamic routes use:
```tsx
const { slug } = await params;
```

---

## 15. Component Architecture

### Server vs. Client Components

| Default | When to Add `"use client"` |
|---|---|
| Server Components | Only when interactivity, Framer Motion, or browser APIs are needed |

### Key Patterns

- **Section component** accepts a rendered icon **element** (`ReactNode`), not a component — avoids passing functions across the server/client boundary
- **BookOrb** is a self-contained visual unit with hover states, bookmark button, and colour aura
- **LivingSearch** manages its own fetch + summoning overlay state
- **AITutor** handles streaming responses + chat history internally

### Deprecated Stubs

These files exist as empty stubs (drive-blocks deletion prevents removal):
- `components/Navbar.tsx` → replaced by `Nav.tsx`
- `components/BookCard.tsx` → replaced by `BookOrb.tsx`
- `components/Features.tsx` → replaced by `Story.tsx`
- `components/SearchLibrary.tsx` → replaced by `LivingSearch.tsx`

---

## 16. State Management

| State | Technology | Scope |
|---|---|---|
| **Book data** | React Server Components + `lib/store.ts` | Server-side, passed as props |
| **Search** | `useState` + `fetch` in `LivingSearch.tsx` | Client component |
| **Shelf** | `useSyncExternalStore` + `localStorage` | Global client state |
| **AI chat** | `useState` in `AITutor.tsx` | Per-component |
| **AI status** | `useEffect` polling in `AIStatus.tsx` | Nav badge |

No external state library is used — React's built-in primitives + server components handle all needs.

---

## 17. SEO & PWA

| Feature | Implementation |
|---|---|
| **Title tags** | `metadata.title` in layout + per-page metadata |
| **Meta descriptions** | `metadata.description` |
| **OpenGraph** | Full OG metadata + generated `opengraph-image.tsx` |
| **Twitter cards** | `summary_large_image` card type |
| **Sitemap** | `app/sitemap.ts` — dynamic, includes all books |
| **Robots.txt** | `app/robots.ts` |
| **Manifest** | `app/manifest.ts` — PWA-ready |
| **Favicon** | `app/icon.tsx` — programmatically generated |
| **Semantic HTML** | `<main>`, `<section>`, `<article>`, heading hierarchy |
| **Canonical URLs** | Via `NEXT_PUBLIC_SITE_URL` env variable |

---

## 18. Accessibility Standards

| Standard | Implementation |
|---|---|
| **Skip link** | `<a href="#main">Skip to content</a>` (sr-only, visible on focus) |
| **Reduced motion** | `prefers-reduced-motion` — canvas renders one static frame, all transitions collapse |
| **ARIA** | `aria-hidden` on decorative elements, proper labeling on interactive elements |
| **Keyboard** | All interactive elements are keyboard-focusable |
| **Contrast** | Warm charcoal on ivory — exceeds WCAG AA requirements |
| **Semantic HTML** | Proper heading hierarchy, landmark regions |

---

## 19. Performance Budget

| Metric | Target | Current |
|---|---|---|
| Home page First Load JS | < 150 kB | ~141 kB |
| Book page First Load JS | < 140 kB | ~136 kB |
| Canvas DPR | ≤ 1.5 | Capped at 1.5 |
| Tab hidden | Canvas pauses | ✅ |
| Repeat book request | < 50 ms | Cache hit (instant) |

---

## 20. Legal Posture

- **Public-domain seed library** — The Art of War, Meditations, Pride and Prejudice, Frankenstein
- **Transformative summaries** — paraphrase, teach, and provide original analysis; never reproduce copyrighted text
- **Attribution** — every book page credits the author and encourages purchasing / reading the original
- **Footer disclaimer** — transformative-use notice on every book page
- **Generated content** — AI-generated summaries carry a "generated by AI" indicator

---

## 21. Cost Strategy

**Target:** ₹0–₹2,000 for the MVP.

| Strategy | How |
|---|---|
| Local AI | Ollama runs on the developer's machine — zero API cost |
| Cache everything | Generate once, serve forever — amortizes cost to near zero |
| SQLite | No hosted database needed for development |
| Vercel free tier | Frontend hosting |
| No paid APIs | No OpenAI, no cloud AI — all local or mock |

---

## 22. Environment Variables

```bash
# ── AI (active) ──────────────────────────────
AI_PROVIDER=ollama              # "ollama" or "mock"
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
AI_PROBE_TIMEOUT_MS=1500

# ── Site ─────────────────────────────────────
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── Optional services (see docs/BACKEND_AND_AUTH.md) ──
# SUPABASE_URL=
# SUPABASE_SERVICE_ROLE_KEY=
# NEXT_PUBLIC_API_URL=http://localhost:5080
# IMAGE_API_URL=http://127.0.0.1:8188
```

---

## 23. Conventions & Code Standards

| Rule | Detail |
|---|---|
| **Server components by default** | Add `"use client"` only when interactivity or browser APIs are required |
| **Path alias** | `@/*` maps to repository root (`tsconfig.json`) |
| **Data boundary** | Components never assume the data source; all access goes through `lib/` |
| **TypeScript strict** | All data is typed; `Book` shape is the contract between UI and data layers |
| **Naming** | PascalCase for components, camelCase for utilities, kebab-case for routes |
| **File organization** | One component per file, co-located styles where needed |
| **Exports** | Named exports preferred over default exports |
| **Comments** | Inline comments for non-obvious logic; doc comments for public APIs |

---

## 24. Deployment Strategy

### Development (Current)

```bash
npm run dev   # localhost:3000
```

### Production (Planned)

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Zero-config Next.js deployment |
| API (optional) | Railway / Render | .NET 9 service if separate backend is needed |
| Database | Supabase (Postgres) | Replaces SQLite for persistent hosting |
| AI | Self-hosted Ollama (GPU VM) | Or cloud GPU instances |

### Deployment Note

On ephemeral / serverless filesystems (e.g. Vercel), the SQLite file does not persist between invocations. Use the Postgres/Supabase adapter documented in `docs/BACKEND_AND_AUTH.md` for hosted production.

---

## 25. Roadmap

### Phase 1 — Frontend MVP ✅ (Complete)

- [x] Animated home page with hero + living search
- [x] Rich book pages for 4 public-domain titles
- [x] "Liquid Light" design system
- [x] Responsive UI + Framer Motion animations
- [x] Mock data layer matching future API shape

### Phase 2 — Live AI ✅ (Complete)

- [x] Ollama integration (streaming text generation + chat)
- [x] Generate-any-book flow + cache
- [x] Embedded SQLite database with auto-seeding
- [x] AI status badge (green / amber / grey)
- [x] My Shelf (localStorage bookmarks)
- [x] Compare mode
- [x] Recently summoned home rail
- [x] Full SEO + PWA (sitemap, manifest, OG images)
- [x] Recommendations ("Continue wandering" rail)
- [x] Loading + error states for all routes

### Phase 3 — Production Infrastructure ⏳ (Next)

- [ ] PostgreSQL / Supabase persistence
- [ ] Real image generation (SDXL / FLUX / ComfyUI)
- [ ] Authentication (Supabase Auth)
- [ ] Per-user shelf sync
- [ ] .NET 9 Web API (optional)
- [ ] Production deployment (Vercel + hosted DB)

### Phase 4 — Growth 🔮 (Future)

- [ ] Audio narration (text-to-speech)
- [ ] ML-powered recommendation engine
- [ ] Gamification (streaks, quizzes, badges)
- [ ] Community features (reviews, shared shelves)
- [ ] Advanced AI comparisons
- [ ] Classroom edition
- [ ] Mobile app
- [ ] Premium tier

---

## 26. Success Metrics

| Metric | Description | Target |
|---|---|---|
| **Search-to-read conversion** | % of searches that lead to reading a full book page | > 60% |
| **Time on page** | Average time spent on book pages | > 3 min |
| **Repeat users** | Users returning within 7 days | > 30% |
| **Cache hit rate** | % of book requests served from cache | > 90% |
| **Generation success** | % of AI generations producing valid, complete books | > 95% |
| **User satisfaction** | Post-experience survey score | > 4.0/5 |

---

## 27. Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-07-06 | Frontend MVP with mock data first | Validate UI/UX before wiring expensive AI; `lib/types.ts` shape mirrors future API |
| 2026-07-06 | Plain font `<link>` instead of `next/font/google` | Removes build-time network dependency on Google Fonts |
| 2026-07-06 | Upgrade to Next.js 16 + async route `params` | Security patches + latest features; `await params` required in Next 15+ |
| 2026-07-06 | `Section` accepts ReactNode icon, not component | Avoids passing functions across server/client boundary |
| 2026-07-06 | "Liquid Light" design system (warm-white) | Differentiate from dark-theme competitors; warm, calming, educational feel |
| 2026-07-06 | Ollama + mock fallback architecture | Zero-cost local AI; app always works without external services |
| 2026-07-06 | SQLite via `node:sqlite` | Zero external dependencies; graceful fallback to JSON files |
| 2026-07-06 | Next.js API routes as primary backend | .NET service is optional; Next routes are already production-ready |

---

## 28. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI generates inaccurate summaries | User trust, legal | Ground prompts in book context; disclaimers; encourage originals |
| Ollama unavailable | Feature degradation | Mock fallback — always functional; clear UI status indicators |
| SQLite doesn't persist on serverless | Data loss on deploy | Documented Postgres adapter; SQLite for dev only |
| Copyright concerns | Legal liability | Public-domain seed library; transformative summaries; attribution |
| Heavy canvas on low-end devices | Performance | DPR cap, `prefers-reduced-motion` fallback, tab-hidden pause |
| Google Fonts CDN down | Font fallback | System font stack in `font-family` declarations |

---

## 29. Long-Term Vision

Create the world's most **visually engaging book knowledge platform** — transforming books into interactive, immersive learning experiences that:

- Make knowledge **spatial** (mind maps, timelines, character graphs)
- Make learning **beautiful** (premium UI, living animations, conceptual art)
- Make access **democratic** (free/near-zero cost, open-source AI)
- Make reading **encouraged** (every page drives users toward the original book)

BookVerse AI is not a replacement for reading. It's an **invitation to read deeper.**

---

<p align="center"><em>📖 Step inside any book.</em></p>
