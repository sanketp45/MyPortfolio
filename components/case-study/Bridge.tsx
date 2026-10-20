import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import { BridgeIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_SUBHEADING_CLASS } from "./styles";

export interface BridgeCard {
  title: string;
  text: string;
  /** Small drawing for the card's tile, e.g. ChooseGlyph. */
  glyph: ReactNode;
}

/**
 * Hand-off from research to design, in the usual section shell: a
 * subheading and short brief, then the jobs the design had to do as numbered
 * cards (a soft tile with a small drawing over a title and one line), and a
 * closing line hooked to them by a curved rule.
 */
export default function Bridge({
  label,
  heading,
  body,
  cards,
  closing,
}: {
  label: string;
  heading: string;
  body: string;
  cards: BridgeCard[];
  closing: string;
}) {
  return (
    <CaseSection id="bridge" icon={<BridgeIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <p className={CASE_BODY_CLASS}>{body}</p>
      </div>

      <div>
        <ol className="grid gap-[36px] sm:grid-cols-3 sm:gap-[28px]">
          {cards.map((card, i) => (
            <li key={card.title} className="grid content-start gap-[28px] sm:gap-[36px]">
              <div className="flex h-[69px] w-[115px] items-center justify-center rounded-[12px] bg-case-ink/[0.03]">
                {card.glyph}
              </div>
              <div className="grid gap-[8px]">
                <h4 className="font-display text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] text-case-ink">
                  {i + 1}. {card.title}
                </h4>
                <p className="font-body text-[16px] leading-[1.5] tracking-[-0.01em] text-case-muted">{card.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-[24px] flex items-start gap-[12px] sm:mt-[16px]">
          <svg viewBox="0 0 48 36" className="hidden h-[36px] w-[48px] shrink-0 text-case-ink/25 sm:block" fill="none" aria-hidden="true">
            <path d="M1 0c0 20 14 34 46 34" stroke="currentColor" strokeWidth="1" />
          </svg>
          <p className={cx(CASE_BODY_CLASS, "sm:pt-[20px]")}>{closing}</p>
        </div>
      </div>
    </CaseSection>
  );
}

// Card drawings: 60×38, in ink tints with a touch of green, after the
// reference's small grey tiles.

const glyphProps = { viewBox: "0 0 60 38", width: 60, height: 38, fill: "none", "aria-hidden": true } as const;

/** Two type options, the second picked. */
export function ChooseGlyph() {
  return (
    <svg {...glyphProps}>
      <rect x="6" y="3" width="48" height="13" rx="4" className="fill-white stroke-case-ink/15" />
      <circle cx="13" cy="9.5" r="2.6" className="stroke-case-ink/35" strokeWidth="1.2" />
      <rect x="19" y="8.3" width="22" height="2.4" rx="1.2" className="fill-case-ink/20" />
      <rect x="6" y="21" width="48" height="13" rx="4" className="fill-white stroke-case-green" />
      <circle cx="13" cy="27.5" r="2.6" className="stroke-case-green" strokeWidth="1.2" />
      <circle cx="13" cy="27.5" r="1.2" className="fill-case-green" />
      <rect x="19" y="26.3" width="26" height="2.4" rx="1.2" className="fill-case-ink/55" />
    </svg>
  );
}

/** Three people added, room for a fourth. */
export function AddGlyph() {
  return (
    <svg {...glyphProps}>
      <circle cx="14" cy="19" r="7.5" className="fill-card-work stroke-white" strokeWidth="1.6" />
      <circle cx="24" cy="19" r="7.5" className="fill-card-apps stroke-white" strokeWidth="1.6" />
      <circle cx="34" cy="19" r="7.5" className="fill-card-talks stroke-white" strokeWidth="1.6" />
      <circle cx="47" cy="19" r="7" className="fill-white stroke-case-ink/30" strokeDasharray="2 2" />
      <path d="M47 16v6M44 19h6" className="stroke-case-ink/50" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** The split as a bar, over the order as a list. */
export function ReviewGlyph() {
  return (
    <svg {...glyphProps}>
      <rect x="7" y="6" width="23" height="5" rx="2.5" className="fill-card-work" />
      <rect x="31" y="6" width="13" height="5" rx="2.5" className="fill-card-apps" />
      <rect x="45" y="6" width="8" height="5" rx="2.5" className="fill-card-talks" />
      <circle cx="10" cy="21" r="3" className="fill-case-green" />
      <rect x="16" y="19.8" width="26" height="2.4" rx="1.2" className="fill-case-ink/55" />
      <circle cx="10" cy="30" r="3" className="fill-case-ink/20" />
      <rect x="16" y="28.8" width="20" height="2.4" rx="1.2" className="fill-case-ink/20" />
    </svg>
  );
}
