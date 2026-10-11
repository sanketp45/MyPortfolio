import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// The one heading treatment every section uses, so weight, size, colour,
// and the spacing to the subtext can't drift apart between sections.

/** Inner padding for every section panel. */
export const SECTION_PAD = "p-[clamp(28px,4vw,56px)]";

/** Gap between a section's heading block and its content. */
export const SECTION_CONTENT_GAP = "mt-[40px]";

export const SECTION_TITLE_CLASS = "font-display font-bold text-accent-base";
export const SECTION_TITLE_STYLE = {
  fontSize: "clamp(34px, 4.5vw, 56px)",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
} as const;

export const SECTION_SUBTITLE_CLASS =
  "mt-[12px] max-w-[36em] font-body text-[18px] font-normal leading-[1.5] text-text-primary md:text-[19px]";

export const SECTION_EYEBROW_CLASS =
  "mb-[12px] font-mono text-caption uppercase tracking-[0.08em] text-text-primary";

export function SectionHeading({
  id,
  as: Tag = "h2",
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: {
  id?: string;
  as?: "h1" | "h2";
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional control shown beside the heading from 700px up (below it on phones). */
  action?: ReactNode;
  className?: string;
}) {
  const block = (
    <div>
      {eyebrow && <p className={SECTION_EYEBROW_CLASS}>{eyebrow}</p>}
      <Tag id={id} className={SECTION_TITLE_CLASS} style={SECTION_TITLE_STYLE}>
        {title}
      </Tag>
      {subtitle && <p className={SECTION_SUBTITLE_CLASS}>{subtitle}</p>}
    </div>
  );

  if (!action) return <div className={className}>{block}</div>;

  return (
    <div
      className={cx(
        "flex flex-col items-start gap-[20px] min-[700px]:flex-row min-[700px]:items-end min-[700px]:justify-between",
        className
      )}
    >
      {block}
      <div className="shrink-0">{action}</div>
    </div>
  );
}
