import SiteNav from "@/components/site-nav";

const rows: { title: string; note: string; render: () => React.ReactNode }[] = [
  {
    title: "Default",
    note: "Resting state — no link current, nothing hovered, nothing focused.",
    render: () => <SiteNav />,
  },
  {
    title: "Hover",
    note:
      "Play: hover on a default link. About: hover on the current link (accent/hover — darker, not lighter). Say hello: hover on the primary button.",
    render: () => (
      <SiteNav
        forceLinks={{ play: "hover", about: "currentHover" }}
        forceSayHello="hover"
      />
    ),
  },
  {
    title: "Current page",
    note: 'Home is marked current at rest — aria-current="page", accent/base fill, text/inverse label, weight 500.',
    render: () => <SiteNav forceLinks={{ home: "current" }} />,
  },
  {
    title: "Focus-visible & active press",
    note:
      "Play: focus ring (2px accent/base, 2px offset). About: active press (scale 0.98). Say hello: focus ring. LinkedIn: active press.",
    render: () => (
      <SiteNav
        forceLinks={{ play: "focus", about: "active" }}
        forceSayHello="focus"
        forceLinkedIn="active"
      />
    ),
  },
];

export default function NavStyleguidePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-2 border-b border-line-subtle pb-8">
        <p className="text-caption font-mono uppercase tracking-wide text-text-muted">
          Component styleguide
        </p>
        <h1 className="text-h1 font-display font-semibold text-text-primary">Site nav — states</h1>
        <p className="text-body text-text-secondary">
          Every required interaction state, forced into view without needing to hover, focus, or
          click anything.
        </p>
      </header>

      {rows.map((row) => (
        <section key={row.title} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-h3 font-display font-semibold text-text-primary">{row.title}</h2>
            <p className="text-small text-text-secondary">{row.note}</p>
          </div>
          <div className="overflow-hidden rounded-md border border-line-subtle">
            {row.render()}
          </div>
        </section>
      ))}
    </main>
  );
}
