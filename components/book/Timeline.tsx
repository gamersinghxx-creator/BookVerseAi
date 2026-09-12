"use client";

import { motion } from "framer-motion";
import { transition } from "@/lib/motion";
import { Pill } from "@/components/ui";
import type { TimelineEvent } from "@/lib/types";

export function Timeline({
  events,
  accentRgb = "46,155,255",
}: {
  events: TimelineEvent[];
  accentRgb?: string;
}) {
  if (events.length === 0) return null;
  return (
    <ol className="relative pl-8">
      <div
        aria-hidden
        className="absolute bottom-2 left-2.5 top-2 w-px"
        style={{ background: `linear-gradient(to bottom, rgba(${accentRgb},0.7), rgba(${accentRgb},0))` }}
      />
      <div className="flex flex-col gap-7">
        {events.map((e, i) => (
          <motion.li
            key={i}
            initial={{ x: -14 }}
            whileInView={{ x: 0 }}
            viewport={{ once: true }}
            transition={transition(0.4, i * 0.06)}
            className="relative"
          >
            <span
              aria-hidden
              className="absolute -left-[1.6rem] top-1 h-3.5 w-3.5 rounded-full border-2 border-paper"
              style={{ background: `rgb(${accentRgb})`, boxShadow: `0 0 0 4px rgba(${accentRgb},0.18)` }}
            />
            <Pill className="mb-1.5">{e.label}</Pill>
            <h4 className="display text-h3 font-bold text-ink">{e.title}</h4>
            <p className="mt-0.5 text-body-sm text-ink-soft">{e.detail}</p>
          </motion.li>
        ))}
      </div>
    </ol>
  );
}
