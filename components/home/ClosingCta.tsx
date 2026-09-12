"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { LivingSearch } from "@/components/LivingSearch";

// The landing page's closing band: one more invitation to summon a book, plus
// the honest note about what BookVerse is for.
export function ClosingCta() {
  return (
    <section className="u-container scroll-mt-28 py-section-y">
      <motion.div
        initial={{ y: 20 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="card relative overflow-hidden px-6 py-14 text-center md:px-12 md:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,46,85,0.28), transparent), radial-gradient(closest-side, rgba(46,155,255,0.22), transparent 80%)",
          }}
        />

        <p className="eyebrow relative mb-4">Your next book</p>
        <h2 className="display relative mx-auto max-w-2xl text-h2 font-black text-ink">
          Name one. Watch it <span className="ink-gradient italic">come to light.</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-prose text-lead text-ink-soft">
          A full visual study guide in a moment — then it&apos;s cached forever, so
          the next reader opens it instantly.
        </p>

        <div className="relative mx-auto mt-9 max-w-xl">
          <LivingSearch label="Summon a book" />
        </div>

        <p className="relative mx-auto mt-8 max-w-prose text-xs text-ink-faint">
          Summaries are transformative and educational — they paraphrase and
          teach, never reproduce the text. Every guide credits the author and
          points you to the original.
        </p>
      </motion.div>
    </section>
  );
}
