"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type { Book } from "@/lib/types";
import { BookOrb } from "./BookOrb";

// Organic offsets so the collection reads as a scattered constellation rather
// than a rigid grid, while staying responsive and keyboard-navigable.
const OFFSETS = [0, 44, 18, 60, 30, 8];

export function Library({ books }: { books: Book[] }) {
  return (
    <section id="library" className="u-container scroll-mt-28 py-section-y">
      <motion.div
        initial={{ y: 16 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="mb-16 max-w-prose"
      >
        <p className="eyebrow mb-4">
          The library · {books.length} {books.length === 1 ? "book" : "books"}
        </p>
        <h2 className="display text-h2 font-black text-ink">
          A sky of <span className="ink-gradient italic">books</span> to wander
        </h2>
        <p className="mt-5 text-lead text-ink-soft">
          Every one already painted and stored, ready in an instant. Summon any
          title from the search above and it joins the sky.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <BookOrb key={book.slug} book={book} index={i} offset={OFFSETS[i % OFFSETS.length]} />
        ))}
      </div>
    </section>
  );
}
