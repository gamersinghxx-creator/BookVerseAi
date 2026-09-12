import type { Transition, Variants } from "framer-motion";

// Shared motion language. Framer Motion honours reduced-motion globally via the
// <MotionConfig reducedMotion="user"> wrapper in app/layout.tsx, so these
// variants don't need per-component guards.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.16,
  base: 0.4,
  slow: 0.7,
} as const;

export const transition = (d: number = DURATION.base, delay = 0): Transition => ({
  duration: d,
  delay,
  ease: EASE_OUT_EXPO,
});

// Entrance: rise into place. Transform-only on purpose — the element stays fully
// visible even if the animation never runs (throttled tab, slow device, no JS),
// so content is never gated behind motion. Pair with whileInView +
// viewport={{ once: true }}.
export const fadeUp: Variants = {
  hidden: { y: 24 },
  show: (i: number = 0) => ({
    y: 0,
    transition: transition(DURATION.slow, i * 0.08),
  }),
};

// When a soft fade is genuinely wanted (decorative, below the fold), opt in.
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: transition(DURATION.slow, i * 0.08),
  }),
};

// Container that staggers its children's entrances.
export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const revealViewport = { once: true, margin: "-80px" } as const;
