"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Flag, Trash2, Loader2, Check } from "lucide-react";
import { track } from "@/lib/analytics";

type Reason = "inaccurate" | "low-quality" | "inappropriate" | "other";
const REASONS: { value: Reason; label: string }[] = [
  { value: "inaccurate", label: "Inaccurate" },
  { value: "low-quality", label: "Low quality" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Something else" },
];

// Footer controls on a generated book page: regenerate a poor guide, report an
// issue, and (for admins) delete it. Hidden entirely for curated seed books.
export function GuideActions({
  slug,
  title,
  isSeed,
  isAdmin,
}: {
  slug: string;
  title: string;
  isSeed: boolean;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"regen" | "report" | "delete" | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [msg, setMsg] = useState("");

  if (isSeed) return null;

  async function regenerate() {
    setBusy("regen");
    setMsg("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, force: true }),
      });
      const data = await res.json();
      if (res.status === 429) {
        const secs = data?.error?.details?.retryAfterSec ?? 60;
        throw new Error(`Try again in ~${Math.ceil(secs / 60)} min.`);
      }
      if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't regenerate.");
      track("regenerate", { slug });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Couldn't regenerate.");
    } finally {
      setBusy(null);
    }
  }

  async function report(reason: Reason) {
    setBusy("report");
    try {
      await fetch(`/api/books/${slug}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      track("report_guide", { slug, reason });
      setReported(true);
      setReporting(false);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm(`Delete the generated guide for "${title}"? This can't be undone.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/books/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.error?.message ?? "Delete failed.");
      }
      router.push("/#library");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Delete failed.");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 border-t border-ink/10 pt-8 text-center">
      <p className="text-xs text-ink-faint">
        This is an AI-generated guide. Not quite right?
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={regenerate}
          disabled={busy !== null}
          className="pill hover:border-ink/25 hover:text-ink disabled:opacity-40"
        >
          {busy === "regen" ? (
            <Loader2 size={12} className="animate-spin" aria-hidden />
          ) : (
            <RefreshCw size={12} aria-hidden />
          )}
          Regenerate
        </button>

        {reported ? (
          <span className="pill text-leaf-ink">
            <Check size={12} aria-hidden /> Thanks — noted
          </span>
        ) : (
          <button
            onClick={() => setReporting((v) => !v)}
            disabled={busy !== null}
            className="pill hover:border-ink/25 hover:text-ink disabled:opacity-40"
          >
            <Flag size={12} aria-hidden />
            Report an issue
          </button>
        )}

        {isAdmin && (
          <button
            onClick={remove}
            disabled={busy !== null}
            className="pill text-crimson-ink hover:border-crimson/30 disabled:opacity-40"
          >
            {busy === "delete" ? (
              <Loader2 size={12} className="animate-spin" aria-hidden />
            ) : (
              <Trash2 size={12} aria-hidden />
            )}
            Delete guide
          </button>
        )}
      </div>

      {reporting && !reported && (
        <div className="flex flex-wrap justify-center gap-2">
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => report(r.value)}
              disabled={busy !== null}
              className="pill hover:border-ink/25 hover:text-ink disabled:opacity-40"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      {msg && <p className="text-xs text-crimson-ink">{msg}</p>}
    </div>
  );
}
