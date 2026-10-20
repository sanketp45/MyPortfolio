import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import ScreenRow, { type CaseScreen } from "./ScreenRow";
import FullScreens from "./FullScreens";
import ProsCons, { type ProsConsNotes } from "./ProsCons";
import ApproachParts, { type CaseFlow, type CasePart } from "./ApproachParts";
import { LearningsIcon, WorkIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_BODY_STACK, CASE_SUBHEADING_CLASS } from "./styles";

export interface WorkSubsection {
  heading: string;
  paragraphs: string[];
  /** Reference screens shown under the copy. */
  screens?: CaseScreen[];
  /** Where in the journey this subsection's change happens. */
  flow?: CaseFlow;
  /** Just the changed components; when set, the full screens move behind a toggle. */
  parts?: CasePart[];
  /** What the referenced product does well and badly. */
  notes?: ProsConsNotes;
  /** A pill on the parts stage, e.g. "Iteration #1". */
  tag?: string;
  /** The reasoning behind the approach, set as a working note. */
  thinking?: string;
  /** Why the approach was dropped, under a dashed rule in the same note. */
  movedOn?: string;
  /** The call that closes a set of approaches, in a highlighted box. */
  decision?: { title: string; body: string };
}

/**
 * A section of subsections, each a heading, copy, optional screens and
 * optional good/bad notes. Defaults to "Getting to work"; pass id, title and
 * icon to reuse the same layout for another section, or title={null} (with
 * a label) to run on from the section before without a heading.
 */
export default function GettingToWork({
  subsections,
  id = "case-work",
  title = "Getting to work",
  icon = <WorkIcon width={20} height={20} />,
  label,
  stickyNotes = false,
}: {
  subsections: WorkSubsection[];
  id?: string;
  title?: string | null;
  icon?: ReactNode;
  label?: string;
  /** Show the good and bad notes as sticky notes, for research. */
  stickyNotes?: boolean;
}) {
  return (
    <CaseSection id={id} icon={icon} title={title} label={label}>
      {subsections.map((sub) => (
        <article key={sub.heading} className="grid gap-[32px]">
          <div>
            <h3 className={CASE_SUBHEADING_CLASS}>{sub.heading}</h3>
            <div className={cx(CASE_BODY_CLASS, CASE_BODY_STACK)}>
              {sub.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
          {sub.parts && sub.flow ? (
            <div className="grid gap-[16px]">
              <ApproachParts flow={sub.flow} parts={sub.parts} label={`${sub.heading} components`} tag={sub.tag} />
              {sub.screens && sub.screens.length > 0 && (
                <FullScreens screens={sub.screens} label={`${sub.heading} screens`} />
              )}
            </div>
          ) : (
            sub.screens && sub.screens.length > 0 && <ScreenRow screens={sub.screens} label={`${sub.heading} screens`} />
          )}
          {sub.notes && <ProsCons notes={sub.notes} sticky={stickyNotes} />}
          {sub.thinking && (
            <div className="grid gap-[12px] rounded-[16px] bg-case-lavender px-[clamp(24px,3.3vw,32px)] py-[clamp(20px,2.9vw,28px)]">
              <span className="flex items-center gap-[6px] font-mono text-[14px] font-medium leading-[1.4] text-case-purple">
                <LearningsIcon width={16} height={16} />
                Thinking
              </span>
              <p className="pl-[22px] font-mono text-[14px] leading-[1.7] text-case-muted">{sub.thinking}</p>
              {sub.movedOn && (
                <>
                  <hr className="my-[4px] ml-[22px] border-0 border-t border-dashed border-case-purple/30" />
                  <span className="pl-[22px] font-mono text-[14px] font-medium leading-[1.4] text-case-purple">Why we moved on</span>
                  <p className="pl-[22px] font-mono text-[14px] leading-[1.7] text-case-muted">{sub.movedOn}</p>
                </>
              )}
            </div>
          )}
          {sub.decision && (
            <div className="rounded-[16px] bg-case-lavender px-[clamp(24px,3.3vw,32px)] py-[clamp(20px,2.9vw,28px)]">
              <p className="font-display text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-case-ink">{sub.decision.title}</p>
              <p className="mt-[8px] font-body text-[16px] leading-[1.6] tracking-[-0.016em] text-case-muted">{sub.decision.body}</p>
            </div>
          )}
        </article>
      ))}
    </CaseSection>
  );
}
