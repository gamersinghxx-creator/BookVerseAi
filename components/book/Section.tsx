"use client";

import { motion } from "framer-motion";
import { transition } from "@/lib/motion";
import { IconTile } from "@/components/ui";

export function Section({
  id,
  icon,
  title,
  subtitle,
  accentRgb = "122,92,255",
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentRgb?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={transition(0.6)}
      className="scroll-mt-28"
    >
      <div className="mb-6 flex items-center gap-4">
        <IconTile accentRgb={accentRgb}>{icon}</IconTile>
        <div>
          <h2 className="display text-h3 font-bold text-ink md:text-h2">{title}</h2>
          {subtitle && <p className="mt-0.5 text-body-sm text-ink-faint">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}
