# BookVerse AI — Launch Guide

Step-by-step to take BookVerse from local to a live production deployment on
**Vercel + Supabase**, with real accounts and a synced shelf. Each section is a
few minutes.

> **Design guarantee:** every hosted feature is env-gated. With none of the keys
> below set, the app runs fully on the offline mock AI, embedded SQLite, and a
> localStorage shelf. Add the keys and hosted persistence, auth, and the
> cross-device shelf switch on — no code changes.

---

## 1. Verify the build locally

```powershell
npm install
npm run check     # typecheck + lint + unit tests
npm run build     # production build
npm run dev       # http://localhost:3000 — runs fully with no keys
```

Optional, once, for end-to-end tests: `npx playwright install chromium` then
`npm run test:e2e`.

`.gitignore` excludes `.env*.local`, `node_modules`, `.next`, `.bookverse-cache`,
test output, and `AGENTS.md`/`CLAUDE.md` (Next regenerates those), so no secrets
or build artifacts get committed. The "Sign in" control and hosted persistence
only appear once the Supabase env vars are present.

---

## 2. Create the Supabase project

1. https://supabase.com → **New project** (free tier is fine). Pick a region
   close to your users; save the database password.
2. When it finishes provisioning: **SQL Editor → New query**, paste the entire
   contents of [`supabase/schema.sql`](supabase/schema.sql), **Run**. This creates:
   - `books` — the hosted "generate once, serve forever" cache (RLS on, no
     policies → service-role only).
   - `shelves` — per-user bookmarks with Row Level Security (each user sees only
     their own rows).
3. **Project Settings → API** → copy three values:

   | Dashboard label | Env var |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ The `service_role` key bypasses RLS. Keep it server-side only — never commit
> it, never prefix it with `NEXT_PUBLIC_`.

---

## 3. Configure Auth providers

Supabase dashboard → **Authentication**:

1. **URL Configuration**
   - **Site URL:** `http://localhost:3000` for now (your domain at deploy).
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` and
     `https://YOUR-DOMAIN/auth/callback` (the latter once you know the Vercel URL).
2. **Providers → Email:** enabled by default — powers magic-link sign-in.
3. **Providers → Google (optional):** create an OAuth client in Google Cloud
   Console, paste the client ID/secret here, add Supabase's callback URL as an
   authorized redirect URI. Skipping this leaves the magic-link flow working on
   its own.

---

## 4. Wire it up locally and test

`cp .env.example .env.local` and fill in at least:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # anon / public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # service_role (secret)

# Real AI (optional locally):
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

`npm run dev`, then check:

- The nav shows **Sign in**.
- Generate a book → a row appears in Supabase **Table Editor → books**.
- Sign in via the magic link; bookmark a book → a row appears in **shelves**.
  Pre-existing local bookmarks merge in automatically on first sign-in.
- Sign out → the shelf falls back to localStorage; sign in elsewhere and your
  books follow you.
- With the Supabase project paused or unreachable, the app still loads fast —
  it degrades to SQLite within ~3s and stops retrying for 30s (`lib/resilience.ts`).

---

## 5. Deploy to Vercel

1. Push to GitHub:
   ```powershell
   git remote add origin https://github.com/<you>/bookverse-ai.git
   git branch -M main
   git push -u origin main
   ```
2. https://vercel.com → **Add New → Project** → import the repo. Framework
   auto-detects as **Next.js**; keep the defaults.
3. **Environment Variables** (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your final URL (e.g. `https://bookverse.vercel.app`)
   - `AI_PROVIDER=groq` and `GROQ_API_KEY=...` (see below)
   - `ADMIN_EMAILS=you@example.com` — who can delete bad generated guides
   - Optional: `RATE_LIMIT_GENERATE_PER_DAY` etc. (defaults are 60/day generate,
     400/day chat per IP), `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, and a `SENTRY_DSN`
     once you've wired a sink in `instrumentation.ts`.
4. **Deploy.**
5. Back in Supabase → **Authentication → URL Configuration**: set **Site URL** to
   your Vercel domain, add `https://YOUR-DOMAIN/auth/callback` to the redirect
   URLs. Update `NEXT_PUBLIC_SITE_URL` in Vercel to match, redeploy.

### AI in production

Ollama runs on *your* machine, so serverless Vercel can't reach it — use a
hosted provider (already wired):

- **Recommended:** `AI_PROVIDER=groq` + `GROQ_API_KEY`. Default model
  `openai/gpt-oss-120b`. Results cache to Supabase so repeat requests are instant
  and free. Override with `GROQ_MODEL`, or switch to `gemini` / `openai` (+ that
  provider's key). See `.env.example`.
- The nav badge and `/api/health` verify the model against the provider's
  `/models` list. If you see "Model unavailable", set a current `GROQ_MODEL`
  (`curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`).
- **Fallback:** with no provider key, the app serves clearly-labelled mock
  previews — it never hard-fails.
- ⚠️ An open `/api/generate` behind a hosted key is a spend risk. Add rate
  limiting / a cost ceiling before a public launch (`docs/BOARD.md`).

Why Postgres matters here: Vercel's filesystem is ephemeral, so the SQLite file
resets on every deploy. The Supabase adapter is auto-selected when
`SUPABASE_SERVICE_ROLE_KEY` is set.

---

## 6. Post-deploy verification

On the live URL:

- [ ] Home, a seed book page, `/shelf`, `/compare` load (200).
- [ ] `/book/<random-nonsense>` returns a real **404**.
- [ ] `/api/health` returns JSON; the badge state matches (`groq` + `modelReady`
      if you set a valid model, else `mock`).
- [ ] `/api/generate` with `{}` returns a 400 with `{ error: { code, requestId } }`.
- [ ] Sign in via magic link on the production domain succeeds and redirects home.
- [ ] Bookmark a book → row in Supabase `shelves`.
- [ ] Generate a title → row in Supabase `books`; reload serves it instantly.
- [ ] `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` respond.

---

## Intentionally deferred (post-launch)

- **Real image generation** for the concept sketches — scaffold in
  `docs/BACKEND_AND_AUTH.md §3`. Polished placeholders for v1.
- **Separate .NET backend** — optional; the Next.js API routes are the backend.
- **Dark theme** — the identity is light-only for now.

See `docs/BOARD.md` for the full backlog.

---

_Last updated: 2026-09-08 — post-rebuild._
