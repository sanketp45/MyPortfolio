import Image from "next/image";
import { cx } from "@/lib/cx";
import CaseSection from "./CaseSection";
import FullScreens from "./FullScreens";
import type { CaseScreen } from "./ScreenRow";
import { ChangesIcon } from "./icons";
import { CASE_BODY_CLASS, CASE_BODY_STACK, CASE_SUBHEADING_CLASS } from "./styles";

export interface ChangePart {
  src: string;
  alt: string;
  /** Intrinsic size of the 2x crop, for layout before it loads. */
  width: number;
  height: number;
}

export interface ChangePair {
  /** Names the part when a screen has several, e.g. "Successive". */
  label?: string;
  /** A crop of the old part, or a line saying it didn't exist. */
  before: ChangePart | { text: string };
  after: ChangePart;
}

export interface ChangeComparison {
  title: string;
  pairs: ChangePair[];
  screens: CaseScreen[];
}

const CARD_CLASS =
  "overflow-hidden rounded-[14px] bg-bg-surface shadow-[0_0_0_1px_rgba(17,17,15,0.08),0_10px_28px_rgba(17,17,15,0.08)]";

const CAPTION_CLASS = "font-mono text-[14px] font-medium uppercase leading-[1.4] tracking-[0.06em]";

function Part({ part }: { part: ChangePart }) {
  return (
    <div className={CARD_CLASS}>
      <Image src={part.src} alt={part.alt} width={part.width} height={part.height} unoptimized className="block h-auto w-full" />
    </div>
  );
}

/**
 * What changed after testing, shown as just the parts that changed: each
 * old crop beside its new one on the case stage, with the full screens
 * behind a toggle.
 */
export default function Changes({
  label,
  heading,
  intro,
  comparisons,
}: {
  label: string;
  heading: string;
  intro: string[];
  comparisons: ChangeComparison[];
}) {
  return (
    <CaseSection id="case-changes" icon={<ChangesIcon width={20} height={20} />} title={label}>
      <div>
        <h3 className={CASE_SUBHEADING_CLASS}>{heading}</h3>
        <div className={cx(CASE_BODY_CLASS, CASE_BODY_STACK)}>
          {intro.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </div>

      {comparisons.map((comparison) => (
        <div key={comparison.title} className="grid gap-[16px]">
          <h4 className={cx(CAPTION_CLASS, "text-case-ink")}>{comparison.title}</h4>
          <div
            role="group"
            aria-label={`${comparison.title}: before and after`}
            className="case-stage grid gap-[clamp(24px,4.4vw,36px)] rounded-[20px] p-[clamp(16px,4.4vw,36px)]"
          >
            <div aria-hidden="true" className="grid grid-cols-2 gap-[clamp(12px,3.3vw,28px)]">
              <span className={cx(CAPTION_CLASS, "text-case-muted")}>Before</span>
              <span className={cx(CAPTION_CLASS, "text-case-green")}>After</span>
            </div>
            {comparison.pairs.map((pair) => (
              <div key={pair.after.src} className="grid gap-[12px]">
                {pair.label && <span className="font-body text-[14px] font-medium leading-[1.4] text-case-ink">{pair.label}</span>}
                <div className="grid grid-cols-2 items-start gap-[clamp(12px,3.3vw,28px)]">
                  {"src" in pair.before ? (
                    <Part part={pair.before} />
                  ) : (
                    <p className="rounded-[14px] border border-dashed border-case-ink/20 px-[16px] py-[28px] text-center font-body text-[14px] leading-[1.5] text-case-muted">
                      {pair.before.text}
                    </p>
                  )}
                  <Part part={pair.after} />
                </div>
              </div>
            ))}
          </div>
          <FullScreens screens={comparison.screens} label={`${comparison.title} screens`} />
        </div>
      ))}
    </CaseSection>
  );
}
