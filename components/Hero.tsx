"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LivingSearch } from "./LivingSearch";

const FORESHADOW = [
  { emoji: "⚔️", tone: "rgba(122,92,255,0.55)", x: "8%", y: "26%", d: 0.5 },
  { emoji: "🏛️", tone: "rgba(255,177,61,0.6)", x: "84%", y: "20%", d: 0.9 },
  { emoji: "💌", tone: "rgba(255,46,85,0.55)", x: "78%", y: "68%", d: 0.7 },
  { emoji: "⚡", tone: "rgba(46,155,255,0.55)", x: "14%", y: "70%", d: 1.1 },
];

const LINE1 = ["Step", "inside"];
const LINE2 = ["any", "book."];

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [par, setPar] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      setPar({ x: nx, y: ny });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24"
    >
      {/* Foreshadowing orbs with mouse parallax. */}
      {FORESHADOW.map((o, i) => (
        <motion.div
          key={i}
          aria-hidden
          className="pointer-events-none absolute hidden h-24 w-24 place-items-center rounded-full text-3xl sm:grid"
          style={{
            left: o.x,
            top: o.y,
            background: `radial-gradient(circle at 50% 40%, ${o.tone}, transparent 70%)`,
            transform: `translate(${par.x * o.d * 40}px, ${par.y * o.d * 40}px)`,
          }}
        >
          <span className="animate-floaty" style={{ animationDelay: `${i * 0.6}s` }}>
            {o.emoji}
          </span>
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-6"
        >
          AI-painted understanding
        </motion.p>

        <h1 className="display text-[clamp(3.4rem,13vw,9.5rem)] font-black text-ink">
          <span className="block overflow-hidden">
            {LINE1.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className="mr-[0.25em] inline-block"
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block overflow-hidden">
            {LINE2.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.28 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className={`mr-[0.25em] inline-block italic ${i === 1 ? "ink-gradient" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mb-9 mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
        >
          Not a wall of text. A living room of ideas - summaries, timelines, mind
          maps and a tutor, painted in light. Understand a book in minutes,
          then go read it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.62 }}
          className="w-full"
        >
          <LivingSearch />
          <p className="mt-4 font-grotesk text-xs text-ink-faint">
            Try &ldquo;Meditations&rdquo; - or type any title to summon it.
          </p>
        </motion.div>
      </div>

      <motion.a
        href="#library"
        aria-label="Scroll to the library"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-ink-faint"
      >
        <span className="font-grotesk text-[11px] uppercase tracking-[0.24em]">
          Wander in
        </span>
        <ChevronDown size={18} className="animate-floaty" />
      </motion.a>
    </section>
  );
}
