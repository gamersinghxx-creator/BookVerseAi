"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { LogIn, LogOut, Loader2, Mail, Check, UserRound } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { mergeLocalShelfIntoAccount } from "@/lib/shelf";

// Sign-in / sign-out control for the nav. Renders nothing when auth is not
// configured, so the app looks identical until Supabase env vars are set.
// Signed out: a popover with a magic-link email field + Google OAuth.
// Signed in: the account email + a sign-out button.

export function AuthButton() {
  const supabase = getSupabaseBrowser();

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user?.email ?? null;
      setEmail(next);
      setReady(true);
      if (session?.user) {
        setOpen(false);
        void mergeLocalShelfIntoAccount().catch(() => {});
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Close the popover on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!supabase) return null;

  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function sendMagicLink(e: FormEvent) {
    e.preventDefault();
    if (!supabase || !input.trim()) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: input.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    setSending(false);
    if (!error) setSent(true);
  }

  async function signInGoogle() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
  }

  if (!ready) {
    return (
      <span className="flex h-8 w-8 items-center justify-center text-ink-faint">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      </span>
    );
  }

  // Signed in.
  if (email) {
    return (
      <div ref={wrapRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-paper-soft px-3 py-1.5 font-grotesk text-[13px] text-ink-soft transition hover:text-ink"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-iris text-[11px] font-bold text-paper mix-blend-multiply">
            {email[0]?.toUpperCase()}
          </span>
          <span className="hidden max-w-[9rem] truncate sm:inline">{email}</span>
        </button>
        {open && (
          <div className="glass absolute right-0 top-11 z-50 w-56 rounded-2xl p-3">
            <p className="truncate px-1 pb-2 font-grotesk text-xs text-ink-faint">
              {email}
            </p>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-grotesk text-sm text-ink-soft transition hover:bg-paper-deep hover:text-ink"
            >
              <UserRound className="h-4 w-4" aria-hidden />
              Account
            </Link>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-grotesk text-sm text-ink-soft transition hover:bg-paper-deep hover:text-ink"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Signed out.
  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          setSent(false);
        }}
        className="flex items-center gap-1.5 rounded-full bg-paper-soft px-3 py-1.5 font-grotesk text-[13px] text-ink-soft transition hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <LogIn className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Sign in</span>
      </button>
      {open && (
        <div className="glass absolute right-0 top-11 z-50 w-72 rounded-2xl p-4">
          {sent ? (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf text-paper mix-blend-multiply">
                <Check className="h-5 w-5" aria-hidden />
              </span>
              <p className="font-grotesk text-sm text-ink">Check your inbox</p>
              <p className="font-body text-xs text-ink-faint">
                We sent a sign-in link to {input.trim()}.
              </p>
            </div>
          ) : (
            <>
              <p className="pb-3 font-grotesk text-sm font-semibold text-ink">
                Sign in to sync your shelf
              </p>
              <form onSubmit={sendMagicLink} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
                  <Mail className="h-4 w-4 text-ink-faint" aria-hidden />
                  <input
                    type="email"
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent font-body text-sm text-ink outline-none placeholder:text-ink-faint"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="btn-primary justify-center py-2 text-[13px] disabled:opacity-60"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    "Send magic link"
                  )}
                </button>
              </form>
              <div className="my-3 flex items-center gap-3 text-ink-faint">
                <span className="h-px flex-1 bg-ink-faint/20" />
                <span className="font-grotesk text-[11px] uppercase tracking-wide">
                  or
                </span>
                <span className="h-px flex-1 bg-ink-faint/20" />
              </div>
              <button
                onClick={signInGoogle}
                className="btn-ghost w-full justify-center py-2 text-[13px]"
              >
                Continue with Google
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
