import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { WritingCard } from "@/components/writing";
import { VIBE_PROJECTS } from "@/lib/vibe-projects";
import { SectionHeading, SECTION_CONTENT_GAP, SECTION_PAD } from "@/components/section-heading";

export default function OtherWork() {
  return (
    <section aria-labelledby="other-work-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className={SECTION_PAD}>
          <SectionHeading
            id="other-work-heading"
            title="Some other things I do"
            subtitle="I vibe code. Mostly to fix my own problems."
          />

          <div className={cx(SECTION_CONTENT_GAP, "grid grid-cols-1 gap-[40px] min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3")}>
            {VIBE_PROJECTS.slice(0, 3).map((project) => (
              <WritingCard key={project.title} post={project} />
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}
