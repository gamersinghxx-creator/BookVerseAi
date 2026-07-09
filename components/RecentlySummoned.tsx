"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ACCENTS } from "@/lib/accents";

interface Summary {
  slug: string;
  title: string;
  author: string;
  category: string;
  tagline: string;
  emoji: string;
}

// Shows AI-generated books from the server cache so a summoned book is never a
// dead end. Renders nothing until at least one exists.
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
        <Sparkles size={18} className="text-crimson-ink" />
        <h2 className="display text-2xl font-bold text-ink md:text-3xl">
          Recently summoned
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((b, i) => {
          const a = ACCENTS[i % ACCENTS.length];
          return (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
            >
              <Link href={`/book/${b.slug}`} className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-1">
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl"
                  style={{ background: `radial-gradient(circle at 50% 40%, rgba(${a.rgb},0.28), rgba(255,255,255,0.4))` }}
                >
                  {b.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-grotesk font-semibold text-ink">{b.title}</h3>
                  <p className="truncate text-sm text-ink-soft">{b.tagline}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
