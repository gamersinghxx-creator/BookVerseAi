"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LivingSearch } from "./LivingSearch";

const FORESHADOW = [
  { emoji: "⚔️", tone: "rgba(122,92,255,0.55)", x: "8%", y: "26%", depth: 0.5 },
  { emoji: "🏛️", tone: "rgba(255,177,61,0.6)", x: "84%", y: "20%", depth: 0.9 },
  { emoji: "💌", tone: "rgba(255,46,85,0.55)", x: "78%", y: "68%", depth: 0.7 },
  { emoji: "⚡", tone: "rgba(46,155,255,0.55)", x: "14%", y: "70%", depth: 1.1 },
];

const LINE1 = ["Step", "inside"];
const LINE2 = ["any", "book."];

const BENEFITS = ["Structured summary", "Timeline & mind map", "Book-grounded tutor"];

function Orb({
  o,
  px,
  py,
  i,
}: {
  o: (typeof FORESHADOW)[number];
  px: MotionValue<number>;
  py: MotionValue<number>;
  i: number;
}) {
  const x = useTransform(px, (v) => v * o.depth * 40);
  const y = useTransform(py, (v) => v * o.depth * 40);
  return (
    <motion.div
      aria-hidden
      style={{ left: o.x, top: o.y, x, y }}
      className="pointer-events-none absolute hidden h-24 w-24 place-items-center rounded-full text-3xl sm:grid"
    >
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle at 50% 40%, ${o.tone}, transparent 70%)` }}
      />
      <span className="relative animate-floaty" style={{ animationDelay: `${i * 0.6}s` }}>
        {o.emoji}
      </span>
    </motion.div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-24">
      {FORESHADOW.map((o, i) => (
        <Orb key={i} o={o} px={px} py={py} i={i} />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
          className="eyebrow mb-6 text-ink-faint"
        >
          AI-painted understanding
        </motion.p>

        <h1 className="display text-hero font-black text-ink">
          {/* Real heading for screen readers and crawlers; the animated words
              are decorative. Transform-only entrance so it stays visible even if
              the animation never runs. */}
          <span className="sr-only">Step inside any book.</span>
          <span className="block" aria-hidden>
            {LINE1.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: 24 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className="mr-[0.25em] inline-block"
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block" aria-hidden>
            {LINE2.map((w, i) => (
              <motion.span
                key={w}
                initial={{ y: 24 }}
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
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mb-8 mt-7 max-w-prose text-lead leading-relaxed text-ink-soft"
        >
          Not a wall of text. A living room of ideas — summaries, timelines, mind
          maps and a tutor, painted in light. Understand a book in minutes, then
          go read it.
        </motion.p>

        <motion.div
          initial={{ y: 14 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, delay: 0.62 }}
          className="w-full"
        >
          <LivingSearch />
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-grotesk text-xs text-ink-faint">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-crimson/60" />
                {b}
              </li>
            ))}
          </ul>
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
        <span className="font-grotesk text-[11px] uppercase tracking-[0.24em]">Wander in</span>
        <ChevronDown size={18} className="animate-floaty" aria-hidden />
      </motion.a>
    </section>
  );
}
