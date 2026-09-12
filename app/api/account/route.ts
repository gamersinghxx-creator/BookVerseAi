import { route, ApiError } from "@/lib/http";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { track } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Permanently delete the signed-in user's account. Their `shelves` rows are
// removed by the `on delete cascade` in supabase/schema.sql.
export const DELETE = route("account.delete", async (_req, ctx) => {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    throw new ApiError(501, "auth_not_configured", "Accounts are not enabled on this deployment");
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new ApiError(401, "unauthenticated", "You must be signed in");
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new ApiError(501, "admin_not_configured", "Account deletion needs the service-role key");
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(data.user.id);
  if (delErr) {
    throw new ApiError(502, "delete_failed", "Could not delete the account — try again");
  }

  await supabase.auth.signOut();
  ctx.log.info("account.deleted", { userId: data.user.id });
  track("account.deleted");
  return ctx.json({ ok: true });
});
