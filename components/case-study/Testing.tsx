import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import { TestingIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_BODY_STACK, CASE_SUBHEADING_CLASS } from "./styles";

export interface TestingFact {
  label: string;
  value: string;
}

/** How the design was tested: a brief, then the set-up as small fact tiles and a caveat. */
export default function Testing({
  label,
  heading,
  body,
  facts,
  note,
}: {
  label: string;
  heading: string;
  body: string[];
  facts: TestingFact[];
  note: string;
}) {
  return (
    <CaseSection id="case-testing" icon={<TestingIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <div className={cx(CASE_BODY_CLASS, CASE_BODY_STACK)}>
          {body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="grid gap-[12px]">
        <dl className="grid gap-[12px] sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="grid content-start gap-[8px] rounded-[12px] bg-case-ink/[0.03] px-[16px] py-[16px]">
              <dt className="font-mono text-[14px] font-medium uppercase leading-[1.4] tracking-[0.06em] text-case-muted">{fact.label}</dt>
              <dd className="font-body text-[16px] leading-[1.5] tracking-[-0.01em] text-case-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <p className="font-body text-[14px] leading-[1.5] text-case-muted">{note}</p>
      </div>
    </CaseSection>
  );
}
