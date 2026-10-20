import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import { ReflectionIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_SUBHEADING_CLASS } from "./styles";

export interface ReflectionCard {
  title: string;
  body: string;
}

export interface ReflectionGroup {
  title: string;
  cards: ReflectionCard[];
}

/**
 * The closing section: what's still open, what I'd do differently and what
 * I'm taking from the project, as short cards in the Learnings style.
 */
export default function Reflection({
  label,
  heading,
  intro,
  groups,
}: {
  label: string;
  heading: string;
  intro: string;
  groups: ReflectionGroup[];
}) {
  return (
    <CaseSection id="case-reflection" icon={<ReflectionIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <p className={CASE_BODY_CLASS}>{intro}</p>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <h4 className="mb-[16px] font-mono text-[14px] font-medium uppercase tracking-[0.06em] text-case-muted">{group.title}</h4>
          <ul className="grid gap-[16px] sm:grid-cols-2">
            {group.cards.map((card) => (
              <li key={card.title} className={cx(
                  "grid content-start gap-[8px] rounded-[16px] bg-case-ink/[0.03] p-[clamp(16px,3.3vw,28px)]",
                  group.cards.length === 1 && "sm:col-span-2"
                )}>
                <h5 className="font-display text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-case-ink">{card.title}</h5>
                <p className="font-body text-[16px] leading-[1.5] tracking-[-0.01em] text-case-ink">{card.body}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </CaseSection>
  );
}
