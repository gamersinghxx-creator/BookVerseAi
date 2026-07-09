"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Database, BookOpen } from "lucide-react";
import type { Book } from "@/lib/types";
import { accentFor } from "@/lib/accents";
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
        className="link-underline relative inline-flex items-center gap-1.5 font-grotesk text-sm text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to the library
      </Link>

      <div className="relative mt-8 flex flex-col gap-8 md:flex-row md:items-end">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid h-36 w-36 shrink-0 place-items-center rounded-[2rem] text-7xl animate-floaty"
          style={{ background: `radial-gradient(circle at 50% 40%, rgba(${accent.rgb},0.32), rgba(255,255,255,0.55))`, boxShadow: `0 30px 60px -30px rgba(${accent.rgb},0.9)` }}
        >
          {book.cover.emoji}
        </motion.div>

        <div className="flex-1">
          <span className={`eyebrow ${accent.text}`}>{book.category}</span>
          <h1 className="display mt-2 text-[clamp(2.6rem,7vw,5rem)] font-black text-ink">
            {book.title}
          </h1>
          <p className="mt-2 font-grotesk text-lg text-ink-soft">
            {book.author} · {book.year}
          </p>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">{book.tagline}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {book.tags.map((t) => (
              <span key={t} className="pill">{t}</span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5 font-grotesk text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Star size={15} className={accent.text} fill="currentColor" />
              {book.rating}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} /> {book.readingTime}
            </span>
            <span className="inline-flex items-center gap-1.5 capitalize">
              <BookOpen size={15} /> {book.category}
            </span>
            <span className={`inline-flex items-center gap-1.5 ${book.cached ? accent.text : "text-amber-ink"}`}>
              <Database size={15} />
              {book.cached ? "Served from cache" : "Freshly painted"}
            </span>
          </div>

          <div className="mt-6">
            <ShelfButton
              item={{ slug: book.slug, title: book.title, author: book.author, category: book.category, tagline: book.tagline, emoji: book.cover.emoji }}
              variant="full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
