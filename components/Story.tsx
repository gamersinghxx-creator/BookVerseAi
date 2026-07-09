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
    body: "Type any title. In moments a full, transformative guide is painted - and cached forever, so it opens instantly next time.",
    rgb: "255,46,85",
    text: "text-crimson-ink",
  },
  {
    no: "02",
    icon: BookOpen,
    title: "Understand it",
    body: "A structured summary and the key lessons distilled - the shape of the whole book, grasped in minutes instead of weeks.",
    rgb: "46,155,255",
    text: "text-sky-ink",
  },
  {
    no: "03",
    icon: Waypoints,
    title: "See it",
    body: "Watch ideas connect: a timeline of how they build, a mind map of the whole, and - for fiction - a living map of characters.",
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

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const thread = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="journey" className="u-container scroll-mt-28 py-28">
      <div className="mb-20 max-w-2xl">
        <p className="eyebrow mb-4">The journey</p>
        <h2 className="display text-[clamp(2.4rem,6vw,4.5rem)] font-black text-ink">
          Four moments, <span className="ink-gradient italic">one arc</span>
        </h2>
        <p className="mt-5 text-lg text-ink-soft">
          Every book here unfolds as a small journey - from a spark of curiosity
          to a conversation you can hold.
        </p>
      </div>

      <div ref={ref} className="relative">
        {/* The ink thread that fills as you scroll. */}
        <div className="absolute left-[27px] top-2 h-full w-px bg-ink/10 md:left-1/2" />
        <motion.div
          style={{ height: thread }}
          className="absolute left-[27px] top-2 w-px bg-gradient-to-b from-crimson via-sky to-iris md:left-1/2"
        />

        <div className="flex flex-col gap-16 md:gap-24">
          {ACTS.map((a, i) => (
            <motion.div
              key={a.no}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex items-start gap-6 md:w-1/2 ${
                i % 2 === 1 ? "md:ml-auto md:flex-row" : "md:flex-row-reverse md:text-right"
              }`}
            >
              {/* Node on the thread. */}
              <span
                className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 40%, rgba(${a.rgb},0.3), rgba(255,255,255,0.5))`,
                  boxShadow: `0 12px 30px -14px rgba(${a.rgb},0.9)`,
                }}
              >
                <a.icon size={22} className={a.text} />
              </span>

              <div className={i % 2 === 1 ? "" : "md:items-end"}>
                <span className={`eyebrow ${a.text}`}>{a.no}</span>
                <h3 className="display mt-1 text-3xl font-bold text-ink">{a.title}</h3>
                <p className="mt-2 max-w-sm text-ink-soft">{a.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
