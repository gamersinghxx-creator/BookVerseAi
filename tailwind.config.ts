import type { Config } from "tailwindcss";

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
          DEFAULT: "#211A18", // warm near-black
          soft: "#5B4F49",
          faint: "#8A7C74",
        },
        // Living inks.
        sky: { DEFAULT: "#2E9BFF", ink: "#0A63C4", soft: "#8FCBFF" },
        crimson: { DEFAULT: "#FF2E55", ink: "#CE1236", soft: "#FF8298" },
        leaf: { DEFAULT: "#2ECB7C", ink: "#0E8A50", soft: "#88E6B4" },
        amber: { DEFAULT: "#FFB13D", ink: "#C9821A", soft: "#FFD189" },
        iris: { DEFAULT: "#7A5CFF", ink: "#5033C9", soft: "#BBAAFF" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        grotesk: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
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
