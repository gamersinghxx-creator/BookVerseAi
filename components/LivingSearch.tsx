"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

interface Suggestion {
  slug: string;
  title: string;
  emoji: string;
}

const STAGES = [
  "Reading the shelves",
  "Mixing the inks",
  "Painting the summary",
  "Tracing the timeline",
  "Drawing the mind map",
  "Waking the tutor",
];

// The living search: type a title and the field blooms with light. Suggestions
// are fetched live from the database (seed + previously summoned books); a new
// title is summoned via AI, wrapped in a full-screen cinematic experience.
export function LivingSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Suggestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const glow = Math.min(query.trim().length / 22, 1);

  // Debounced live suggestions from the library API.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setMatches([]);
      return;
    }
    const id = setTimeout(() => {
      fetch(`/api/library?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setMatches(Array.isArray(d.books) ? d.books.slice(0, 4) : []))
        .catch(() => setMatches([]));
    }, 180);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1400);
    return () => clearInterval(id);
  }, [busy]);

  async function summon(title: string) {
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    setStage(0);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      const data = await res.json();
      if (!res.ok || !data.slug) throw new Error(data?.error ?? "Failed");
      router.push(`/book/${data.slug}`);
    } catch {
      setError("Couldn't summon that book. Make sure the app is running.");
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const exact = matches.find(
      (m) => m.title.toLowerCase() === query.trim().toLowerCase()
    );
    if (exact) router.push(`/book/${exact.slug}`);
    else if (matches[0]) router.push(`/book/${matches[0].slug}`);
    else summon(query);
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <form onSubmit={onSubmit} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-full blur-2xl transition-opacity duration-500"
          style={{
            opacity: 0.25 + glow * 0.6,
            background:
              "radial-gradient(60% 120% at 30% 50%, rgba(46,155,255,0.5), transparent 70%), radial-gradient(60% 120% at 70% 50%, rgba(255,46,85,0.5), transparent 70%), radial-gradient(80% 140% at 50% 50%, rgba(46,203,124,0.35), transparent 70%)",
          }}
        />
        <div className="glass flex items-center gap-2 rounded-full p-2 pl-6 shadow-[0_30px_70px_-40px_rgba(33,26,24,0.6)]">
          <Sparkles size={20} className="shrink-0 text-crimson" />
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name a book. Watch it come to light."
            aria-label="Search or summon a book"
            className="w-full bg-transparent py-3 font-grotesk text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={busy || !query.trim()}
            className="btn-primary shrink-0 px-5 py-3 disabled:opacity-50"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : matches[0] ? (
              <ArrowRight size={18} />
            ) : (
              <>
                Summon
                <Sparkles size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {matches.length > 0 && !busy && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 flex flex-wrap justify-center gap-2"
          >
            {matches.map((b) => (
              <button
                key={b.slug}
                onClick={() => router.push(`/book/${b.slug}`)}
                className="pill hover:border-ink/25 hover:text-ink"
              >
                <span>{b.emoji}</span>
                {b.title}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-center text-sm text-crimson-ink">{error}</p>}

      <AnimatePresence>
        {busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] grid place-items-center bg-paper/70 backdrop-blur-xl"
          >
            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-8 h-40 w-40">
                {["46,155,255", "255,46,85", "46,203,124"].map((c, i) => (
                  <motion.span
                    key={c}
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ background: `radial-gradient(circle, rgba(${c},0.7), transparent 70%)`, mixBlendMode: "multiply" }}
                    animate={{ scale: [1, 1.35, 1], x: [0, i === 0 ? -18 : i === 1 ? 18 : 0, 0], y: [0, i === 2 ? -18 : 6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                  />
                ))}
                <span className="absolute inset-0 grid place-items-center text-5xl">✨</span>
              </div>

              <p className="eyebrow mb-2">Summoning</p>
              <h3 className="display max-w-md text-3xl font-bold text-ink">
                &ldquo;{query.trim()}&rdquo;
              </h3>
              <div className="mt-5 h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stage}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="font-grotesk text-sm text-ink-soft"
                  >
                    {STAGES[stage]}...
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
