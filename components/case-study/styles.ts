// Shared type treatments for case-study pages, in the site's own faces:
// Gabarito headings, Hanken Grotesk copy and JetBrains Mono labels, in
// near-black ink with warm-grey muted text and a green marker on subsection
// headings.

/** The single reading column every case-study block sits in. */
export const CASE_COLUMN_CLASS = "mx-auto w-full max-w-[728px] px-[clamp(20px,6.2vw,32px)] md:px-0";

/** Whitespace before each case-study section. */
export const CASE_SECTION_GAP = "mt-[clamp(80px,7.5vw,100px)]";

/** Section heading ("TL;DR", "Problem Statement"), set beside a small icon. */
export const CASE_SECTION_TITLE_CLASS =
  "flex min-h-[62px] items-center gap-[8px] font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-case-ink";

/** Subsection heading with a green bar on its left edge. */
export const CASE_SUBHEADING_CLASS =
  "relative mb-[24px] pl-[13px] font-display text-[16px] font-semibold leading-[1.42] tracking-[-0.026em] text-case-ink before:absolute before:inset-y-[0.1em] before:left-0 before:w-[3px] before:rounded-full before:bg-case-green";

/** Long-form copy; stack paragraphs in a CASE_BODY_STACK container. */
export const CASE_BODY_CLASS =
  "font-body text-[16px] font-normal leading-[1.62] tracking-[-0.018em] text-case-ink";

/** Vertical rhythm between paragraphs of body copy. */
export const CASE_BODY_STACK = "grid gap-[16px]";

/** Space between subsections within a section. */
export const CASE_SUBSECTION_GAP = "grid gap-[clamp(44px,4.2vw,52px)]";
