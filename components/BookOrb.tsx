"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Star } from "lucide-react";
import type { Book } from "@/lib/types";
import { ACCENTS } from "@/lib/accents";
import { fadeUp, revealViewport } from "@/lib/motion";
import { ShelfButton } from "./ShelfButton";

export function BookOrb({
  book,
  index = 0,
  offset = 0,
}: {
  book: Book;
  index?: number;
  offset?: number;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  const item = {
    slug: book.slug,
    title: book.title,
    author: book.author,
    category: book.category,
    tagline: book.tagline,
    emoji: book.cover.emoji,
  };

  return (
    <motion.div
      variants={fadeUp}
      custom={index % 3}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      style={{ marginTop: offset }}
      className="group relative"
    >
      <Link
        href={`/book/${book.slug}`}
        className="card relative block overflow-hidden p-6 transition-transform duration-300 ease-out-expo hover:-translate-y-2"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, rgba(${accent.rgb},0.55), transparent 70%)` }}
        />

        <span
          aria-hidden
          className="relative grid h-16 w-16 place-items-center rounded-2xl text-4xl shadow-inner animate-floaty"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${accent.rgb},0.28), rgba(255,255,255,0.4))`,
            animationDelay: `${index * 0.5}s`,
          }}
        >
          {book.cover.emoji}
        </span>

        <div className="relative mt-5">
          <span className={`eyebrow ${accent.text}`}>{book.category}</span>
          <h3 className="display mt-1.5 text-h3 font-bold text-ink">{book.title}</h3>
          <p className="mt-1 font-grotesk text-body-sm text-ink-faint">
            {book.author} · {book.year}
          </p>
          <p className="mt-3 line-clamp-2 text-body-sm text-ink-soft">{book.tagline}</p>

          <div className="mt-4 flex items-center gap-4 font-grotesk text-xs text-ink-faint">
            <span className="inline-flex items-center gap-1">
              <Star size={13} className={accent.text} fill="currentColor" aria-hidden />
              <span className="sr-only">Rating </span>
              {book.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden />
              {book.readingTime}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-4 z-20">
        <ShelfButton item={item} />
      </div>
    </motion.div>
  );
}
