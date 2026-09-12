"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GitCompareArrows, Star, Clock } from "lucide-react";
import { ACCENTS } from "@/lib/accents";
import { Button, Pill } from "@/components/ui";
import type { Book } from "@/lib/types";

function Picker({
  value,
  onChange,
  exclude,
  books,
}: {
  value: string;
  onChange: (slug: string) => void;
  exclude: string;
  books: Book[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Choose a book to compare"
      className="w-full rounded-full border border-ink/12 bg-paper/70 px-5 py-3 font-grotesk text-sm font-semibold text-ink outline-none focus:border-sky/50"
    >
      {books.map((b) => (
        <option key={b.slug} value={b.slug} disabled={b.slug === exclude}>
          {b.cover.emoji}  {b.title}
        </option>
      ))}
    </select>
  );
}

function Column({ book, rgb }: { book: Book; rgb: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6 text-center">
        <span
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl text-5xl"
          style={{ background: `radial-gradient(circle at 50% 40%, rgba(${rgb},0.3), rgba(255,255,255,0.5))` }}
        >
          {book.cover.emoji}
        </span>
        <h2 className="display mt-4 text-h3 font-bold text-ink">{book.title}</h2>
        <p className="mt-1 font-grotesk text-body-sm text-ink-soft">{book.author} · {book.year}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 font-grotesk text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1"><Star size={12} fill="currentColor" aria-hidden />{book.rating}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} aria-hidden />{book.readingTime}</span>
          <Pill className="capitalize">{book.category}</Pill>
        </div>
        <Button href={`/book/${book.slug}`} variant="ghost" size="sm" className="mt-5">Open</Button>
      </div>

      <div>
        <p className="eyebrow mb-2">In a sentence</p>
        <p className="text-ink-soft">{book.tagline}</p>
      </div>

      <div>
        <p className="eyebrow mb-2">Overview</p>
        <p className="text-body-sm leading-relaxed text-ink-soft">{book.overview}</p>
      </div>

      <div>
        <p className="eyebrow mb-3">Key lessons</p>
        <ul className="flex flex-col gap-2.5">
          {book.lessons.map((l, i) => (
            <li key={i} className="flex gap-2.5">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold text-white"
                style={{ background: `rgb(${rgb})` }}
              >
                {i + 1}
              </span>
              <span className="text-body-sm text-ink-soft">
                <span className="font-semibold text-ink">{l.title}.</span> {l.detail}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CompareClient({ books }: { books: Book[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const has = (slug: string) => books.some((x) => x.slug === slug);

  const [aSlug, setA] = useState(() => {
    const p = params.get("a");
    return p && has(p) ? p : (books[0]?.slug ?? "");
  });
  const [bSlug, setB] = useState(() => {
    const p = params.get("b");
    return p && has(p) && p !== params.get("a") ? p : (books[1]?.slug ?? books[0]?.slug ?? "");
  });

  // Keep the URL in sync so a comparison is shareable / bookmarkable.
  const syncUrl = useCallback(
    (na: string, nb: string) => {
      const q = new URLSearchParams({ a: na, b: nb });
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );
  useEffect(() => {
    syncUrl(aSlug, bSlug);
  }, [aSlug, bSlug, syncUrl]);

  const a = books.find((x) => x.slug === aSlug) ?? books[0];
  const b = books.find((x) => x.slug === bSlug) ?? books[1] ?? books[0];

  if (!a || !b) {
    return (
      <div className="u-container min-h-[70vh] pb-16 pt-32">
        <p className="text-ink-soft">Not enough books to compare yet.</p>
      </div>
    );
  }

  return (
    <div className="u-container min-h-[70vh] pb-16 pt-32">
      <div className="mb-8 flex items-center gap-3">
        <GitCompareArrows size={22} className="text-sky-ink" aria-hidden />
        <h1 className="display text-display font-black text-ink">Compare two books</h1>
      </div>
      <p className="mb-8 max-w-2xl text-ink-soft">
        Weigh two books side by side — their promise, their core ideas, and how
        they read — to decide where to spend your next hours.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Picker value={aSlug} onChange={setA} exclude={bSlug} books={books} />
        <Picker value={bSlug} onChange={setB} exclude={aSlug} books={books} />
      </div>

      <motion.div
        key={aSlug + bSlug}
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-10 md:grid-cols-2"
      >
        <Column book={a} rgb={ACCENTS[0].rgb} />
        <Column book={b} rgb={ACCENTS[1].rgb} />
      </motion.div>
    </div>
  );
}
