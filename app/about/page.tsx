import Image from "next/image";
import { Panel } from "@/components/panel";
import JourneyTimeline, { type JourneyEntry } from "@/components/journey-timeline";
import { cx } from "@/lib/cx";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/cta-styles";
import { LINKEDIN_URL, MAILTO, RESUME_URL } from "@/lib/site-links";
import CozyShelf from "@/components/cozy-shelf";
import MadridTifo from "@/components/madrid-tifo";
import { SectionHeading, SECTION_CONTENT_GAP, SECTION_PAD } from "@/components/section-heading";

const NEW_TAB_PROPS = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};

const CTA_BUTTON = BUTTON_PRIMARY;
const SECONDARY_BUTTON = BUTTON_SECONDARY;

const NARRATIVE_PARAGRAPHS = [
  "I started in computer engineering, but I was always drawn to a different question: not just whether software worked, but whether people could use it effortlessly.",
  "That curiosity led me to design. My engineering background still shapes how I work: I understand the code, collaborate closely with developers, and build beyond the design file.",
  "I've spent four years in design, and since July 2024 I've been designing fintech experiences at Bajaj Finserv across FDs, mutual funds, stocks, and IPOs. During an onboarding revamp, my work on the KYC flow improved task completion by 30%.",
  "I also build tools to solve problems I face daily. CharCount is now used across the design team at Bajaj, and my Figma QA Annotator helps simplify visual QA.",
  "Today, I'm exploring AI-assisted design workflows using Figma MCP and Claude, and sharing what they mean for the future of design.",
];

// From the resume, newest first.
const EDUCATION = [
  {
    institution: "Indira College of Engineering and Management, Pune",
    qualification: "Bachelor of Engineering, Computer Engineering",
    years: "June 2016 – June 2019",
  },
  {
    institution: "Government Polytechnic, Pune",
    qualification: "Diploma, Computer Engineering",
    years: "June 2013 – June 2016",
  },
];

// From the resume, newest first. Bullets are the three or four key lines
// per role, trimmed from the resume wording.
const JOURNEY: JourneyEntry[] = [
  {
    dateRange: "Jul 2024 – Present",
    shortRange: "24 – Now",
    company: "Bajaj Finserv",
    role: "Product Designer",
    employmentType: "Client location",
    summary:
      "Designing across the consumer investment platform: fixed deposits, mutual funds, and stocks (including IPOs and F&O), on both app and web.",
    bullets: [
      "Contributed to the BFL and BFSL onboarding revamp, where work on the KYC flow drove a 30% increase in task completion.",
      "Designed screens across fixed deposits, mutual funds, stocks, IPOs, and F&O, on app and web.",
      "Supported A/B tests across FD, stocks, and IPOs with design variants and performance reads.",
      "Built and reused shared design system components across products.",
    ],
  },
  {
    dateRange: "Dec 2023 – Mar 2024",
    shortRange: "23 – 24",
    company: "Procreator Global Design Agency",
    role: "Associate UI/UX Designer",
    employmentType: "Agency",
    summary: "Client projects at a design agency, from requirements to production-ready UI.",
    bullets: [
      "Turned client requirements and user stories into pixel-perfect UI.",
      "Managed brand colour guidelines across the platform.",
      "Ran surveys and competitor analysis to inform design decisions.",
    ],
  },
  {
    dateRange: "Jul 2021 – Mar 2023",
    shortRange: "21 – 23",
    company: "Rapid Innovation",
    role: "Associate UI/UX Designer",
    employmentType: "Remote",
    summary: "Product design for NFT and DeFi blockchain projects.",
    bullets: [
      "Defined user requirements and experience goals for NFT and DeFi projects with PMs and engineers.",
      "Created wireframes, personas, prototypes, and high fidelity designs in Figma.",
      "Built and maintained design systems, style guides, and UI libraries.",
    ],
  },
];

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero + narrative + buttons + education, one panel, two columns —
          matches benshih.design/about's structure: text and actions on the
          left, a portrait photo with an Education card beneath it on the
          right. */}
      <section className="bg-bg-canvas">
        <Panel className="mt-5 bg-bg-surface">
          <div className={cx("grid grid-cols-1 gap-[40px] min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]", SECTION_PAD)}>
            <div>
              <h1
                className="font-display font-bold text-accent-base"
                style={{ fontSize: "clamp(38px, 5.5vw, 68px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
              >
                From engineering
                <br />to design.
              </h1>

              <div className="mt-8 max-w-[34em]">
                {NARRATIVE_PARAGRAPHS.map((paragraph, i) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className={cx("font-body text-[20px] leading-[1.65] text-text-primary", i > 0 && "mt-[20px]")}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <a href={RESUME_URL} {...NEW_TAB_PROPS} className={CTA_BUTTON}>
                  View resume
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a href={LINKEDIN_URL} {...NEW_TAB_PROPS} className={SECONDARY_BUTTON}>
                  LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>

            {/* Portrait + Education: hidden below 900px, where the grid is a
                single column, so phones go straight from the intro to the
                journey (as on benshih.design). */}
            <div className="max-[899px]:hidden">
              <Image
                src="/photos/myimage.jpg"
                alt="Portrait of Sanket Sugaonkar"
                width={180}
                height={180}
                sizes="180px"
                className="mx-auto block aspect-square w-full max-w-[180px] rounded-full bg-line-subtle object-cover"
              />

              <div className="mt-8 rounded-[16px] bg-bg-canvas p-6">
                <h2 className="text-[22px] font-display font-bold text-accent-base">Education</h2>
                <div className="mt-4 flex flex-col">
                  {EDUCATION.map((edu, i) => (
                    <div key={edu.institution} className={cx("py-4", i > 0 && "border-t border-line-subtle")}>
                      <p className="text-[18px] font-body font-medium text-text-primary">{edu.institution}</p>
                      <p className="mt-1 text-[16px] font-body text-text-primary">{edu.qualification}</p>
                      <p className="mt-0.5 font-mono text-[14px] text-text-primary">{edu.years}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* Journey timeline */}
      <section className="bg-bg-canvas">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              title="My journey"
              subtitle="Computer engineer by training, designer since 2021. From blockchain products to the screens where people decide what to do with their savings."
            />
            <div className={SECTION_CONTENT_GAP}>
              <JourneyTimeline entries={JOURNEY} />
            </div>
          </div>
        </Panel>
      </section>

      {/* Reading: the bookshelf */}
      <section className="bg-bg-canvas">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              title="On my shelf"
              subtitle="Mostly fiction, one book at a time, with the odd book on habits or design in between."
            />
            <div className={SECTION_CONTENT_GAP}>
              <CozyShelf />
            </div>
          </div>
        </Panel>
      </section>

      {/* Real Madrid: a card tifo in a 3D stand, after Tifoista */}
      <section className="bg-bg-canvas">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              title="Hala Madrid"
              subtitle="Real Madrid, first and last."
            />
            <div className={SECTION_CONTENT_GAP}>
              <MadridTifo />
            </div>
          </div>
        </Panel>
      </section>

      {/* Closing CTA: one action, email. */}
      <section className="bg-bg-canvas">
        <Panel className="mt-5 bg-bg-surface">
          <div className={SECTION_PAD}>
            <SectionHeading
              title={<>If you are building something people trust with their money, or their time, let&apos;s talk.</>}
              subtitle="The work I care about is the unglamorous kind. Flows people finish, numbers they understand, tools that remove a step. If that is what you are building, I would like to hear about it."
            />
            <a href={MAILTO} className={cx(CTA_BUTTON, "mt-[28px]")}>
              Email me
            </a>
          </div>
        </Panel>
      </section>
    </main>
  );
}
