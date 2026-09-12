# Pending — do these next

Things that can't be done from the codebase alone: they need your accounts and
keys. Everything else in the rebuild is complete (`docs/CHANGELOG.md`).

Ordered by priority. Check them off as you go.

## Already verified (no action needed)

- [x] `npm run check` — typecheck + lint (2 non-blocking warnings) + **41 unit tests** green
- [x] `npm run build` — clean, all 20 routes present, 10 seed book pages SSG
- [x] `npx playwright test` — **40 e2e tests** green (desktop + mobile): core pages,
      real 404, API error envelope, health, search → navigate, shelf add/remove,
      reduced-motion cursor, journey + CTA, tutor answering, route progress,
      account redirect + delete API, guide actions (generated vs seed), report
      route, compare deep-link, search ranking, new seed titles
- [x] `npm audit` — 0 vulnerabilities

---

## 1. Rotate the exposed Groq key  · P1 · ~5 min

The previous `GROQ_API_KEY` was exposed to tooling — treat it as compromised.

- [ ] Delete the old key at <https://console.groq.com/keys>
- [ ] Create a new key
- [ ] Put it in `.env.local`:
      ```
      AI_PROVIDER=groq
      GROQ_API_KEY=gsk_...your-new-key...
      ```
- [ ] Verify: `npm run dev`, then `curl -s localhost:3000/api/health` →
      `"available":true,"modelReady":true`
- [ ] If `modelReady` is false, the default model changed — list the live ones:
      `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`
      and set `GROQ_MODEL=` to a current text model.

## 2. Create a fresh Supabase project  · P1 · ~15 min

The old project's domain no longer resolves. Full steps: `DEPLOY.md §2–4`.

- [ ] <https://supabase.com> → New project
- [ ] **SQL Editor** → paste + run `supabase/schema.sql`
- [ ] **Project Settings → API** → copy the 3 values into `.env.local`:
      ```
      NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
      NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...      # anon / public
      SUPABASE_SERVICE_ROLE_KEY=eyJ...          # SECRET — server only
      ```
- [ ] **Authentication → URL Configuration** → Site URL `http://localhost:3000`,
      add redirect `http://localhost:3000/auth/callback`
- [ ] Set `ADMIN_EMAILS=your@email.com` in `.env.local` (so you can delete bad guides)
- [ ] Verify: `npm run dev` → nav shows "Sign in"; generate a book → a row
      appears in the Supabase `books` table; sign in via the magic link →
      bookmarking a book adds a row to `shelves`
- [ ] Verify graceful degradation still works: comment the 3 Supabase vars out →
      app runs identically on SQLite + localStorage

## 3. Run the generation-quality eval  · P2 · ~5 min + a few cents

- [ ] `AI_PROVIDER=groq GROQ_API_KEY=$GROQ_API_KEY npm run eval`
- [ ] Record the baseline (structure % / accuracy %). Target: avg accuracy ≥ 85%.
- [ ] If low, tune `lib/ai/prompts.ts` and/or try `GROQ_MODEL=qwen/qwen3.6-27b`,
      then re-run.

## 4. Before any real traffic  · P1

- [ ] **Error tracking** — add Sentry: `npm i @sentry/nextjs`, then in
      `instrumentation.ts` register `setErrorSink(...)` behind `SENTRY_DSN`
      (there's a commented example in the file). Server errors already flow
      through `reportError`.
- [ ] **Shared rate limiter** — the current limiter is per-serverless-instance.
      For a multi-instance deploy, swap the `hit()` internals in
      `lib/rate-limit.ts` for an Upstash Ratelimit call (`@upstash/ratelimit` +
      `@upstash/redis`). The `checkRateLimit` signature stays the same.
- [ ] Decide `RATE_LIMIT_GENERATE_PER_DAY` for your budget (default 60/IP/day).

## 5. Deploy to Vercel  · P1

Full walkthrough: `DEPLOY.md §5`. Env vars needed in Vercel:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `AI_PROVIDER=groq`,
`GROQ_API_KEY`, `ADMIN_EMAILS`. Then update the Supabase Site URL / redirect to
the Vercel domain and redeploy.

- [ ] Post-deploy checklist in `DEPLOY.md §6`

## 6. Manual end-to-end walkthrough (after keys are in)  · ~15 min

The automated suite covers all of this, but do one human pass with real AI:

- [ ] Home loads; hero, library (10 books), journey, closing CTA all render
- [ ] Search "Medit" → suggestion → book page
- [ ] Summon a real title (e.g. "Atomic Habits") → generation → book page with a
      real guide (not the mock preview); every section populated
- [ ] On that generated page: **Regenerate** works; **Report an issue** records;
      (as an admin) **Delete guide** removes it and redirects to the library
- [ ] Open a seed book (e.g. Meditations) → no guide-actions controls; all
      sections render; **mind map** and **timeline** look right
- [ ] AI tutor: ask a question → markdown answer streams; **Stop** works;
      navigate away and back → conversation persisted; **clear** empties it
- [ ] Save 2 books to the shelf → `/shelf` shows them → remove one
- [ ] `/compare` → pick two books → URL updates to `?a=&b=` → open that URL in a
      new tab → same comparison restored
- [ ] Sign in (magic link) → shelf syncs; `/account` → email shown; sign out
- [ ] `/account` while signed out → redirects home
- [ ] `/book/not-a-real-slug` → styled 404 (and `curl -I` shows **404**, not 200)
- [ ] Rate limit: hammer the search "Summon" ~7 times fast → a friendly
      "try again in ~1 min" message
- [ ] Toggle OS "reduce motion" → hero/sections still fully visible, cursor visible
- [ ] Mobile viewport → nav, hero, book page, tutor all usable

## 7. Optional / later

- [ ] `LICENSE` is "all rights reserved" — swap for MIT / a commercial licence if
      that's not what you want.
- [ ] `AGENTS.md` / `CLAUDE.md` are gitignored (Next regenerates them). Keep, or
      set `agentRules: false` in `next.config.mjs`.
- [ ] Curate more seed books into `lib/books.ts` (public-domain only).
- [ ] Rest of the backlog: `docs/BOARD.md`.

---

_Everything above is tracked in `docs/BOARD.md` too; this file is the short list._
