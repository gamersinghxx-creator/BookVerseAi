"use client";

import { motion } from "framer-motion";
import type { TimelineEvent } from "@/lib/types";

export function Timeline({
  events,
  accentRgb = "46,155,255",
}: {
  events: TimelineEvent[];
  accentRgb?: string;
}) {
  return (
    <div className="relative pl-8">
      <div
        className="absolute bottom-2 left-2.5 top-2 w-px"
        style={{ background: `linear-gradient(to bottom, rgba(${accentRgb},0.7), rgba(${accentRgb},0))` }}
      />
      <div className="flex flex-col gap-7">
        {events.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="relative"
          >
            <span
              className="absolute -left-[1.6rem] top-1 h-3.5 w-3.5 rounded-full border-2 border-paper"
              style={{ background: `rgb(${accentRgb})`, boxShadow: `0 0 0 4px rgba(${accentRgb},0.18)` }}
            />
            <span className="pill mb-1.5">{e.label}</span>
            <h4 className="display text-xl font-bold text-ink">{e.title}</h4>
            <p className="mt-0.5 text-sm text-ink-soft">{e.detail}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
