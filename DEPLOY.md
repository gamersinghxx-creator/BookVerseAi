# BookVerse AI — Launch Guide (Phase 3)

This is the step-by-step to take BookVerse from a local MVP to a live,
production deployment on **Vercel + Supabase**, with real accounts and a
synced shelf. Follow it top to bottom; each section is a few minutes.

> **Design guarantee:** every Supabase feature is env-gated. Until you set the
> keys below, the app runs exactly as before (SQLite + localStorage, no login).
> Add the keys and the hosted DB, auth, and cross-device shelf switch on — no
> code changes required.

---

## 0. One-time local cleanup

A partial `.git` folder and an empty `_write_test.txt` may exist from tooling.
In the project root (PowerShell), remove them, then start a clean repo:

```powershell
cd D:\MYPROJECTS\BookVerseAi
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
Remove-Item -Force _write_test.txt -ErrorAction SilentlyContinue

git init
git add .
git commit -m "BookVerse AI — Phase 3 (Supabase persistence, auth, synced shelf)"
```

`.gitignore` already excludes `.env*.local`, `node_modules`, `.next`, and
`.bookverse-cache`, so no secrets or build artifacts are committed.

---

## 1. Install dependencies

Two packages were added (`@supabase/supabase-js`, `@supabase/ssr`):

```powershell
npm install
```

### Verify nothing broke (still fully local, no keys yet)

```powershell
npm run build     # should pass
npm run dev       # http://localhost:3000 — works as before, no Sign in button
```

The "Sign in" control only appears once the Supabase env vars are present, so
its absence here is expected.

---

## 2. Create the Supabase project

1. Go to https://supabase.com → **New project** (free tier is fine). Pick a
   region close to your users; save the database password.
2. When it finishes provisioning, open **SQL Editor → New query**, paste the
   entire contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   This creates:
   - `books` — the hosted "generate once, serve forever" cache (server-only, RLS locked).
   - `shelves` — per-user bookmarks with Row Level Security (each user sees only their own).
3. Open **Project Settings → API** and copy three values:
   | Dashboard label | Env var |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ The `service_role` key bypasses RLS. Keep it server-side only — never
> commit it, never prefix it with `NEXT_PUBLIC_`.

---

## 3. Configure Auth providers

In the Supabase dashboard → **Authentication**:

1. **URL Configuration**
   - **Site URL:** `http://localhost:3000` for now (change to your domain at deploy).
   - **Redirect URLs:** add both
     - `http://localhost:3000/auth/callback`
     - `https://YOUR-DOMAIN/auth/callback` (add after you know the Vercel URL)
2. **Providers → Email:** enabled by default — this powers the magic-link sign-in.
3. **Providers → Google (optional):** to enable the "Continue with Google"
   button, create an OAuth client in Google Cloud Console, then paste the client
   ID/secret here and add Supabase's callback URL as an authorized redirect URI.
   If you skip this, the magic-link email flow still works on its own.

---

## 4. Wire it up locally and test

Create `.env.local` (copy from `.env.example`) and fill in:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
AI_PROBE_TIMEOUT_MS=1500
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # anon/public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # service_role (secret)
```

Then:

```powershell
npm run dev
```

Test checklist:
- The nav now shows **Sign in**.
- Generate a book — it should now persist to the Supabase `books` table
  (check **Table Editor → books** in the dashboard).
- Sign in via the magic link; bookmark a book; confirm a row appears in
  **shelves**. Any pre-existing local bookmarks merge in automatically on first
  sign-in.
- Sign out — the shelf falls back to localStorage; sign in elsewhere and your
  saved books follow you.

---

## 5. Deploy to Vercel

1. Push the repo to GitHub (create an empty repo, then):
   ```powershell
   git remote add origin https://github.com/<you>/bookverse-ai.git
   git branch -M main
   git push -u origin main
   ```
2. On https://vercel.com → **Add New → Project** → import the repo. Framework is
   auto-detected as **Next.js**; keep the defaults.
3. **Environment Variables** — add each of these (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your final URL (e.g. `https://bookverse.vercel.app`)
   - `AI_PROVIDER=groq` and `GROQ_API_KEY=...` **(see AI note below)**
4. **Deploy.**
5. Back in Supabase → **Authentication → URL Configuration**: set **Site URL**
   to your Vercel domain and add `https://YOUR-DOMAIN/auth/callback` to the
   redirect URLs. Update `NEXT_PUBLIC_SITE_URL` in Vercel to match, and redeploy.

### AI in production

Ollama runs on *your* machine, so a serverless Vercel deployment can't reach it.
Use a hosted provider instead (already wired):

- **Recommended:** `AI_PROVIDER=groq` + `GROQ_API_KEY` in the Vercel env vars.
  Real generation and tutor chat run on Groq's API; results cache to Supabase so
  repeat requests are instant and free. Switch models with `GROQ_MODEL`, or swap
  providers entirely by changing `AI_PROVIDER` to `gemini` / `openai` (+ that
  provider's key). See `.env.example` for all options.
- **Fallback:** with no provider key set, the app serves clearly-labelled mock
  previews — it never hard-fails.

Why Postgres matters here: Vercel's filesystem is ephemeral, so the local SQLite
file would reset on every deploy. The Supabase adapter (auto-selected when
`SUPABASE_SERVICE_ROLE_KEY` is set) gives you durable persistence.

---

## 6. Post-deploy verification

On the live URL, confirm:

- [ ] Home, a seed book page, `/shelf`, `/compare` all load (200).
- [ ] `/api/health` returns JSON (provider `mock` unless you wired remote Ollama).
- [ ] Sign in via magic link on the production domain succeeds and redirects home.
- [ ] Bookmark a book → row appears in Supabase `shelves`.
- [ ] Generate a title → row appears in Supabase `books`; reload serves it instantly.
- [ ] `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` respond.

---

## What's intentionally deferred (post-launch)

- **Real image generation** for the concept sketches (SDXL / FLUX / ComfyUI) —
  scaffold in `docs/BACKEND_AND_AUTH.md §3`. Kept as polished placeholders for v1
  to preserve the near-zero-cost goal.
- **Separate .NET backend** — optional; the Next.js API routes are production-ready.

---

_Last updated: 2026-07-09 — Phase 3 (Supabase + Vercel, auth, synced shelf)._
