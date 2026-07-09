import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client for the SERVER-SIDE book cache. It bypasses Row
// Level Security, so it must never be imported into client code. Referencing
// SUPABASE_SERVICE_ROLE_KEY (a non-NEXT_PUBLIC var) keeps it out of the browser
// bundle — Next replaces it with undefined on the client.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// The server book cache needs the URL + service-role key.
export const supabaseCacheEnabled = Boolean(URL && SERVICE_ROLE);

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseCacheEnabled) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
