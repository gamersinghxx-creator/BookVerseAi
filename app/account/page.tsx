import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AccountClient } from "@/components/account/AccountClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account — BookVerse AI" };

export default async function AccountPage() {
  const supabase = await getSupabaseServer();
  // Auth not configured on this deployment — no account to manage.
  if (!supabase) redirect("/");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/?auth_required=1");

  return (
    <div className="u-container min-h-[70vh] pb-16 pt-32">
      <h1 className="display mb-10 text-display font-black text-ink">Your account</h1>
      <AccountClient email={data.user.email ?? "(no email)"} />
    </div>
  );
}
