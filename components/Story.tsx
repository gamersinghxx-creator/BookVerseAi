"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Waypoints,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface Act {
  no: string;
  icon: LucideIcon;
  title: string;
  body: string;
  rgb: string;
  text: string;
}

const ACTS: Act[] = [
  {
    no: "01",
    icon: Sparkles,
    title: "Summon it",
    body: "Type any title. In moments a full, transformative guide is painted — and cached forever, so it opens instantly next time.",
    rgb: "255,46,85",
    text: "text-crimson-ink",
  },
  {
    no: "02",
    icon: BookOpen,
    title: "Understand it",
    body: "A structured summary and the key lessons distilled — the shape of the whole book, grasped in minutes instead of weeks.",
    rgb: "46,155,255",
    text: "text-sky-ink",
  },
  {
    no: "03",
    icon: Waypoints,
    title: "See it",
    body: "Watch ideas connect: a timeline of how they build, a mind map of the whole, and — for fiction — a living map of characters.",
    rgb: "46,203,124",
    text: "text-leaf-ink",
  },
  {
    no: "04",
    icon: MessagesSquare,
    title: "Ask it",
    body: "A tutor that has read the book waits to answer. Grounded, patient, and always steering you back toward the original.",
    rgb: "122,92,255",
    text: "text-iris-ink",
  },
];

function ActRow({ act, index }: { act: Act; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 45%"],
  });
  // The node grows and the row lifts as it enters the reading zone.
  const nodeScale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const flip = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`relative flex items-start gap-6 md:w-1/2 ${
        flip ? "md:ml-auto md:flex-row" : "md:flex-row-reverse md:text-right"
      }`}
    >
      <motion.span
        style={{ scale: nodeScale }}
        className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
      >
        <span
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${act.rgb},0.32), rgba(255,255,255,0.55))`,
            boxShadow: `0 12px 30px -14px rgba(${act.rgb},0.9)`,
          }}
        />
        <act.icon size={22} className={`relative ${act.text}`} aria-hidden />
      </motion.span>

      <div className={flip ? "" : "md:items-end"}>
        <span className={`eyebrow ${act.text}`}>{act.no}</span>
        <h3 className="display mt-1 text-h3 font-bold text-ink">{act.title}</h3>
        <p className="mt-2 max-w-sm text-body text-ink-soft">{act.body}</p>
      </div>
    </motion.div>
  );
}

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const thread = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="u-container scroll-mt-28 py-section-y">
      <motion.div
        initial={{ y: 18 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="mb-20 max-w-prose"
      >
        <p className="eyebrow mb-4">The journey</p>
        <h2 className="display text-h2 font-black text-ink">
          Four moments, <span className="ink-gradient italic">one arc</span>
        </h2>
        <p className="mt-5 text-lead text-ink-soft">
          Every book here unfolds as a small journey — from a spark of curiosity
          to a conversation you can hold.
        </p>
      </motion.div>

      <div ref={ref} className="relative">
        {/* The ink thread that fills as you scroll. */}
        <div className="absolute left-[27px] top-2 h-full w-px bg-ink/10 md:left-1/2" aria-hidden />
        <motion.div
          style={{ height: thread }}
          className="absolute left-[27px] top-2 w-px bg-gradient-to-b from-crimson via-sky to-iris md:left-1/2"
          aria-hidden
        />

        <div className="flex flex-col gap-16 md:gap-24">
          {ACTS.map((a, i) => (
            <ActRow key={a.no} act={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
