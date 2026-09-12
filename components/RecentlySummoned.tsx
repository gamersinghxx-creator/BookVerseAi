"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ACCENTS } from "@/lib/accents";
import { fadeUp, revealViewport } from "@/lib/motion";

interface Summary {
  slug: string;
  title: string;
  author: string;
  category: string;
  tagline: string;
  emoji: string;
}

// AI-generated books from the server cache, so a summoned book is never a dead
// end. Renders nothing until at least one exists.
export function RecentlySummoned() {
  const [items, setItems] = useState<Summary[]>([]);

  useEffect(() => {
    let alive = true;
    fetch("/api/books")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.books)) setItems(d.books.slice(0, 6));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="u-container py-16">
      <div className="mb-8 flex items-center gap-2.5">
        <Sparkles size={18} className="text-crimson-ink" aria-hidden />
        <h2 className="display text-h3 font-bold text-ink md:text-h2">Recently summoned</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b, i) => {
          const a = ACCENTS[i % ACCENTS.length];
          return (
            <motion.div
              key={b.slug}
              variants={fadeUp}
              custom={i % 3}
              initial="hidden"
              whileInView="show"
              viewport={revealViewport}
            >
              <Link
                href={`/book/${b.slug}`}
                className="card flex items-center gap-4 p-4 transition-transform duration-fast ease-out-expo hover:-translate-y-1"
              >
                <span
                  aria-hidden
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                  style={{ background: `radial-gradient(circle at 50% 40%, rgba(${a.rgb},0.28), rgba(255,255,255,0.4))` }}
                >
                  {b.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-grotesk font-semibold text-ink">{b.title}</h3>
                  <p className="truncate text-body-sm text-ink-soft">{b.tagline}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
