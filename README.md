# 📖 BookVerse AI

> **Step inside any book.** An immersive, AI-powered web app that transforms books into living study guides — structured summaries, timelines, mind maps, character graphs, conceptual sketches, and an AI tutor — all painted in light.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-E916B0?logo=framer)
![Ollama](https://img.shields.io/badge/Ollama-local_AI-lightgrey)
![License](https://img.shields.io/badge/License-Private-red)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Living Search** | Bloom-animated search bar — type any book title to summon it |
| **Rich Book Pages** | Overview, structured summary, chapter breakdown, key lessons |
| **Timeline** | Visual chronological thread of major events |
| **Mind Map** | Radial SVG mind map of core concepts |
| **Character Map** | Relationship graph for fiction titles |
| **Conceptual Sketches** | AI-concept placeholders (real SDXL/FLUX pipeline ready) |
| **AI Tutor** | Chat with a book-grounded AI (Ollama streaming or mock fallback) |
| **Generate Any Book** | Summon any title — AI writes a full study guide, cached forever |
| **My Shelf** | Bookmark books locally (localStorage, no account needed) |
| **Compare Mode** | Side-by-side comparison of two books |
| **Recently Summoned** | Home page rail showing AI-generated titles |
| **Embedded SQLite** | Zero-dep `node:sqlite` DB — auto-seeds + stores generated books |
| **SEO / PWA** | Sitemap, robots.txt, manifest, OG images, rich metadata |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** (for built-in `node:sqlite`; falls back to JSON file cache on older versions)
- **npm** (ships with Node)

### Install & Run

```bash
# Clone / navigate to the project
cd BookVerseAi

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Enable Real AI (Optional)

1. Install [Ollama](https://ollama.com/download)
2. Pull a model: `ollama pull llama3.2`
3. Start Ollama: `ollama serve` (usually auto-starts)
4. Start the app — the nav badge turns **green** ("AI live")

Without Ollama the app runs in **preview mode** with grounded mock responses — fully functional, no API keys needed.

---

## 🏗️ Tech Stack

| Layer | Technology | Status |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS 3, Framer Motion 11 | ✅ Live |
| **Icons** | Lucide React | ✅ Live |
| **Database** | `node:sqlite` (Node 22+, embedded, zero-dep) — JSON file cache fallback | ✅ Live |
| **AI (Text)** | Ollama (Llama 3.2 / Qwen / Mistral / Gemma) via API routes — mock fallback | ✅ Live |
| **AI (Image)** | Stable Diffusion XL / FLUX / ComfyUI | ⏳ Scaffold ready |
| **Backend** | .NET 9 Web API + EF Core (optional, Next routes already work) | ⏳ Documented |
| **Persistence** | PostgreSQL / Supabase (optional, replaces SQLite for hosted deploys) | ⏳ Documented |
| **Auth** | Supabase Auth (optional, per-user shelf sync) | ⏳ Documented |
| **Hosting** | Vercel (web) + Railway/Render (API) + Supabase (DB) | ⏳ Planned |

---

## 📂 Project Structure

```
BookVerseAi/
├── app/
│   ├── layout.tsx                 # Root layout — fonts, Nav, Footer, LiquidLight
│   ├── page.tsx                   # Home — Hero, LivingSearch, Library, Story
│   ├── globals.css                # Design system primitives + CSS tokens
│   ├── loading.tsx / error.tsx    # Route-level loading & error states
│   ├── not-found.tsx              # 404 with "summon any book" prompt
│   ├── manifest.ts / sitemap.ts / robots.ts   # PWA + SEO
│   ├── icon.tsx / opengraph-image.tsx          # Generated OG assets
│   ├── book/[slug]/              # Dynamic book pages (SSG for seed titles)
│   ├── shelf/                    # My Shelf page (localStorage)
│   ├── compare/                  # Side-by-side book comparison
│   └── api/
│       ├── chat/route.ts         # POST — AI tutor streaming
│       ├── generate/route.ts     # POST — generate a full book study guide
│       ├── books/route.ts        # GET  — list generated books
│       ├── library/route.ts      # GET  — search all books (?q=)
│       └── health/route.ts       # GET  — Ollama status + model info
│
├── components/
│   ├── Hero.tsx                  # Cinematic hero with kinetic typography
│   ├── LivingSearch.tsx          # Bloom-animated search + summoning overlay
│   ├── Library.tsx               # Constellation of BookOrbs
│   ├── BookOrb.tsx               # Orb-style book card with color aura
│   ├── Story.tsx                 # Scroll-story with ink thread
│   ├── Nav.tsx / Footer.tsx      # Navigation + footer
│   ├── AIStatus.tsx              # Live Ollama status badge in nav
│   ├── ShelfButton.tsx           # Bookmark toggle
│   ├── RecentlySummoned.tsx      # Home rail of AI-generated books
│   ├── book/                     # Book page sections:
│   │   ├── BookHeader.tsx        #   Header with cover orb + metadata
│   │   ├── Section.tsx           #   Reusable section wrapper
│   │   ├── Timeline.tsx          #   Chronological event thread
│   │   ├── MindMap.tsx           #   Radial SVG mind map
│   │   ├── CharacterMap.tsx      #   Character relationship graph
│   │   ├── Sketches.tsx          #   Conceptual AI sketch cards
│   │   ├── AITutor.tsx           #   Chat interface with streaming
│   │   └── Related.tsx           #   "Continue wandering" recommendations
│   └── fx/                       # Visual effects:
│       ├── LiquidLight.tsx       #   Canvas 2D ink field (cursor-reactive)
│       ├── Cursor.tsx            #   Trailing glow cursor
│       └── Reveal.tsx            #   Scroll-triggered reveal animation
│
├── lib/
│   ├── types.ts                  # Core domain model (mirrors API shape)
│   ├── books.ts                  # Seed library (4 public-domain titles)
│   ├── store.ts                  # Unified data layer — DB + cache + search
│   ├── db.ts                     # node:sqlite wrapper — auto-seeds on first run
│   ├── shelf.ts                  # localStorage shelf (useSyncExternalStore)
│   ├── related.ts                # Tag/category-based recommendations
│   ├── accents.ts                # Per-book colour accents
│   └── ai/
│       ├── index.ts              # Provider selection, JSON extraction, normalization
│       ├── config.ts             # AI runtime configuration
│       ├── ollama.ts             # Ollama HTTP client (streaming)
│       ├── prompts.ts            # System prompts for generation + chat
│       ├── mock.ts               # Offline fallback generator
│       └── types.ts              # AI-specific type definitions
│
├── types/
│   └── node-sqlite.d.ts          # Ambient types for node:sqlite
│
├── docs/
│   ├── PROJECT_BIBLE.md          # Living spec — vision, architecture, design system
│   ├── PROJECT_HANDOFF.md        # Current state, decisions log, next steps
│   └── BACKEND_AND_AUTH.md       # Setup guides for DB, .NET, auth, images
│
├── .bookverse-cache/             # SQLite DB + JSON file cache (gitignored)
├── package.json                  # Dependencies & scripts
├── tailwind.config.ts            # Design tokens — paper/ink palette + animations
├── tsconfig.json                 # TypeScript config (path alias @/*)
├── next.config.mjs               # Next.js configuration
└── postcss.config.mjs            # PostCSS (Tailwind + Autoprefixer)
```

---

## 🎨 Design System — "Liquid Light"

A warm-white "paper" world where colour behaves like living ink — soft blooms of sky blue, crimson, and leaf green that breathe and mix, reacting to the pointer.

### Palette

| Token | Hex | Usage |
|---|---|---|
| `paper` | `#FBF6EE` | Base background (warm ivory) |
| `paper-soft` | `#F5ECE0` | Card / glass surfaces |
| `paper-deep` | `#EDE1D2` | Deeper surface layers |
| `ink` | `#211A18` | Primary text (warm near-black) |
| `ink-soft` | `#5B4F49` | Secondary text |
| `ink-faint` | `#8A7C74` | Muted text / borders |
| `sky` | `#2E9BFF` | Accent — links, highlights |
| `crimson` | `#FF2E55` | Accent — warnings, emphasis |
| `leaf` | `#2ECB7C` | Accent — success, growth |
| `amber` | `#FFB13D` | Accent — warmth, attention |
| `iris` | `#7A5CFF` | Accent — creative, AI |

### Typography

| Role | Font | Usage |
|---|---|---|
| Display | **Fraunces** (serif) | Headings, hero text |
| UI/Labels | **Space Grotesk** | Buttons, navigation, pills |
| Body | **Inter** | Paragraphs, descriptions |

### Signature Effects

- **LiquidLight** — GPU-light Canvas 2D field of multiply-blended ink blooms (breathing, cursor-reactive)
- **Cursor** — Trailing ink glow that follows the pointer
- **Grain** — SVG paper-grain overlay for tactile warmth
- **Reveal** — Scroll-triggered Framer Motion entrance animations

### Accessibility

- Full `prefers-reduced-motion` fallbacks (canvas renders one static frame, transitions collapse)
- DPR capped at 1.5 for performance
- Canvas pauses when tab is hidden
- Skip-to-content link, `aria-hidden` on decorative elements
- Keyboard-focusable controls
- Warm charcoal on ivory contrast for readability

---

## 🔌 API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/chat` | AI tutor — streams book-grounded answers |
| `POST` | `/api/generate` | Generate a full study guide for any title |
| `GET` | `/api/books` | List all AI-generated books |
| `GET` | `/api/library?q=` | Search across all books (seed + generated) |
| `GET` | `/api/health` | Ollama status — provider, model, availability |

---

## 📊 Data Model

The core `Book` type (see [types.ts](file:///d:/MYPROJECTS/BookVerseAi/lib/types.ts)) carries:

- **Metadata** — `slug`, `title`, `author`, `year`, `category`, `tags`, `cover`, `tagline`, `readingTime`, `rating`, `cached`
- **Content** — `overview`, `summary[]`, `chapters[]`, `lessons[]`
- **Visual** — `timeline[]`, `characters[]`, `mindMap[]`, `sketches[]`
- **Interactive** — `qa[]` (pre-baked Q&A for tutor grounding)

This shape intentionally mirrors what a real AI-generation backend would return, enabling the swap from mock → live API with no component changes.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
# AI runtime: "ollama" (default) or "mock"
AI_PROVIDER=ollama

# Local Ollama server
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2

# Probe timeout before fallback (ms)
AI_PROBE_TIMEOUT_MS=1500

# Public site URL (used for canonical URLs, sitemap, OG)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Optional (see docs/BACKEND_AND_AUTH.md) ---
# SUPABASE_URL=
# SUPABASE_SERVICE_ROLE_KEY=
# NEXT_PUBLIC_API_URL=http://localhost:5080
# IMAGE_API_URL=http://127.0.0.1:8188
```

---

## 🗺️ Roadmap

### Phase 1 — Frontend MVP ✅
- Animated home page with living search
- Rich book pages for 4 public-domain titles
- Responsive "Liquid Light" design system
- Mock data layer mirroring future API shape

### Phase 2 — Live AI ✅
- Ollama integration for text generation + tutor chat
- Generate-any-book flow with cache
- Embedded SQLite database (`node:sqlite`)
- AI status badge in navigation
- My Shelf, Compare mode, Recently Summoned

### Phase 3 — Production Infrastructure ⏳
- PostgreSQL / Supabase persistence
- Real image generation (SDXL / FLUX / ComfyUI)
- Authentication + per-user shelf sync
- .NET 9 backend (optional)

### Phase 4 — Growth 🔮
- Audio narration
- Personalized recommendations engine
- Gamification (reading streaks, quizzes)
- Community features
- Mobile app
- Classroom edition

---

## 📚 Sample Books (Seed Library)

Public-domain titles included out-of-the-box:

| Title | Author | Category |
|---|---|---|
| The Art of War | Sun Tzu | Non-fiction |
| Meditations | Marcus Aurelius | Non-fiction |
| Pride and Prejudice | Jane Austen | Fiction |
| Frankenstein | Mary Shelley | Fiction |

Summaries are transformative and educational — they encourage reading the originals.

---

## ⚖️ Legal Posture

- **Transformative, not reproductive** — summaries paraphrase and teach; they never reproduce copyrighted text
- **Public-domain first** — seed library uses only public-domain works
- **Attribution** — every book page attributes the original author and encourages buying/reading the original
- **Disclaimer** — book page footers include transformative-use notices

---

## 📖 Documentation

| Document | Description |
|---|---|
| [PROJECT_BIBLE.md](file:///d:/MYPROJECTS/BookVerseAi/docs/PROJECT_BIBLE.md) | Living spec — vision, principles, architecture, design system, roadmap |
| [PROJECT_HANDOFF.md](file:///d:/MYPROJECTS/BookVerseAi/docs/PROJECT_HANDOFF.md) | Current state, decisions log, detailed next steps |
| [BACKEND_AND_AUTH.md](file:///d:/MYPROJECTS/BookVerseAi/docs/BACKEND_AND_AUTH.md) | Setup guides for Postgres, .NET backend, auth, image generation |

---

## 🤝 Contributing

This is a private project. For questions or contributions, reach out to the project maintainer.

---

## 📊 Success Metrics

- Search-to-read conversion rate
- Time on page
- Repeat user rate
- Cache hit rate
- User satisfaction scores

---

<p align="center">
  <em>Built with ❤️ — transforming books into interactive learning experiences.</em>
</p>
