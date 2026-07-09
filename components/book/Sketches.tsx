"use client";

import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { Sketch } from "@/lib/types";
import { ACCENTS } from "@/lib/accents";

// Conceptual AI-sketch gallery. Real art would come from the image pipeline
// (SDXL / FLUX / ComfyUI); here we paint gradient + emoji placeholders in the
// living-ink palette, clearly labelled as concept art.
export function Sketches({ sketches }: { sketches: Sketch[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {sketches.map((s, i) => {
        const a = ACCENTS[i % ACCENTS.length];
        const b = ACCENTS[(i + 2) % ACCENTS.length];
        return (
          <motion.figure
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card overflow-hidden p-0"
          >
            <div
              className="relative flex h-40 items-center justify-center"
              style={{ background: `radial-gradient(120% 120% at 20% 20%, rgba(${a.rgb},0.5), transparent 60%), radial-gradient(120% 120% at 80% 80%, rgba(${b.rgb},0.5), transparent 60%)` }}
            >
              <span className="text-6xl drop-shadow-sm animate-floaty" style={{ animationDelay: `${i * 0.4}s` }}>
                {s.emoji}
              </span>
              <span className="pill absolute left-3 top-3">
                <ImageIcon size={11} />
                AI concept
              </span>
            </div>
            <figcaption className="px-5 py-4 text-sm text-ink-soft">
              {s.caption}
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}
