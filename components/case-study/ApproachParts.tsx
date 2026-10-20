import Image from "next/image";
import { Fragment } from "react";
import { cx } from "@/lib/cx";

export interface CasePart {
  src: string;
  alt: string;
  /** Shown above the part, e.g. "Simultaneous". */
  label: string;
  /** Intrinsic size of the 2x export, for layout before it loads. */
  width: number;
  height: number;
  /** Small components (a field, a chip row) get breathing room inside their card. */
  padded?: boolean;
}

export interface CaseFlowLane {
  /** Names the lane when a flow branches, e.g. "First nominee". */
  label?: string;
  steps: string[];
  /** Indexes of the steps this approach is about. */
  highlight: number[];
}

/** One lane for a straight journey, or several when it branches. */
export type CaseFlow = CaseFlowLane[];

/**
 * Just the part of the UI an approach changes: a strip of the journey with
 * the deciding step marked (split into labelled lanes where the flow
 * branches), then those components side by side (Simultaneous beside
 * Successive) on the case stage, tagged with the iteration when one is
 * given; a single component sits centred.
 */
export default function ApproachParts({
  flow,
  parts,
  label,
  tag,
}: {
  flow: CaseFlow;
  parts: CasePart[];
  label: string;
  /** A pill in the stage's top-left corner, e.g. "Iteration #1". */
  tag?: string;
}) {
  return (
    <div className="grid gap-[16px]">
      {/* A branching flow gets a callout, so the split between lanes reads first. */}
      <div
        className={cx(
          "grid gap-[12px]",
          flow.some((lane) => lane.label) && "rounded-[16px] border border-case-green/25 bg-case-green/[0.06] p-[clamp(16px,3.3vw,24px)]"
        )}
      >
        {flow.map((lane) => (
          <div key={lane.label ?? lane.steps.join()} className="flex flex-wrap items-center gap-x-[12px] gap-y-[8px]">
            {lane.label && (
              <span className="w-full font-mono text-[14px] font-medium uppercase leading-[1.4] tracking-[0.06em] text-case-ink sm:w-[168px]">
                {lane.label}
              </span>
            )}
            <ol aria-label={lane.label ? `${lane.label}: steps` : "Where this happens in the flow"} className="flex flex-wrap items-center gap-[8px]">
              {lane.steps.map((step, i) => {
                const on = lane.highlight.includes(i);
                return (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li aria-hidden="true" className={cx("font-body text-[16px]", on ? "text-case-green" : "text-case-muted")}>
                        →
                      </li>
                    )}
                    <li
                      aria-current={on ? "step" : undefined}
                      className={cx(
                        "rounded-full px-[14px] py-[6px] font-body text-[14px] font-medium leading-[1.4]",
                        on ? "bg-case-green text-white" : "bg-bg-surface text-case-muted ring-1 ring-case-ink/10"
                      )}
                    >
                      {step}
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </div>
        ))}
      </div>

      <div
        role="group"
        aria-label={label}
        className={cx(
          "case-stage grid items-start gap-[28px] rounded-[20px] p-[clamp(16px,4.4vw,36px)]",
          parts.length > 1 ? "sm:grid-cols-2" : "justify-items-center"
        )}
      >
        {tag && (
          <span
            className={cx(
              "justify-self-start rounded-[8px] border border-card-apps bg-case-lavender px-[10px] py-[4px] font-body text-[14px] font-semibold leading-[1.4] text-case-purple shadow-[0_1px_2px_rgba(17,17,15,0.06)]",
              parts.length > 1 && "sm:col-span-2"
            )}
          >
            {tag}
          </span>
        )}
        {parts.map((part) => (
          <figure key={part.src} className={cx("m-0 grid min-w-0 content-start gap-[12px]", parts.length === 1 && "w-full max-w-[320px]")}>
            <figcaption className="font-mono text-[14px] uppercase leading-[1.4] tracking-[0.06em] text-case-muted">
              {part.label}
            </figcaption>
            <div
              className={cx(
                "overflow-hidden rounded-[14px] bg-bg-surface shadow-[0_0_0_1px_rgba(17,17,15,0.08),0_10px_28px_rgba(17,17,15,0.08)]",
                part.padded && "p-[16px]"
              )}
            >
              <Image
                src={part.src}
                alt={part.alt}
                width={part.width}
                height={part.height}
                unoptimized
                className="block h-auto w-full"
              />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
