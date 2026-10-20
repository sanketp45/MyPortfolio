import type { Config } from "tailwindcss";
import { color, font, size, space, radius } from "./tokens.js";

// Derive the generic fallback (serif / sans-serif / monospace) straight
// from tokens.js so the font stack has one source of truth.
const fallback = (stack: string) => stack.split(",").pop()!.trim();

const spacing = Object.fromEntries(
  space.map((px, i) => [String(i), `${px}px`])
);

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: color.bg.canvas,
          surface: color.bg.surface,
          inverse: color.bg.inverse,
        },
        text: {
          primary: color.text.primary,
          secondary: color.text.secondary,
          muted: color.text.muted,
          inverse: color.text.inverse,
        },
        line: {
          subtle: color.line.subtle,
          strong: color.line.strong,
        },
        accent: {
          base: color.accent.base,
          hover: color.accent.hover,
        },
        card: {
          work: color.card.work,
          apps: color.card.apps,
          talks: color.card.talks,
        },
        badge: {
          fill: color.badge.fill,
          border: color.badge.border,
        },
        case: {
          ink: color.caseStudy.ink,
          muted: color.caseStudy.muted,
          green: color.caseStudy.green,
          red: color.caseStudy.red,
          purple: color.caseStudy.purple,
          lavender: color.caseStudy.lavender,
        },
        stage: {
          light: color.stage.light,
          base: color.stage.base,
          deep: color.stage.deep,
        },
        cta: {
          base: color.cta.base,
          hover: color.cta.hover,
          text: color.cta.text,
        },
      },
      fontFamily: {
        display: ["var(--font-display)", fallback(font.display)],
        body: ["var(--font-body)", fallback(font.body)],
        mono: ["var(--font-mono)", fallback(font.mono)],
        serif: ["var(--font-serif)", "serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      fontSize: size,
      spacing,
      borderRadius: radius,
    },
  },
  plugins: [],
};

export default config;
