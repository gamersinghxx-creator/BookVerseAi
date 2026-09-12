import next from "eslint-config-next";
import tseslint from "typescript-eslint";

// Flat config (ESLint 9). `next` bundles the React, react-hooks, jsx-a11y,
// import and @next/next plugins with sensible defaults; we layer a small set of
// project rules on top.
const config = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      ".bookverse-cache/**",
      "next-env.d.ts",
    ],
  },
  ...next,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "warn",
      "no-console": "off",
    },
  },
  {
    // Ambient / config files: relax rules that don't apply.
    files: ["**/*.d.ts", "*.config.{js,mjs,ts}", "types/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    // Client components with debounced/subscription effects. The stricter
    // react-hooks v6 rule flags legitimate patterns here; keep as a warning.
    files: ["components/**", "app/**"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Fonts load via a stylesheet <link> in the root layout by design (no
    // build-time Google Fonts fetch). Migrating to next/font is a Stage 3 task.
    files: ["app/layout.tsx"],
    rules: {
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default config;
