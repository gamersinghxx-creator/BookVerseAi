"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldAlert, Loader2, Mail } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button, Card } from "@/components/ui";

export function AccountClient({ email }: { email: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState<"signout" | "delete" | null>(null);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy("signout");
    await supabase?.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function deleteAccount() {
    if (confirm.trim().toLowerCase() !== "delete") return;
    setBusy("delete");
    setError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not delete the account");
      }
      router.push("/?account=deleted");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <Card className="p-6">
        <p className="eyebrow mb-3">Signed in as</p>
        <p className="flex items-center gap-2 font-grotesk text-lead text-ink">
          <Mail size={18} className="text-ink-faint" aria-hidden />
          {email}
        </p>
        <p className="mt-3 text-body-sm text-ink-soft">
          You signed in with a magic link. Your shelf syncs to this account across
          devices.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-5"
          onClick={signOut}
          disabled={busy !== null}
        >
          {busy === "signout" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <LogOut size={15} aria-hidden />}
          Sign out
        </Button>
      </Card>

      <Card className="border-crimson/20 p-6">
        <p className="flex items-center gap-2 font-grotesk font-semibold text-crimson-ink">
          <ShieldAlert size={18} aria-hidden />
          Delete account
        </p>
        <p className="mt-2 text-body-sm text-ink-soft">
          This permanently deletes your account and your synced shelf. It cannot
          be undone. Generated book guides are shared and stay in the library.
        </p>
        <label className="mt-4 block text-body-sm text-ink-soft">
          Type <span className="font-semibold text-ink">delete</span> to confirm
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded-field border border-ink/12 bg-paper/70 px-4 py-2.5 font-grotesk text-body-sm text-ink outline-none focus:border-crimson/50"
            aria-label="Type delete to confirm account deletion"
          />
        </label>
        {error && <p className="mt-3 text-body-sm text-crimson-ink">{error}</p>}
        <button
          onClick={deleteAccount}
          disabled={confirm.trim().toLowerCase() !== "delete" || busy !== null}
          className="btn-primary mt-4 disabled:opacity-40"
        >
          {busy === "delete" ? <Loader2 size={15} className="animate-spin" aria-hidden /> : null}
          Permanently delete
        </button>
      </Card>
    </div>
  );
}
