"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, X } from "lucide-react";
import { useShelf } from "@/lib/shelf";
import { ACCENTS } from "@/lib/accents";

export default function ShelfPage() {
  const { items, remove } = useShelf();

  return (
    <div className="u-container min-h-[70vh] pb-16 pt-32">
      <div className="mb-10 flex items-center gap-3">
        <Bookmark size={22} className="text-crimson-ink" />
        <h1 className="display text-[clamp(2.2rem,6vw,3.6rem)] font-black text-ink">
          My shelf
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg text-ink">Your shelf is empty.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Save any book with the bookmark and it will wait here for you.
          </p>
          <Link href="/#library" className="btn-primary mt-6">
            Browse the library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b, i) => {
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={b.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                className="card group relative flex items-center gap-4 p-5"
              >
                <Link href={`/book/${b.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                    style={{ background: `radial-gradient(circle at 50% 40%, rgba(${a.rgb},0.28), rgba(255,255,255,0.4))` }}
                  >
                    {b.emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-grotesk font-semibold text-ink">{b.title}</h3>
                    <p className="truncate text-sm text-ink-soft">{b.author}</p>
                  </div>
                </Link>
                <button
                  onClick={() => remove(b.slug)}
                  aria-label={`Remove ${b.title} from shelf`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-ink/5 hover:text-ink"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
