"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Database, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import { accentFor } from "@/lib/accents";
import { transition } from "@/lib/motion";
import { Pill } from "@/components/ui";
import { ShelfButton } from "@/components/ShelfButton";

export function BookHeader({ book }: { book: Book }) {
  const accent = accentFor(book.slug);
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-24 h-80 w-80 rounded-full opacity-70 blur-3xl"
        style={{ background: `radial-gradient(circle, rgba(${accent.rgb},0.5), transparent 70%)` }}
      />

      <Link
        href="/#library"
        className="link-underline relative inline-flex items-center gap-1.5 font-grotesk text-body-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden /> Back to the library
      </Link>

      <div className="relative mt-8 flex flex-col gap-8 md:flex-row md:items-end">
        {/* Entrance moves the tile only — it stays visible if JS is slow. */}
        <motion.div
          initial={{ y: 14, rotate: -5 }}
          animate={{ y: 0, rotate: 0 }}
          transition={transition(0.6)}
          className="grid h-36 w-36 shrink-0 place-items-center rounded-panel text-7xl animate-floaty"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${accent.rgb},0.32), rgba(255,255,255,0.55))`,
            boxShadow: `0 30px 60px -30px rgba(${accent.rgb},0.9)`,
          }}
        >
          <span aria-hidden>{book.cover.emoji}</span>
        </motion.div>

        <div className="flex-1">
          <span className={`eyebrow ${accent.text}`}>{book.category}</span>
          <h1 className="display mt-2 text-display font-black text-ink">{book.title}</h1>
          <p className="mt-2 font-grotesk text-lead text-ink-soft">
            {book.author} · {book.year}
          </p>
          <p className="mt-4 max-w-prose text-lead text-ink-soft">{book.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {book.tags.map((t) => (
              <Pill key={t}>{t}</Pill>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5 font-grotesk text-body-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Star size={15} className={accent.text} fill="currentColor" aria-hidden />
              <span className="sr-only">Rating </span>{book.rating}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} aria-hidden /> {book.readingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 capitalize">
              <BookOpen size={15} aria-hidden /> {book.category}
            </span>
            <span className={`inline-flex items-center gap-1.5 ${book.cached ? accent.text : "text-amber-ink"}`}>
              <Database size={15} aria-hidden />
              {book.cached ? "Served from cache" : "Freshly painted"}
            </span>
          </div>

          <div className="mt-6">
            <ShelfButton
              item={{
                slug: book.slug,
                title: book.title,
                author: book.author,
                category: book.category,
                tagline: book.tagline,
                emoji: book.cover.emoji,
              }}
              variant="full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
