import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { BackIcon } from "./icons";
import { CASE_COLUMN_CLASS } from "./styles";

export interface CaseMetaItem {
  /** Shown above the value, beside the icon. */
  label: string;
  icon: ReactNode;
  value: string;
}

/**
 * Case-study header: breadcrumb, project mark, title and subtitle, a grid of
 * labelled meta items (icon + label over value), then a hairline before the
 * hero.
 */
export default function CaseHeader({
  mark,
  title,
  subtitle,
  meta,
}: {
  mark: ReactNode;
  title: string;
  subtitle: string;
  meta: CaseMetaItem[];
}) {
  return (
    <header className={CASE_COLUMN_CLASS}>
      <Link
        href="/"
        className="inline-flex items-center gap-[6px] font-body text-[14px] font-medium leading-[1.2] text-case-muted transition-colors hover:text-case-ink"
      >
        <BackIcon width={15} height={15} />
        Home
      </Link>

      <div className="mt-[clamp(34px,5vw,52px)] text-case-ink" aria-hidden="true">
        {mark}
      </div>

      <div className="mt-[28px] max-md:mt-[24px]">
        <h1 className="font-display text-[24px] font-semibold leading-[1.3] tracking-[-0.025em] text-case-ink">
          {title}
        </h1>
        <p className="mt-[6px] font-body text-[18px] font-normal leading-[1.45] tracking-[-0.02em] text-case-muted">
          {subtitle}
        </p>
      </div>

      <dl
        aria-label="Project details"
        className="mt-[24px] grid grid-cols-2 gap-x-[24px] gap-y-[20px] md:mt-[28px] md:grid-cols-3 md:gap-x-[32px]"
      >
        {meta.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="flex items-center gap-[6px] font-body text-[14px] font-medium leading-[1.35] text-case-muted">
              <span className="flex shrink-0">{item.icon}</span>
              {item.label}
            </dt>
            <dd className="mt-[6px] font-body text-[16px] font-medium leading-[1.45] tracking-[-0.01em] text-case-ink">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div aria-hidden="true" className={cx("mt-[clamp(40px,6vw,64px)] h-px bg-case-ink/[0.12]")} />
    </header>
  );
}
