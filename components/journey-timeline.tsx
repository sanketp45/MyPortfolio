"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { cx } from "@/lib/cx";

export interface JourneyEntry {
  dateRange: string;
  // Compact years for the pill, e.g. "24 – Now".
  shortRange: string;
  company: string;
  role: string;
  employmentType: string;
  summary: string;
  bullets: string[];
}

const SOFT_SHADOW = "shadow-[0px_12px_32px_rgba(0,0,0,0.12)]";
const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base";

/** The pill face: years | company over role. Shared by both layouts. */
function PillFace({ entry }: { entry: JourneyEntry }) {
  return (
    <>
      <span className="shrink-0 font-mono text-[13px] text-text-inverse/80">{entry.shortRange}</span>
      <span aria-hidden="true" className="h-[24px] w-px shrink-0 bg-text-inverse/30" />
      <span className="flex min-w-0 flex-col text-left">
        <span className="font-display text-[17px] font-bold leading-[1.2]">{entry.company}</span>
        <span className="font-body text-[13px] leading-[1.3] text-text-inverse/80">{entry.role}</span>
      </span>
    </>
  );
}

function Details({ entry }: { entry: JourneyEntry }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px]">
        <span className="font-mono text-caption uppercase tracking-[0.06em] text-text-primary">
          {entry.dateRange}
        </span>
        <span className="rounded-pill bg-bg-canvas px-[10px] py-[2px] font-body text-[12px] font-medium text-text-primary">
          {entry.employmentType}
        </span>
      </div>
      <ul className="mt-[10px] list-disc space-y-[6px] pl-[18px] font-body text-[14px] leading-[1.5] text-text-primary marker:text-accent-base">
        {entry.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </>
  );
}

export default function JourneyTimeline({ entries }: { entries: JourneyEntry[] }) {
  // Desktop: which pill's details are open. Opened by hover, keyboard focus,
  // or a tap; closed by leaving, blurring, a second tap, or Escape.
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  useEffect(() => {
    if (open === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Spread the pills diagonally across the panel: the last one ends up
  // about halfway across, whatever the number of roles.
  const step = entries.length > 1 ? 50 / (entries.length - 1) : 0;

  return (
    <>
      {/* 900px and up: diagonal pills, details on hover/focus/tap. Cards
          open beside the first pill and above the others, so only a
          little room is kept below the list (for the first card, which is
          the tallest) instead of a whole card's height. */}
      <ol className="hidden flex-col gap-[16px] pb-[56px] min-[900px]:flex">
        {entries.map((entry, i) => {
          const isOpen = open === i;
          const detailsId = `${baseId}-${i}`;
          return (
            <li
              key={entry.company}
              style={{ "--offset": `${i * step}%` } as CSSProperties}
              className={cx("relative ml-[var(--offset)] w-fit", isOpen && "z-10")}
              onMouseEnter={() => setOpen(i)}
              onMouseLeave={() => setOpen((cur) => (cur === i ? null : cur))}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={detailsId}
                onClick={() => setOpen((cur) => (cur === i ? null : i))}
                onFocus={() => setOpen(i)}
                onBlur={() => setOpen((cur) => (cur === i ? null : cur))}
                className={cx(
                  "flex items-center gap-[16px] rounded-pill bg-accent-base py-[12px] pr-[28px] pl-[24px] text-text-inverse",
                  "motion-safe:transition-[transform,box-shadow,background-color] motion-safe:duration-200 motion-safe:ease-out",
                  "hover:bg-accent-hover",
                  isOpen && cx(SOFT_SHADOW, "motion-safe:-translate-y-[2px]"),
                  FOCUS_RING
                )}
              >
                <PillFace entry={entry} />
              </button>

              <div
                id={detailsId}
                hidden={!isOpen}
                className={cx(
                  "absolute w-[380px] rounded-[20px] border border-line-strong bg-bg-surface p-[20px]",
                  SOFT_SHADOW,
                  // First pill: card to its right (nothing above it). The
                  // rest open upward over the pills before them.
                  i === 0 ? "top-0 left-full ml-[12px]" : "bottom-full left-0 mb-[10px]",
                  "motion-safe:transition-[opacity,translate] motion-safe:duration-150",
                  "motion-safe:starting:translate-y-[4px] motion-safe:starting:opacity-0"
                )}
              >
                <Details entry={entry} />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Phones and small tablets: no hover, so every role shows its details. */}
      <ol className="flex flex-col gap-[16px] min-[900px]:hidden">
        {entries.map((entry) => (
          <li key={entry.company} className="rounded-[20px] border border-line-strong bg-bg-surface">
            <div className="flex items-center gap-[14px] rounded-t-[19px] bg-accent-base px-[20px] py-[12px] text-text-inverse">
              <PillFace entry={entry} />
            </div>
            <div className="p-[20px]">
              <Details entry={entry} />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
