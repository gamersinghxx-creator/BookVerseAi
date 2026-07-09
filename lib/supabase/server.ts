import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabaseAuthEnabled } from "./env";

// Server-side Supabase client bound to the request cookies (App Router).
// Returns null when auth is not configured. Server components cannot always
// write cookies; the middleware (middleware.ts) refreshes the session, so a
// throw during setAll is safe to ignore here.

export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!supabaseAuthEnabled) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Invoked from a Server Component â€” middleware handles the refresh.
        }
      },
    },
  });
}

