"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import PhoneMockup from "./PhoneMockup";
import { CASE_COLUMN_CLASS } from "./styles";

export interface PhoneHeroMeta {
  label: string;
  value: string;
}

/** When the cursor's tap lands, matching .phone-hero-cursor in globals.css. */
const TAP_MS = 2950;

/**
 * Case-study hero, after a Framer reference: small year over a centred
 * title, then a full-bleed panel with a faint top-to-bottom wash. One large
 * phone sits in it, cropped by the panel's bottom edge. When the panel
 * scrolls into view the phone swings upright from a 3D tilt while its list
 * scrolls back to the top, then a cursor taps the first chip. Below: the
 * intro paragraph and a row of project details. Motion is CSS (see
 * .phone-hero-* in globals.css) and is skipped for reduced motion.
 */
export default function PhoneHero({
  eyebrow,
  title,
  intro,
  meta,
  screen,
  cursor = true,
  fullPhone = false,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  meta: PhoneHeroMeta[];
  /** The phone's screen. It can style a tapped state with group-data-[tapped]/hero. */
  screen: ReactNode;
  /** Show the hero's own cursor tap. Off when the screen brings its own. */
  cursor?: boolean;
  /** Fit the whole phone in the panel instead of cropping it, for a screen that plays a flow. */
  fullPhone?: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Show the end state straight away. Written to the DOM rather than
      // state so the effect doesn't trigger a second render.
      el.setAttribute("data-tapped", "");
      return;
    }
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setPlaying(true);
        timer = window.setTimeout(() => setTapped(true), TAP_MS);
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section aria-label="Case study introduction">
      <div className="flex flex-col items-center gap-[12px] px-[20px] pt-[clamp(72px,9.2vw,132px)] text-center">
        <p className="phone-hero-fade font-body text-[16px] font-normal leading-[1.4] text-case-muted">{eyebrow}</p>
        <div className="overflow-hidden">
          <h1 className="phone-hero-title max-w-[440px] font-display text-[clamp(26px,3vw,30px)] font-semibold leading-[1.2] tracking-[-0.025em] text-case-ink">
            {title}
          </h1>
        </div>
      </div>

      {/* Sized off S = min(825px, 100vw) so the panel and phone scale down
          together: panel 0.8·S tall, phone 0.6·S wide and 0.12·S from the
          top, which leaves a little over half the phone in view. With
          fullPhone all of it shows: 0.44·S wide in a 1.06·S panel, or
          0.62·S in 1.44·S on phones so the screens stay readable. */}
      <div
        ref={stageRef}
        aria-hidden="true"
        data-playing={playing || undefined}
        data-tapped={tapped || undefined}
        className={cx(
          "phone-hero-panel group/hero relative mt-[24px] w-full overflow-hidden [perspective:1600px]",
          fullPhone ? "h-[calc(min(825px,100vw)*1.44)] md:h-[calc(min(825px,100vw)*1.06)]" : "h-[calc(min(825px,100vw)*0.8)]"
        )}
      >
        <div
          className={cx(
            "absolute left-1/2 -translate-x-1/2",
            fullPhone
              ? "top-[calc(min(825px,100vw)*0.08)] w-[calc(min(825px,100vw)*0.62)] md:w-[calc(min(825px,100vw)*0.44)]"
              : "top-[calc(min(825px,100vw)*0.12)] w-[calc(min(825px,100vw)*0.6)]"
          )}
        >
          <div className="phone-hero-phone">
            <PhoneMockup>
              {screen}
              {cursor && (
                <svg viewBox="0 0 24 24" className="phone-hero-cursor absolute left-[29cqw] top-[29cqw] z-40 h-[5.6cqw] w-[5.6cqw] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                  <path d="M5 3l14 8.2-6.1 1.3 3.6 6.7-2.6 1.4-3.6-6.8L5 18.5z" className="fill-white stroke-case-ink" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              )}
            </PhoneMockup>
          </div>
        </div>
      </div>

      <div className={cx(CASE_COLUMN_CLASS, "pt-[clamp(60px,7.7vw,112px)]")}>
        <p className="font-body text-[16px] font-normal leading-[1.62] tracking-[-0.018em] text-case-ink">{intro}</p>
        <dl aria-label="Project details" className="mt-[36px] grid grid-cols-3 gap-x-[28px]">
          {meta.map((item) => (
            <div key={item.label} className="grid min-w-0 content-start gap-[8px]">
              <dt className="font-body text-[14px] font-normal leading-[1.5] text-case-muted">{item.label}</dt>
              <dd className="font-body text-[14px] font-medium leading-[1.5] text-case-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
