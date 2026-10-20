import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import { ProblemIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_BODY_STACK } from "./styles";

export interface ProblemPart {
  text: string;
  /** The part's role in the sentence, e.g. Trigger, Change, Need, Goal. */
  tag: string;
  accent?: boolean;
}

/**
 * One sentence split into tagged parts that wrap like a sentence. On desktop
 * each part carries a hairline and padding on its left; the list is shifted
 * left by that much inside a clipping wrapper, so the hairline on whichever
 * part starts a row is clipped and lines only ever sit *between* parts.
 */
export default function ProblemStatement({ intro, parts }: { intro?: string[]; parts: ProblemPart[] }) {
  return (
    <CaseSection id="case-problem" icon={<ProblemIcon width={20} height={20} />} title="Problem Statement">
      {intro && intro.length > 0 && (
        <div className={cx(CASE_BODY_CLASS, CASE_BODY_STACK)}>
          {intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      )}
      <div className="overflow-hidden">
        <p className="flex flex-col gap-y-[28px] md:-ml-[21px] md:flex-row md:flex-wrap md:gap-y-[32px]">
          {parts.map((part) => (
            <span
              key={part.tag}
              className="flex flex-col md:grow md:basis-[280px] md:border-l md:border-case-ink/[0.14] md:px-[20px]"
            >
              <span
                className={cx(
                  "font-display text-[18px] font-semibold leading-[1.4] tracking-[-0.02em] md:text-[20px]",
                  part.accent ? "text-case-green" : "text-case-ink"
                )}
              >
                {part.text}
              </span>
              <span
                className={cx(
                  "mt-[8px] font-mono text-[14px] font-medium uppercase tracking-[0.06em]",
                  part.accent ? "text-case-green" : "text-case-muted"
                )}
              >
                {part.tag}
              </span>
            </span>
          ))}
        </p>
      </div>
    </CaseSection>
  );
}
