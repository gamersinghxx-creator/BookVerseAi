"use client";

import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { transition } from "@/lib/motion";
import { Pill } from "@/components/ui";
import { ACCENTS } from "@/lib/accents";
import type { Sketch } from "@/lib/types";

// Conceptual AI-sketch gallery. Real art would come from an image pipeline
// (SDXL / FLUX / ComfyUI); here we paint gradient + emoji placeholders in the
// living-ink palette, clearly labelled as concept art.
export function Sketches({ sketches }: { sketches: Sketch[] }) {
  if (sketches.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {sketches.map((s, i) => {
        const a = ACCENTS[i % ACCENTS.length];
        const b = ACCENTS[(i + 2) % ACCENTS.length];
        return (
          <motion.figure
            key={i}
            initial={{ y: 14 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={transition(0.4, i * 0.08)}
            className="card overflow-hidden p-0"
          >
            <div
              className="relative flex h-40 items-center justify-center"
              style={{
                background: `radial-gradient(120% 120% at 20% 20%, rgba(${a.rgb},0.5), transparent 60%), radial-gradient(120% 120% at 80% 80%, rgba(${b.rgb},0.5), transparent 60%)`,
              }}
            >
              <span aria-hidden className="animate-floaty text-6xl drop-shadow-sm" style={{ animationDelay: `${i * 0.4}s` }}>
                {s.emoji}
              </span>
              <Pill className="absolute left-3 top-3">
                <ImageIcon size={11} aria-hidden />
                AI concept
              </Pill>
            </div>
            <figcaption className="px-5 py-4 text-body-sm text-ink-soft">
              {s.caption}
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}
