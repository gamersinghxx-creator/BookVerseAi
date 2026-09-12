"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";
import { useShelf } from "@/lib/shelf";
import { ACCENTS } from "@/lib/accents";
import { transition } from "@/lib/motion";
import { Button } from "@/components/ui";

export default function ShelfPage() {
  const { items, remove } = useShelf();

  return (
    <div className="u-container min-h-[70vh] pb-16 pt-32">
      <div className="mb-10 flex items-center gap-3">
        <Bookmark size={22} className="text-crimson-ink" aria-hidden />
        <h1 className="display text-display font-black text-ink">My shelf</h1>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lead text-ink">Your shelf is empty.</p>
          <p className="mx-auto mt-2 max-w-prose text-body-sm text-ink-soft">
            Save any book with the bookmark and it will wait here for you — synced
            to your account when you&apos;re signed in.
          </p>
          <Button href="/#library" className="mt-6">
            Browse the library
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, i) => {
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <motion.li
                key={b.slug}
                initial={{ y: 12 }}
                animate={{ y: 0 }}
                transition={transition(0.4, (i % 3) * 0.06)}
                className="card group relative flex items-center gap-4 p-5"
              >
                <Link href={`/book/${b.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    aria-hidden
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                    style={{ background: `radial-gradient(circle at 50% 40%, rgba(${a.rgb},0.28), rgba(255,255,255,0.4))` }}
                  >
                    {b.emoji}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-grotesk font-semibold text-ink">{b.title}</h2>
                    <p className="truncate text-body-sm text-ink-soft">{b.author}</p>
                  </div>
                </Link>
                <button
                  onClick={() => remove(b.slug)}
                  aria-label={`Remove ${b.title} from shelf`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
                >
                  <X size={16} aria-hidden />
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
