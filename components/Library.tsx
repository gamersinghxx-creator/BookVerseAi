"use client";

import { motion } from "framer-motion";
import type { Book } from "@/lib/types";
import { BookOrb } from "./BookOrb";

// Organic offsets so the collection reads as a scattered constellation rather
// than a rigid grid, while staying responsive and keyboard-navigable.
const OFFSETS = [0, 44, 18, 60, 30, 8];

export function Library({ books }: { books: Book[] }) {
  return (
    <section id="library" className="u-container scroll-mt-28 py-28">
      <div className="mb-16 max-w-2xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="eyebrow mb-4"
        >
          The library · {books.length} {books.length === 1 ? "book" : "books"}
        </motion.p>
        <h2 className="display text-[clamp(2.4rem,6vw,4.5rem)] font-black text-ink">
          A sky of <span className="ink-gradient italic">books</span> to wander
        </h2>
        <p className="mt-5 text-lg text-ink-soft">
          Every one already painted and stored, ready in an instant. Summon any
          title from the search above and it joins the sky.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book, i) => (
          <BookOrb key={book.slug} book={book} index={i} offset={OFFSETS[i % OFFSETS.length]} />
        ))}
      </div>
    </section>
  );
}
