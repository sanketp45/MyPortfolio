import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import CaseFigure, { type CaseFigureProps } from "./CaseFigure";
import { SummaryIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_BODY_STACK, CASE_SUBHEADING_CLASS } from "./styles";

export default function Summary({ text, figure }: { text: string; figure?: CaseFigureProps }) {
  return (
    <CaseSection id="case-summary" icon={<SummaryIcon width={20} height={20} />} title="TL;DR">
      <article className="grid gap-[28px]">
        <div>
          <h3 className={CASE_SUBHEADING_CLASS}>Summary</h3>
          <div className={cx(CASE_BODY_CLASS, CASE_BODY_STACK)}>
            <p>{text}</p>
          </div>
        </div>
        {figure && <CaseFigure {...figure} />}
        <p className="font-serif text-[20px] italic leading-[1.3] text-case-green">Let&apos;s get into it.</p>
      </article>
    </CaseSection>
  );
}
