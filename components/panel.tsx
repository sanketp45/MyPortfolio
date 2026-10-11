import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * The inset panel pattern shared by every homepage section: same horizontal
 * inset and radius as the hero. Background, vertical margin, dot grid, and
 * inner padding are left to the caller since those vary per section (e.g.
 * the hero is bg/white with a dot grid; about is bg/surface, calmer,
 * without one).
 */
export function Panel({
  children,
  className,
  dotGrid = false,
}: {
  children: ReactNode;
  className?: string;
  dotGrid?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative isolate mx-3 overflow-hidden rounded-[20px]",
        "md:mx-[clamp(16px,4vw,104px)] md:rounded-[28px]",
        className
      )}
    >
      {dotGrid && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--color-line-subtle)_1px,transparent_1px)] bg-[length:24px_24px]"
        />
      )}
      {children}
    </div>
  );
}
