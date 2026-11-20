import type { Metadata } from "next";
import { Panel } from "@/components/panel";
import { SectionHeading, SECTION_PAD, SECTION_CONTENT_GAP } from "@/components/section-heading";
import { BUTTON_PRIMARY } from "@/components/cta-styles";

export const metadata: Metadata = {
  title: "Logic Doc Writer skill — Sanket Sugaonkar",
  description:
    "A Claude skill that reads a Figma journey design and writes its logic doc as yellow logic cards with pointers, for developers, QA and PMs.",
};

const ZIP_HREF = "/downloads/logic-doc-writer.zip";

const STEPS = [
  {
    title: "Reads the whole file",
    body: "Walks every journey section, scenario, drawer and widget state in the Figma file, and screenshots each one before writing a word.",
  },
  {
    title: "Builds a Logic Doc page",
    body: "Creates a new page that mirrors the design’s own sections, clones the real screens in, and places numbered yellow logic cards beside them.",
  },
  {
    title: "Points at the exact element",
    body: "Every card gets a pointer to the element it describes, tagged as Behaviour, Interaction or Validation, so nothing is left to guesswork.",
  },
  {
    title: "Reports back",
    body: "Lists what it covered, the design issues it spotted (typos, swapped labels, stale screens), and every default rule it assumed for you to confirm.",
  },
];

const INSTALL = [
  "Download the zip below.",
  "In Claude, open Settings → Capabilities → Skills and upload the zip (or unzip it into ~/.claude/skills/ for Claude Code).",
  "Connect the Figma MCP, then share a Figma journey link and ask Claude to write its logic doc.",
];

export default function LogicDocWriterPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section aria-labelledby="ldw-heading" className="bg-bg-canvas pb-5">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              as="h1"
              id="ldw-heading"
              eyebrow="Play · Claude skill"
              title="Logic Doc Writer"
              subtitle="A Claude skill that reads a Figma journey design in detail and writes its logic doc right inside Figma, as yellow logic cards with pointers, for developers, QA and PMs."
            />

            <div className="mt-[28px]">
              <a href={ZIP_HREF} download className={BUTTON_PRIMARY}>
                Download skill (.zip)
              </a>
            </div>

            <div className={`${SECTION_CONTENT_GAP} grid grid-cols-1 gap-[24px] min-[700px]:grid-cols-2`}>
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-[16px] bg-[#FFF7E0] p-[24px] text-[#1A1A1A]">
                  <div className="flex items-center gap-[10px]">
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#FEAF02] font-mono text-[13px] font-medium text-white">
                      {i + 1}
                    </span>
                    <h2 className="font-display text-[19px] font-bold">{step.title}</h2>
                  </div>
                  <p className="mt-[10px] font-body text-[16px] leading-[1.55]">{step.body}</p>
                </div>
              ))}
            </div>

            <div className={SECTION_CONTENT_GAP}>
              <h2 className="font-display text-[24px] font-bold text-accent-base">How to use it</h2>
              <ol className="mt-[16px] list-decimal space-y-[8px] pl-[22px] font-body text-[17px] leading-[1.55] text-text-primary">
                {INSTALL.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          </div>
        </Panel>
      </section>
    </main>
  );
}
