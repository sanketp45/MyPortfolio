import WorkTimeline from "@/components/work-timeline";
import { DEFAULT_WORK_ITEMS } from "@/lib/work-timeline-items";

const REST_ITEM = DEFAULT_WORK_ITEMS[0];
const LOCKED_ITEM = { ...DEFAULT_WORK_ITEMS[1], locked: true };

function DemoLabel({ children }: { children: string }) {
  return (
    <p className="mb-3 text-caption font-mono uppercase tracking-wide text-text-muted">
      {children}
    </p>
  );
}

export default function WorkTimelineStyleguidePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10 flex flex-col gap-2 border-b border-line-subtle pb-8">
        <p className="text-caption font-mono uppercase tracking-wide text-text-muted">
          Component styleguide
        </p>
        <h1 className="text-h1 font-display font-semibold text-text-primary">Work timeline</h1>
        <p className="max-w-2xl text-body text-text-secondary">
          The &quot;recent work&quot; section: a year/marker timeline down the left, each item a
          two-column row of title, description, and 16/10 media. Hover or tab to a title to see
          the real interaction; the four blocks below force each visual state for review without
          needing a pointer.
        </p>
      </header>

      <section className="mb-16">
        <DemoLabel>Rest</DemoLabel>
        <WorkTimeline items={[REST_ITEM]} />
      </section>

      <section className="mb-16">
        <DemoLabel>Hover (forced)</DemoLabel>
        <WorkTimeline items={[REST_ITEM]} demoStates={["hover"]} />
      </section>

      <section className="mb-16">
        <DemoLabel>Focus-visible (forced)</DemoLabel>
        <p className="mb-3 max-w-2xl text-small text-text-secondary">
          Identical classes to hover per spec (group-hover and group-focus-within share every
          rule), so this renders the same as the block above — the real difference is what
          triggers it: landing keyboard focus on the title link, not the pointer.
        </p>
        <WorkTimeline items={[REST_ITEM]} demoStates={["focus"]} />
      </section>

      <section className="mb-16">
        <DemoLabel>Locked, hover (forced)</DemoLabel>
        <p className="mb-3 max-w-2xl text-small text-text-secondary">
          The item-level treatment (border tint, lift, marker fill, underline) forces the same as
          any other hover. The cursor tooltip itself is pointer-position-driven and only real on
          genuine hover with a mouse — hover the locked item in the live demo below to see it
          follow the cursor.
        </p>
        <WorkTimeline items={[LOCKED_ITEM]} demoStates={["locked-hover"]} />
      </section>

      <section>
        <DemoLabel>Live (all three items, real interaction)</DemoLabel>
        <WorkTimeline />
      </section>
    </main>
  );
}
