import Image from "next/image";
import { cx } from "@/lib/cx";

// TODO: placeholder screen for the hero phone — swap for the real design.
// Sized in cqw so it scales with the PhoneMockup it sits in.

const CHIPS = [
  { label: "Simultaneous", count: 3, dot: "bg-card-apps" },
  { label: "Successive", count: 4, dot: "bg-card-work" },
  { label: "Guardian", count: 1, dot: "bg-card-talks" },
];

const NOMINEES = [
  { name: "Asha Patil", relation: "Mother", share: "50%", initials: "AP", tint: "bg-card-work" },
  { name: "Rohan Patil", relation: "Brother", share: "30%", initials: "RP", tint: "bg-card-apps" },
  { name: "Meera Patil", relation: "Spouse", share: "20%", initials: "MP", tint: "bg-card-talks" },
  { name: "Kabir Patil", relation: "Son · minor", share: "—", initials: "KP", tint: "bg-badge-fill" },
];

/**
 * FD nominee screen for the hero phone. The first chip flips to its selected
 * state once the hero marks itself data-tapped (its cursor "taps" it).
 */
export function NomineeHeroScreen() {
  return (
    <div className="phone-hero-scroll absolute inset-x-0 top-[11cqw] font-body text-case-ink">
      <div className="flex h-[12.6cqw] items-center gap-[3.4cqw] px-[4.8cqw]">
        <svg viewBox="0 0 24 24" className="h-[4.4cqw] w-[4.4cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        <span className="text-[4.4cqw] font-medium tracking-[-0.02em]">Nominees</span>
      </div>

      <div className="flex items-center gap-[1.8cqw] overflow-hidden whitespace-nowrap px-[3.7cqw] py-[2.2cqw]">
        <span className="flex h-[8.1cqw] w-[8.1cqw] shrink-0 items-center justify-center rounded-full border-[0.3cqw] border-case-ink/70">
          <svg viewBox="0 0 24 24" className="h-[3.7cqw] w-[3.7cqw]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M5 8h14M8 12h8M11 16h2" />
          </svg>
        </span>
        {CHIPS.map((chip, i) => {
          const tappable = i === 0;
          return (
            <span
              key={chip.label}
              className={cx(
                "flex h-[8.1cqw] shrink-0 items-center gap-[1.5cqw] rounded-full border-[0.2cqw] border-case-ink/10 bg-white px-[2.5cqw] text-[3cqw] font-medium transition-colors duration-200",
                tappable && "group-data-[tapped]/hero:border-case-ink/25 group-data-[tapped]/hero:bg-case-ink/[0.07]"
              )}
            >
              <span className={cx("h-[2.1cqw] w-[2.1cqw] rounded-[0.4cqw]", chip.dot)} />
              {chip.label}
              <span
                className={cx(
                  "flex h-[4.1cqw] min-w-[4.1cqw] items-center justify-center rounded-full bg-case-ink/[0.06] text-[2.4cqw] text-case-muted",
                  tappable && "group-data-[tapped]/hero:hidden"
                )}
              >
                {chip.count}
              </span>
              {tappable && (
                <svg viewBox="0 0 24 24" className="hidden h-[3cqw] w-[3cqw] group-data-[tapped]/hero:block" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
            </span>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between border-b-[0.2cqw] border-case-ink/[0.08] px-[4.8cqw] pb-[3cqw] pt-[3.7cqw]">
        <span className="text-[3.6cqw] font-medium tracking-[-0.02em]">FD · ₹5,00,000</span>
        <span className="text-[3.3cqw] text-case-muted">3 of 4</span>
      </div>

      {NOMINEES.map((n) => (
        <div key={n.name} className="mx-[3.7cqw] flex items-center gap-[2.5cqw] border-b-[0.2cqw] border-case-ink/[0.06] px-[1.1cqw] py-[3.7cqw]">
          <span className={cx("flex h-[6.7cqw] w-[6.7cqw] shrink-0 items-center justify-center rounded-full text-[2.5cqw] font-semibold", n.tint)}>
            {n.initials}
          </span>
          <span className="min-w-0 flex-1 text-[3.4cqw] tracking-[-0.02em] text-case-ink/80">{n.name}</span>
          <span className="text-right">
            <span className="flex items-center justify-end gap-[1.5cqw] text-[3.1cqw] font-medium">
              Share {n.share}
              <span className="h-[2.1cqw] w-[2.1cqw] rounded-[0.4cqw] bg-card-apps" />
            </span>
            <span className="mt-[0.7cqw] block text-[2.8cqw] text-case-muted">{n.relation}</span>
          </span>
        </div>
      ))}

      <div className="mx-[4.8cqw] mt-[3.7cqw] rounded-[2.7cqw] bg-accent-base py-[3.1cqw] text-center text-[3.1cqw] font-semibold text-white">
        Confirm nominees
      </div>
    </div>
  );
}

/**
 * The final Simultaneous summary (Figma 2056:2435, 2x) for the hero phone.
 * It covers the frame's own status bar with its navy one, and holds still:
 * the screenshot includes the status bar, so scrolling it would move that too.
 */
export function NomineeHeroImage() {
  return (
    <div className="absolute inset-x-0 top-0 z-[25]">
      <Image
        src="/case-studies/fd-nomination/hero/summary-three.png"
        alt=""
        width={750}
        height={1624}
        unoptimized
        priority
        className="block h-auto w-full"
      />
    </div>
  );
}
