import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * An iPhone-style frame drawn in CSS: glossy black bezel, Dynamic Island,
 * status bar and side buttons. Every measurement is in container-query units
 * (cqw), so the device, and the screen inside it, scales with the width the
 * parent gives it. Screens should size their own type in cqw too.
 */
export default function PhoneMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("@container relative aspect-[71.6/146.6]", className)}>
      <span aria-hidden="true" className="absolute left-[-0.7cqw] top-[17%] h-[4.5%] w-[1.4cqw] rounded-l-[1cqw] bg-neutral-800" />
      <span aria-hidden="true" className="absolute left-[-0.7cqw] top-[25%] h-[8.5%] w-[1.4cqw] rounded-l-[1cqw] bg-neutral-800" />
      <span aria-hidden="true" className="absolute left-[-0.7cqw] top-[35.5%] h-[8.5%] w-[1.4cqw] rounded-l-[1cqw] bg-neutral-800" />
      <span aria-hidden="true" className="absolute right-[-0.7cqw] top-[28%] h-[12.5%] w-[1.4cqw] rounded-r-[1cqw] bg-neutral-800" />

      <div className="relative h-full w-full rounded-[16cqw] bg-gradient-to-b from-neutral-600 via-neutral-900 to-neutral-800 p-[0.7cqw] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
        <div className="h-full w-full rounded-[15.2cqw] bg-black p-[2.6cqw]">
          <div className="relative h-full w-full overflow-hidden rounded-[12.6cqw] bg-white">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 z-20 flex h-[11cqw] items-center justify-between bg-white px-[8.5cqw] pt-[0.6cqw] font-body text-[3.9cqw] font-semibold tracking-[-0.02em] text-case-ink"
            >
              <span>9:41</span>
              <span className="flex items-center gap-[1.3cqw]">
                <svg viewBox="0 0 18 12" className="h-[2.7cqw] w-auto" fill="currentColor">
                  <rect x="0" y="8" width="3" height="4" rx="1" />
                  <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                  <rect x="10" y="3" width="3" height="9" rx="1" />
                  <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                <svg viewBox="0 0 16 12" className="h-[2.7cqw] w-auto" fill="currentColor">
                  <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.4A10.6 10.6 0 0 0 8 .3 10.6 10.6 0 0 0 .7 3.2L2 4.6a8.7 8.7 0 0 1 6-2.4Zm0 3.9c1.3 0 2.5.5 3.4 1.3l1.3-1.4A6.8 6.8 0 0 0 8 4.2 6.8 6.8 0 0 0 3.3 6l1.3 1.4C5.5 6.6 6.7 6.1 8 6.1Zm0 3.8-2 2.1h4l-2-2.1Z" />
                </svg>
                <svg viewBox="0 0 26 12" className="h-[2.8cqw] w-auto" fill="none" stroke="currentColor">
                  <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" opacity="0.4" />
                  <rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" stroke="none" />
                  <path d="M24.5 4v4" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
            </div>
            <div aria-hidden="true" className="absolute left-1/2 top-[2.2cqw] z-30 h-[8.2cqw] w-[29cqw] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[2.6cqw] top-1/2 h-[3cqw] w-[3cqw] -translate-y-1/2 rounded-full bg-neutral-800 ring-[0.6cqw] ring-neutral-900" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
