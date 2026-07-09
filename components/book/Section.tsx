"use client";

import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-28"
    >
      <div className="mb-6 flex items-center gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-ink"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(${accentRgb},0.3), rgba(255,255,255,0.5))`,
            boxShadow: `0 12px 28px -16px rgba(${accentRgb},0.9)`,
          }}
        >
          {icon}
        </span>
        <div>
          <h2 className="display text-3xl font-bold text-ink md:text-4xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}
