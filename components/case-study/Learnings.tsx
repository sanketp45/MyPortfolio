import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import { LearningsIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_SUBHEADING_CLASS } from "./styles";

export interface LearningCard {
  stat: string;
  statLabel: string;
  title: string;
  body?: string;
  /** Original Hindi, shown small above the English. */
  quoteHi?: string;
  quoteEn?: string;
  attribution?: string;
}

export interface LearningGroup {
  title: string;
  tone: "good" | "bad";
  cards: LearningCard[];
}

/**
 * What testing showed: groups of finding cards (kept vs. didn't work), each
 * a stat, a title, a line of context and a participant quote.
 */
export default function Learnings({
  label,
  heading,
  intro,
  groups,
}: {
  label: string;
  heading: string;
  intro: string;
  groups: LearningGroup[];
}) {
  return (
    <CaseSection id="case-learnings" icon={<LearningsIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <p className={CASE_BODY_CLASS}>{intro}</p>
      </div>

      {groups.map((group) => (
        <div key={group.title}>
          <h4
            className={cx(
              "mb-[16px] font-mono text-[14px] font-medium uppercase tracking-[0.06em]",
              group.tone === "good" ? "text-case-green" : "text-case-red"
            )}
          >
            {group.title}
          </h4>
          <ul className="grid gap-[16px] sm:grid-cols-2">
            {group.cards.map((card) => (
              <li key={card.statLabel} className="grid content-start gap-[16px] rounded-[16px] bg-case-ink/[0.03] p-[clamp(16px,3.3vw,28px)]">
                <div className="grid gap-[4px]">
                  <span
                    className={cx(
                      "font-display text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]",
                      group.tone === "good" ? "text-case-green" : "text-case-red"
                    )}
                  >
                    {card.stat}
                  </span>
                  <span className="font-body text-[14px] leading-[1.4] text-case-muted">{card.statLabel}</span>
                </div>
                <div className="grid gap-[8px]">
                  <h5 className="font-display text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-case-ink">{card.title}</h5>
                  {card.body && <p className="font-body text-[16px] leading-[1.5] tracking-[-0.01em] text-case-ink">{card.body}</p>}
                </div>
                {card.quoteEn && (
                  <figure className="m-0 grid gap-[8px] border-l-2 border-case-ink/[0.14] pl-[12px]">
                    {card.quoteHi && (
                      <p lang="hi" className="font-body text-[14px] leading-[1.5] text-case-muted">
                        “{card.quoteHi}”
                      </p>
                    )}
                    <blockquote className="m-0 font-serif text-[18px] italic leading-[1.35] text-case-ink">“{card.quoteEn}”</blockquote>
                    {card.attribution && (
                      <figcaption className="font-mono text-[14px] uppercase leading-[1.4] tracking-[0.06em] text-case-muted">
                        {card.attribution}
                      </figcaption>
                    )}
                  </figure>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </CaseSection>
  );
}
