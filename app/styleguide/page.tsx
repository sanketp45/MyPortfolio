import { color, size, space, radius } from "@/tokens.js";

const colorGroups: { label: string; tw: string; cssVar: string; hex: string }[] = [
  { label: "bg / canvas", tw: "bg-bg-canvas", cssVar: "--color-bg-canvas", hex: color.bg.canvas },
  { label: "bg / surface", tw: "bg-bg-surface", cssVar: "--color-bg-surface", hex: color.bg.surface },
  { label: "bg / inverse", tw: "bg-bg-inverse", cssVar: "--color-bg-inverse", hex: color.bg.inverse },
  { label: "text / primary", tw: "bg-text-primary", cssVar: "--color-text-primary", hex: color.text.primary },
  { label: "text / secondary", tw: "bg-text-secondary", cssVar: "--color-text-secondary", hex: color.text.secondary },
  { label: "text / muted", tw: "bg-text-muted", cssVar: "--color-text-muted", hex: color.text.muted },
  { label: "text / inverse", tw: "bg-text-inverse", cssVar: "--color-text-inverse", hex: color.text.inverse },
  { label: "line / subtle", tw: "bg-line-subtle", cssVar: "--color-line-subtle", hex: color.line.subtle },
  { label: "line / strong", tw: "bg-line-strong", cssVar: "--color-line-strong", hex: color.line.strong },
  { label: "accent / base", tw: "bg-accent-base", cssVar: "--color-accent-base", hex: color.accent.base },
  { label: "accent / hover", tw: "bg-accent-hover", cssVar: "--color-accent-hover", hex: color.accent.hover },
];

const typeRows: { label: string; tw: string; cssVar: string; rem: string; font: string; sample: string }[] = [
  {
    label: "h1",
    tw: "text-h1 font-display",
    cssVar: "--size-h1",
    rem: size.h1,
    font: "display",
    sample: "Design systems for products people trust with their money.",
  },
  {
    label: "h2",
    tw: "text-h2 font-display",
    cssVar: "--size-h2",
    rem: size.h2,
    font: "display",
    sample: "Four years designing investing products, with a developer's eye for constraints.",
  },
  {
    label: "h3",
    tw: "text-h3 font-display",
    cssVar: "--size-h3",
    rem: size.h3,
    font: "display",
    sample: "From engineer to interface designer.",
  },
  {
    label: "body",
    tw: "text-body font-body",
    cssVar: "--size-body",
    rem: size.body,
    font: "body",
    sample:
      "I spent four years building UI/UX for investing products, translating regulatory constraints and market data into interfaces that feel calm under pressure. Before that, I wrote the code myself — which is why I still think in components, states, and edge cases.",
  },
  {
    label: "small",
    tw: "text-small font-body",
    cssVar: "--size-small",
    rem: size.small,
    font: "body",
    sample: "Case studies, process notes, and the occasional note on spacing scales.",
  },
  {
    label: "caption",
    tw: "text-caption font-body",
    cssVar: "--size-caption",
    rem: size.caption,
    font: "body",
    sample: "Portfolio · Sanket Sugaonkar",
  },
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-8 sm:px-10 sm:py-16">
      <header className="flex flex-col gap-2 border-b border-line-subtle pb-8">
        <p className="text-caption font-mono uppercase tracking-wide text-text-muted">
          Design tokens
        </p>
        <h1 className="text-h1 font-display font-semibold text-text-primary">Styleguide</h1>
        <p className="text-body text-text-secondary">
          Every value in <code className="font-mono text-small">tokens.js</code>, rendered — colour,
          type, spacing, and radii, before a single portfolio section exists.
        </p>
      </header>

      {/* Colour */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 font-display font-semibold text-text-primary">Colour</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {colorGroups.map((c) => (
            <div
              key={c.label}
              className="flex flex-col overflow-hidden rounded-md border border-line-subtle"
            >
              <div className={`h-20 w-full ${c.tw}`} style={{ backgroundColor: c.hex }} />
              <div className="flex flex-col gap-0.5 bg-bg-surface p-3">
                <span className="text-small font-body text-text-primary">{c.label}</span>
                <span className="text-caption font-mono text-text-muted">{c.hex}</span>
                <span className="text-caption font-mono text-text-muted">{c.cssVar}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Type scale */}
      <section className="flex flex-col gap-6">
        <h2 className="text-h3 font-display font-semibold text-text-primary">Type scale</h2>
        <div className="flex flex-col gap-6">
          {typeRows.map((t) => (
            <div key={t.label} className="flex flex-col gap-1 border-b border-line-subtle pb-6">
              <div className="flex items-baseline gap-3 text-caption font-mono text-text-muted">
                <span>{t.label}</span>
                <span>{t.rem}</span>
                <span>{t.cssVar}</span>
                <span>font-{t.font}</span>
              </div>
              <p className={`${t.tw} text-text-primary`}>{t.sample}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-caption font-mono text-text-muted">
            font-mono — metadata, years, labels
          </span>
          <p className="font-mono text-small text-text-secondary">2022—2026 · SAN-004 · v1.0.0</p>
        </div>
      </section>

      {/* Spacing */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 font-display font-semibold text-text-primary">Spacing</h2>
        <div className="flex flex-col gap-3">
          {space.map((px, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="w-24 shrink-0 text-caption font-mono text-text-muted">
                space[{i}] · {px}px
              </span>
              <div
                className="h-3 rounded-sm bg-accent-base"
                style={{ width: `${Math.max(px, 2)}px` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Radii */}
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 font-display font-semibold text-text-primary">Radii</h2>
        <div className="flex flex-wrap items-end gap-6">
          {Object.entries(radius).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border border-line-strong bg-bg-surface"
                style={{ borderRadius: value }}
              />
              <span className="text-caption font-mono text-text-muted">
                {key} · {value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
