-- BookVerse AI — Supabase / Postgres schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- Safe to re-run: everything uses IF NOT EXISTS / idempotent policies.

-- =============================================================================
-- 1. Book cache  —  "generate once, serve forever"
-- =============================================================================
-- Written only by the server using the SERVICE ROLE key (bypasses RLS), so the
-- table is locked down: no anon/public access. The full Book object lives in
-- `data` (jsonb); the flat columns exist for cheap listing/sorting.

create table if not exists public.books (
  slug        text primary key,
  title       text,
  author      text,
  category    text,
  tagline     text,
  emoji       text,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists books_created_at_idx
  on public.books (created_at desc);

alter table public.books enable row level security;
-- No policies -> only the service role (server) can read/write. Intended.

-- =============================================================================
-- 2. Per-user shelves  —  synced bookmarks
-- =============================================================================
-- One row per (user, book). Row Level Security ensures each user can only see
-- and modify their own rows. The client talks to this table directly with the
-- user's session (anon key + JWT).

create table if not exists public.shelves (
  user_id     uuid not null references auth.users (id) on delete cascade,
  slug        text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.shelves enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'shelves'
      and policyname = 'shelves_select_own'
  ) then
    create policy shelves_select_own on public.shelves
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'shelves'
      and policyname = 'shelves_insert_own'
  ) then
    create policy shelves_insert_own on public.shelves
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'shelves'
      and policyname = 'shelves_update_own'
  ) then
    create policy shelves_update_own on public.shelves
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'shelves'
      and policyname = 'shelves_delete_own'
  ) then
    create policy shelves_delete_own on public.shelves
      for delete using (auth.uid() = user_id);
  end if;
end $$;
