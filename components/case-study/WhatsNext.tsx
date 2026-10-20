import CaseSection from "./CaseSection";
import { NextIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_SUBHEADING_CLASS } from "./styles";

export interface NextItem {
  title: string;
  text: string;
}

/** What comes after the redesign: a short brief, then numbered items in the Bridge card type. */
export default function WhatsNext({
  label,
  heading,
  intro,
  items,
}: {
  label: string;
  heading: string;
  intro: string;
  items: NextItem[];
}) {
  return (
    <CaseSection id="case-next" icon={<NextIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <p className={CASE_BODY_CLASS}>{intro}</p>
      </div>

      <ol className="grid gap-[36px] sm:grid-cols-3 sm:gap-[28px]">
        {items.map((item, i) => (
          <li key={item.title} className="grid content-start gap-[8px]">
            <h4 className="font-display text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-case-ink">
              {i + 1}. {item.title}
            </h4>
            <p className="font-body text-[16px] leading-[1.5] tracking-[-0.01em] text-case-muted">{item.text}</p>
          </li>
        ))}
      </ol>
    </CaseSection>
  );
}
