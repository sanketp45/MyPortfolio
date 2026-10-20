import ScreenRow, { type CaseScreen } from "./ScreenRow";

/** The full screens behind a pill toggle, for sections that lead with just the changed parts. */
export default function FullScreens({ screens, label }: { screens: CaseScreen[]; label: string }) {
  return (
    <details className="group">
      <summary className="inline-flex cursor-pointer list-none items-center gap-[8px] rounded-full border border-case-ink/15 bg-bg-surface px-[16px] py-[10px] font-body text-[14px] font-medium leading-[1.4] text-case-ink transition-colors hover:border-case-ink/30 hover:bg-case-ink/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-case-green [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </svg>
        <span className="group-open:hidden">See full screens ({screens.length})</span>
        <span className="hidden group-open:inline">Hide full screens</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform group-open:rotate-180">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="mt-[16px]">
        <ScreenRow screens={screens} label={label} />
      </div>
    </details>
  );
}
