"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";

export interface HeroSlide {
  src: string;
  alt: string;
  caption: string;
}

const SLIDE_MS = 5200;

/**
 * The case-study hero: screens on the green case stage, advancing every few
 * seconds, with pill indicators and a caption underneath. Pauses on hover
 * and focus, and doesn't auto-advance for reduced motion.
 */
export default function HeroCarousel({ slides, label }: { slides: HeroSlide[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Clamp, since the slide list can shrink under a stale index (hot reload,
  // or a parent passing fewer slides).
  const active = index < slides.length ? index : 0;
  const autoplay = slides.length > 1 && !paused && !reduceMotion;

  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => setIndex((active + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, active, slides.length]);

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="grid gap-[14px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="case-stage rounded-[20px] p-[clamp(26px,6.5vw,66px)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[clamp(11px,1.2vw,16px)]">
          {slides.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              unoptimized
              priority={i === 0}
              aria-hidden={i !== active}
              className={cx(
                "object-cover transition-opacity duration-500 ease-out motion-reduce:transition-none",
                i === active ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="grid justify-items-center gap-[9px]">
          <div className="flex items-center gap-[6px]">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show ${slide.caption}`}
                aria-pressed={i === active}
                onClick={() => setIndex(i)}
                className={cx(
                  "relative h-[6px] overflow-hidden rounded-full transition-[width,background-color] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  i === active ? "w-[40px] bg-case-ink/20" : "w-[6px] bg-case-ink/50 hover:bg-case-ink/70"
                )}
              >
                {i === active && autoplay && (
                  <span
                    key={active}
                    aria-hidden="true"
                    className="case-carousel-progress absolute inset-0 origin-left rounded-full bg-case-ink"
                    style={{ animationDuration: `${SLIDE_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="font-body text-[14px] font-medium leading-[1.2] tracking-[-0.01em] text-case-muted">
            {slides[active].caption}
          </p>
        </div>
      )}
    </div>
  );
}
