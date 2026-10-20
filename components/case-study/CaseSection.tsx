import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { CASE_COLUMN_CLASS, CASE_SECTION_GAP, CASE_SECTION_TITLE_CLASS, CASE_SUBSECTION_GAP } from "./styles";

/**
 * A case-study section: icon + title heading, then its subsections. With no
 * title it runs on from the section before, named by `label` for assistive
 * tech instead.
 */
export default function CaseSection({
  id,
  icon,
  title,
  label,
  children,
}: {
  id: string;
  icon?: ReactNode;
  title?: string | null;
  label?: string;
  children: ReactNode;
}) {
  if (!title) {
    return (
      <section id={id} aria-label={label} className={cx(CASE_COLUMN_CLASS, CASE_SECTION_GAP)}>
        <div className={CASE_SUBSECTION_GAP}>{children}</div>
      </section>
    );
  }
  return (
    <section aria-labelledby={id} className={cx(CASE_COLUMN_CLASS, CASE_SECTION_GAP)}>
      <h2 id={id} className={cx(CASE_SECTION_TITLE_CLASS, "mb-[28px]")}>
        <span className="flex shrink-0">{icon}</span>
        {title}
      </h2>
      <div className={CASE_SUBSECTION_GAP}>{children}</div>
    </section>
  );
}
