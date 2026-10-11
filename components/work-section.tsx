import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";

interface WorkItem {
  year: string;
  title: string;
  description: string;
  gradient: string;
}

// Content pulled from the user's existing Framer portfolio's "My Projects"
// section. Structure (heading, then a stacked list of title + description +
// media, with a year/dot/line timeline down the left) is inspired by
// benshih.design's work section, per spec — capped at 3 entries, 2026-2024.
const WORK_ITEMS: WorkItem[] = [
  {
    year: "2026",
    title: "Redesigning the investment page for India's largest NBFC",
    description:
      "Investment Mall is a seamless platform that unifies investing across stocks, mutual funds, fixed deposits, and savings plans.",
    gradient: "from-[#CFEAD8] to-[#7FBF9E]",
  },
  {
    year: "2025",
    title: "Revamped one of the largest onboarding experiences for a brokerage app",
    description:
      "Transforming the onboarding journey of a leading brokerage app in a single, impactful move.",
    gradient: "from-[#E8B7C0] to-[#D9CFC0]",
  },
  {
    year: "2024",
    title: "Enhancing the IPO listing experience for India's largest NBFC firm",
    description: "Turning IPO frustration into understanding with simplicity, education, and insight.",
    gradient: "from-[#7FA0D6] to-[#3A5A8C]",
  },
];

// Reserves room for the dot + year marker to the left of each entry's
// content column; the connecting line runs through its horizontal center.
const MARKER_COLUMN_PX = 96;

function WorkEntry({ item, isLast }: { item: WorkItem; isLast: boolean }) {
  return (
    <article
      className={cx("relative", !isLast && "pb-16")}
      style={{ paddingLeft: MARKER_COLUMN_PX }}
    >
      <div className="absolute left-0 top-1 flex items-center gap-4">
        <span
          className="relative z-10 block h-[11px] w-[11px] shrink-0 rounded-full border-2 border-accent-base bg-bg-surface"
          aria-hidden="true"
        />
        <span className="font-display text-[26px] font-medium text-line-strong">{item.year}</span>
      </div>

      {/* benshih.design keeps a soft drop shadow under the media at rest
          (measured: 0px 4px 24px rgba(0,0,0,0.10)) and, per the reference
          recording, the whole card lifts with a heavier shadow on hover —
          the classic "pop up" elevation pattern. */}
      <div className="group">
        <h3 className="text-[22px] font-display font-semibold leading-[1.3] text-text-primary min-[700px]:text-[26px]">
          {item.title}
        </h3>
        <p className="mt-2 max-w-[42em] text-body font-medium leading-[1.5] text-text-secondary">
          {item.description}
        </p>
        {/* aspect-[32/9] rather than the usual 16/9 — this is a 50% height
            reduction at the same width, per spec ("reduce the image by 50%"). */}
        <div
          className={cx(
            "mt-6 aspect-[32/9] w-full rounded-[16px] bg-gradient-to-br",
            "shadow-[0px_4px_24px_rgba(0,0,0,0.10)] transition-[transform,box-shadow] duration-300 ease-out motion-reduce:transition-none",
            "group-hover:-translate-y-1 group-hover:shadow-[0px_16px_40px_rgba(0,0,0,0.18)]",
            item.gradient
          )}
          aria-hidden="true"
        />
      </div>
    </article>
  );
}

export default function WorkSection() {
  return (
    <section aria-labelledby="work-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className="p-[clamp(28px,4vw,56px)]">
          <h2
            id="work-heading"
            className="font-display font-semibold text-text-primary"
            style={{
              fontSize: "clamp(34px, 4.5vw, 56px)",
              letterSpacing: "-0.02em",
            }}
          >
            Some recent work
          </h2>
          <p className="mt-2 text-body text-text-secondary">(from full-time jobs)</p>

          <div className="relative mt-10">
            <div
              className="absolute top-0 bottom-0 w-px bg-line-subtle"
              style={{ left: `${MARKER_COLUMN_PX / 2 - 6}px` }}
              aria-hidden="true"
            />
            {WORK_ITEMS.map((item, i) => (
              <WorkEntry key={item.year} item={item} isLast={i === WORK_ITEMS.length - 1} />
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}
