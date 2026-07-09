"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseAuthEnabled } from "./env";

// Singleton browser Supabase client. Returns null when auth is not configured,
// so callers can degrade gracefully (e.g. the shelf stays on localStorage).

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!supabaseAuthEnabled) return null;
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}
