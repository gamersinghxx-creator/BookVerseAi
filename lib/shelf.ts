"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getSupabaseBrowser } from "./supabase/client";

export interface ShelfItem {
  slug: string;
  title: string;
  author: string;
  category: string;
  tagline: string;
  emoji: string;
}

// "My Shelf" with two transparent backends behind one identical hook:
//   • Signed out (or Supabase not configured) -> localStorage (instant, no account)
//   • Signed in -> a per-user `shelves` row in Supabase (syncs across devices)
// On sign-in, any local items are merged into the account once, then cleared.
// The useShelf() API ({ items, has, toggle, remove }) is unchanged, so no UI
// component needs to know which backend is active.

const KEY = "bookverse:shelf";

// ---- reactive store internals ---------------------------------------------

const listeners = new Set<() => void>();
let mode: "local" | "remote" = "local";
let currentUserId: string | null = null;
let remoteItems: ShelfItem[] = [];
let remoteSnapshot = "[]";
let authWired = false;

function emit() {
  listeners.forEach((l) => l());
}

// ---- localStorage backend --------------------------------------------------

function localRead(): ShelfItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function localWrite(items: ShelfItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

// ---- Supabase backend ------------------------------------------------------

function setRemoteItems(items: ShelfItem[]) {
  remoteItems = items;
  remoteSnapshot = JSON.stringify(items);
  emit();
}

async function enterRemote(userId: string) {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;

  currentUserId = userId;
  mode = "remote";

  // Load the account's existing shelf.
  const { data } = await supabase
    .from("shelves")
    .select("data")
    .eq("user_id", userId);
  let items: ShelfItem[] = (data ?? []).map((r) => r.data as ShelfItem);

  // One-time merge: push any local-only items up, then clear local.
  const local = localRead();
  const missing = local.filter((l) => !items.some((r) => r.slug === l.slug));
  if (missing.length) {
    await supabase.from("shelves").upsert(
      missing.map((it) => ({ user_id: userId, slug: it.slug, data: it })),
      { onConflict: "user_id,slug" }
    );
    items = [...missing, ...items];
    if (typeof window !== "undefined") localStorage.setItem(KEY, "[]");
  }

  setRemoteItems(items);
}

function enterLocal() {
  mode = "local";
  currentUserId = null;
  remoteItems = [];
  remoteSnapshot = "[]";
  emit();
}

async function remoteToggle(it: ShelfItem) {
  const supabase = getSupabaseBrowser();
  if (!supabase || !currentUserId) return;

  const exists = remoteItems.some((x) => x.slug === it.slug);
  if (exists) {
    setRemoteItems(remoteItems.filter((x) => x.slug !== it.slug));
    await supabase
      .from("shelves")
      .delete()
      .eq("user_id", currentUserId)
      .eq("slug", it.slug);
  } else {
    setRemoteItems([it, ...remoteItems]);
    await supabase
      .from("shelves")
      .upsert(
        { user_id: currentUserId, slug: it.slug, data: it },
        { onConflict: "user_id,slug" }
      );
  }
}

// Wire auth detection once (lazily, on first subscribe).
function ensureAuthSync() {
  if (authWired) return;
  const supabase = getSupabaseBrowser();
  if (!supabase) return; // auth not configured -> stay local forever
  authWired = true;

  supabase.auth.getUser().then(({ data }) => {
    if (data.user) void enterRemote(data.user.id);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) void enterRemote(session.user.id);
    else enterLocal();
  });
}

// Called by the auth UI right after sign-in to force a shelf resync/merge.
export async function mergeLocalShelfIntoAccount() {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (data.user) await enterRemote(data.user.id);
}

// ---- React binding ---------------------------------------------------------

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  ensureAuthSync();
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  if (mode === "remote") return remoteSnapshot;
  return localStorage.getItem(KEY) || "[]";
}

export function useShelf() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const items: ShelfItem[] = useMemo(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);

  const has = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const toggle = useCallback((it: ShelfItem) => {
    if (mode === "remote") {
      void remoteToggle(it);
    } else {
      const cur = localRead();
      const exists = cur.some((x) => x.slug === it.slug);
      localWrite(exists ? cur.filter((x) => x.slug !== it.slug) : [it, ...cur]);
    }
  }, []);

  const remove = useCallback((slug: string) => {
    if (mode === "remote") {
      const it = remoteItems.find((x) => x.slug === slug);
      if (it) void remoteToggle(it);
    } else {
      localWrite(localRead().filter((x) => x.slug !== slug));
    }
  }, []);

  return { items, has, toggle, remove };
}
