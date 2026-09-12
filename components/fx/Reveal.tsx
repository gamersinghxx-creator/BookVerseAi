"use client";

import { motion } from "framer-motion";
import { fadeUp, revealViewport } from "@/lib/motion";

// Scroll-triggered entrance. Reduced motion is handled globally by MotionConfig.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={delay / 0.08}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
    >
      {children}
    </motion.div>
  );
}
