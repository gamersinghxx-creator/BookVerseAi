import { getSupabaseServer } from "./supabase/server";
import { ApiError } from "./http";

// Admin = an email in the ADMIN_EMAILS allowlist (comma-separated). Requires
// Supabase auth to be configured. There is no admin without an explicit list.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function adminEnabled(): boolean {
  return ADMIN_EMAILS.length > 0;
}

// Soft check for UI gating — returns false instead of throwing.
export async function isAdminUser(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const supabase = await getSupabaseServer();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return Boolean(email && ADMIN_EMAILS.includes(email));
}

// Throws ApiError unless the caller is a signed-in admin. Returns the admin email.
export async function requireAdmin(): Promise<string> {
  if (!adminEnabled()) {
    throw new ApiError(501, "admin_not_configured", "No admin list is configured (ADMIN_EMAILS)");
  }
  const supabase = await getSupabaseServer();
  if (!supabase) {
    throw new ApiError(501, "auth_not_configured", "Admin actions need Supabase auth");
  }
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new ApiError(403, "forbidden", "Admin access required");
  }
  return email;
}
