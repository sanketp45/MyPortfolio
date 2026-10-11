import type { Metadata } from "next";
import { Panel } from "@/components/panel";
import { WritingCard } from "@/components/writing";
import { VIBE_PROJECTS } from "@/lib/vibe-projects";
import { SectionHeading, SECTION_PAD } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Play — Sanket Sugaonkar",
  description:
    "Vibe-coded side projects by Sanket Sugaonkar: Figma plugins, a Chrome extension, apps, games, and experiments built with AI tools.",
};

export default function PlayPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section aria-labelledby="play-heading" className="bg-bg-canvas pb-5">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              as="h1"
              id="play-heading"
              eyebrow={`Play · ${VIBE_PROJECTS.length} projects`}
              title="I vibe code. Mostly to fix my own problems."
              subtitle="Plugins, extensions, apps, and small games I designed and built alongside my day job, with AI tools writing much of the code."
            />

            <div className="mt-[40px] grid grid-cols-1 gap-[40px] min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
              {VIBE_PROJECTS.map((project) => (
                <WritingCard key={project.href} post={project} />
              ))}
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}
