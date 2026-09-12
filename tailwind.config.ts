import type { Config } from "tailwindcss";

// "Liquid Light" design tokens. One warm-paper identity, no dark theme.
// Everything the UI needs — colour, type scale, spacing rhythm, elevation,
// radii, motion — is defined here so components stop reaching for arbitrary
// values. Raw colour values are also mirrored as CSS variables in globals.css.

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm-white "paper" world.
        paper: {
          DEFAULT: "#FBF6EE",
          soft: "#F5ECE0",
          deep: "#EDE1D2",
        },
        ink: {
          DEFAULT: "#211A18", // warm near-black — primary text
          soft: "#544842", //  secondary text (AA on paper)
          faint: "#6B5C54", // muted text (AA on paper) + borders
          hush: "#8A7C74", // decorative only — not for text
        },
        // Living inks. `ink` = dark enough for text on paper; `soft` = tints.
        sky: { DEFAULT: "#2E9BFF", ink: "#0A63C4", soft: "#8FCBFF" },
        crimson: { DEFAULT: "#FF2E55", ink: "#CE1236", soft: "#FF8298" },
        leaf: { DEFAULT: "#2ECB7C", ink: "#0E8A50", soft: "#88E6B4" },
        amber: { DEFAULT: "#FFB13D", ink: "#B87714", soft: "#FFD189" },
        iris: { DEFAULT: "#7A5CFF", ink: "#5033C9", soft: "#BBAAFF" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        grotesk: ["var(--font-grotesk)", "Space Grotesk", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      // Semantic type scale (fluid where it earns its keep).
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.28em" }],
        label: ["0.8125rem", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.65" }],
        lead: ["clamp(1.075rem, 0.98rem + 0.4vw, 1.25rem)", { lineHeight: "1.6" }],
        h3: ["clamp(1.35rem, 1.2rem + 0.7vw, 1.75rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["clamp(1.7rem, 1.4rem + 1.4vw, 2.5rem)", { lineHeight: "1.12", letterSpacing: "-0.015em" }],
        display: ["clamp(2.4rem, 1.7rem + 3.4vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        hero: ["clamp(3.1rem, 1.3rem + 8.4vw, 9rem)", { lineHeight: "0.92", letterSpacing: "-0.025em" }],
      },
      spacing: {
        "section-y": "clamp(4.5rem, 3rem + 7vw, 8rem)",
        gutter: "clamp(1.25rem, 0.9rem + 1.6vw, 2rem)",
      },
      maxWidth: {
        prose: "68ch",
        shell: "72rem",
      },
      borderRadius: {
        card: "1.625rem", // 26px
        panel: "2rem",
        field: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.7) inset, 0 24px 60px -30px rgba(33,26,24,0.35)",
        float: "0 30px 70px -40px rgba(33,26,24,0.6)",
        pop: "0 14px 30px -12px rgba(255,46,85,0.6)",
        focus: "0 0 0 3px rgba(46,155,255,0.35)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-soft": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        fast: "160ms",
        DEFAULT: "220ms",
        slow: "420ms",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(2%, -3%, 0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        rise: {
          "0%": { transform: "translateY(120%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 7s ease-in-out infinite",
        floaty: "floaty 8s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
