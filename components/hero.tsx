"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/components/cta-styles";

// ---------------------------------------------------------------------------
// Content — edit copy here. Everything below this block is presentation only.
// ---------------------------------------------------------------------------

interface DeckThumb {
  src: string;
  alt: string;
  rotate: number; // deg
  x: number; // px from the card's centre line
  y: number; // px, negative lifts it
}

interface DeckCard {
  id: string;
  kind: "content" | "media";
  fillClass?: string; // Tailwind bg-* class, token-backed
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ariaLabel?: string; // used when there's no heading text (media card)
  mediaSrc?: string; // if unset, a placeholder fill renders instead
  href: string;
  rotate: number; // deg, resting fan angle
  thumbs?: DeckThumb[];
}

const DECK_CARDS: DeckCard[] = [
  {
    id: "work",
    kind: "content",
    fillClass: "bg-card-work",
    heading: "Recent work",
    body: "Investment journeys for India's largest NBFC: FDs, mutual funds, stocks, IPOs.",
    ctaLabel: "Read case studies",
    href: "/#work-timeline-heading",
    rotate: -5,
    thumbs: [
      { src: "/images/work-investment-mall.png", alt: "", rotate: -16, x: -68, y: 4 },
      { src: "/images/work-onboarding.png", alt: "", rotate: 2, x: 2, y: -14 },
      { src: "/images/work-ipo.png", alt: "", rotate: 16, x: 68, y: 4 },
    ],
  },
  {
    id: "about",
    kind: "content",
    fillClass: "bg-badge-fill",
    heading: "About me",
    body: "Computer engineer turned designer. Here's the longer story.",
    ctaLabel: "More about me",
    href: "/about",
    rotate: 2,
    thumbs: [
      { src: "/photos/myimage.jpg", alt: "", rotate: -10, x: -40, y: 0 },
      { src: "/photos/away-beyond-tools.jpg", alt: "", rotate: 10, x: 40, y: -8 },
    ],
  },
  {
    id: "ai-work",
    kind: "content",
    fillClass: "bg-card-apps",
    heading: "AI work",
    body: "Plugins, extensions, and apps I vibe code to fix my own problems.",
    ctaLabel: "See what I've built",
    href: "/play",
    rotate: -2,
    thumbs: [
      { src: "/images/vibe-charcount.png", alt: "", rotate: -16, x: -68, y: 4 },
      { src: "/images/vibe-figma-qa.png", alt: "", rotate: 2, x: 2, y: -14 },
      { src: "/images/vibe-reminder-wide.png", alt: "", rotate: 16, x: 68, y: 4 },
    ],
  },
  {
    id: "articles",
    kind: "content",
    fillClass: "bg-card-talks",
    heading: "Articles",
    body: "I write about AI-assisted design, from Figma MCP to Claude Code.",
    ctaLabel: "Read my articles",
    href: "/#writing-heading",
    rotate: 4,
    thumbs: [
      { src: "/images/article-canvas-codebase.png", alt: "", rotate: -16, x: -68, y: 4 },
      { src: "/images/article-figma-storybook.png", alt: "", rotate: 2, x: 2, y: -14 },
      { src: "/images/article-eye-strain.jpg", alt: "", rotate: 16, x: 68, y: 4 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Small shared bits
// ---------------------------------------------------------------------------

/** Placeholder mark used wherever a real logo/photo isn't supplied yet. */
function PlaceholderMark({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-base font-body font-medium text-text-inverse",
        className
      )}
    >
      {label}
    </span>
  );
}

function Chip({
  variant,
  label,
  showLogo,
}: {
  variant: "light" | "dark";
  label: string;
  showLogo?: boolean;
}) {
  return (
    <span
      className={cx(
        "-mt-0.5 inline-flex items-center gap-1.5 rounded-pill px-3 py-1 align-middle text-small font-body font-medium",
        variant === "light"
          ? "border border-line-subtle bg-bg-surface text-text-primary"
          : "bg-text-primary text-text-inverse"
      )}
    >
      {showLogo && <PlaceholderMark label={label[0]} className="h-[20px] w-[20px] text-[10px]" />}
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Card deck
// ---------------------------------------------------------------------------

const CARD_ROTATE_VAR = (rotate: number): CSSProperties =>
  ({ "--card-rotate": `${rotate}deg` }) as CSSProperties;

// Rotation + overlap live on the WRAPPER around each card, not the card
// itself — matching the reference: a plain rotate around center (not the
// card's own bottom edge) with the card centered inside a slightly larger
// box. The wrapper's transform is also what the entrance animation drives,
// so the hover spread happens on a separate layer inside it (DeckLayer).
const WRAPPER_REST =
  "[transform:rotate(var(--card-rotate))] transition-transform duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

// The real <a> covers the whole card via a stretched pseudo-element, but the
// focus ring is drawn on the card itself (via :has()) so it wraps the whole
// tile, not just the small heading link.
const CARD_FOCUS_RING =
  "outline-none has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-2 " +
  "has-[a:focus-visible]:outline-accent-base has-[a:focus-visible]:outline-offset-[3px]";

// ---------------------------------------------------------------------------
// Hover choreography (after benshih.design): the hovered card scales up and
// keeps only 20% of its tilt, while every other card slides away from it —
// further the further away it is — shrinks a little and dims. The whole
// spread is then shifted so it stays centred in the panel.
// ---------------------------------------------------------------------------

const SPREAD_BASE_PX = 140;
const SPREAD_STEP_PX = 28;

interface DeckLayout {
  x: number;
  scale: number;
  rotateDelta: number;
  opacity: number;
}

function computeDeckLayout(active: number | null, roomPx: number): DeckLayout[] {
  if (active === null) {
    return DECK_CARDS.map(() => ({ x: 0, scale: 1, rotateDelta: 0, opacity: 1 }));
  }
  const xs = DECK_CARDS.map((_, i) => {
    const distance = i - active;
    if (distance === 0) return 0;
    return Math.sign(distance) * (SPREAD_BASE_PX + SPREAD_STEP_PX * Math.abs(distance));
  });
  const recentre = -(xs[0] + xs[xs.length - 1]) / 2;
  // On narrower panels there isn't room for the full spread, so it's
  // scaled down until the outer cards stay inside the panel.
  const furthest = Math.max(...xs.map((x) => Math.abs(x + recentre)));
  const fit = furthest > roomPx ? Math.max(roomPx, 0) / furthest : 1;
  return DECK_CARDS.map((card, i) =>
    i === active
      ? { x: recentre * fit, scale: 1.04, rotateDelta: -0.8 * card.rotate, opacity: 1 }
      : { x: (xs[i] + recentre) * fit, scale: 0.93, rotateDelta: 0, opacity: 0.5 }
  );
}

// Twelve confetti squares bursting outward, as on the reference. Mounted
// only while a card is active, so the one-shot animation replays on each
// hover. Hidden under reduced motion (see .deck-confetti).
const CONFETTI_COLORS = ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f97316"];

function ConfettiBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 28 + (i % 3) * 14;
        return (
          <span
            key={i}
            className="deck-confetti absolute -mt-[5px] -ml-[5px] h-2.5 w-2.5 rounded-[2px]"
            style={
              {
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${i * 30}ms`,
                "--confetti-x": `${Math.cos(angle) * radius}px`,
                "--confetti-y": `${Math.sin(angle) * radius - 24}px`,
                "--confetti-r": `${i * 35}deg`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

// Fanned out from the card's centre line and overlapping its top edge, as
// on the reference: each image springs up from 55% scale, 60ms apart.
const THUMB_W = 112;
const THUMB_H = 74;

function ThumbFan({ thumbs, active }: { thumbs: DeckThumb[]; active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 z-20 h-[110px] w-[280px] -translate-x-1/2"
      style={{ bottom: "calc(100% - 18px)" }}
    >
      {active && <ConfettiBurst />}
      {thumbs.map((thumb, index) => (
        <Image
          key={index}
          src={thumb.src}
          alt=""
          width={THUMB_W * 2}
          height={THUMB_H * 2}
          sizes="112px"
          style={{
            width: THUMB_W,
            height: THUMB_H,
            left: `calc(50% + ${thumb.x - THUMB_W / 2}px)`,
            top: `calc(50% + ${thumb.y - THUMB_H / 2}px)`,
            opacity: active ? 1 : 0,
            transform: active
              ? `translateY(0) scale(1) rotate(${thumb.rotate}deg)`
              : `translateY(22px) scale(0.55) rotate(${thumb.rotate}deg)`,
            // Staggered on the way in only; they all leave together.
            transitionDelay: active ? `${index * 60}ms` : "0ms",
          }}
          className="deck-pop-spring absolute rounded-[6px] bg-bg-surface object-cover shadow-[0_6px_18px_rgba(0,0,0,0.22)] ring-2 ring-white/90"
        />
      ))}
    </div>
  );
}

function DeckCardItem({
  card,
  layout,
  active,
  onActivate,
  wrapperRef,
}: {
  card: DeckCard;
  layout: DeckLayout;
  active: boolean;
  onActivate: () => void;
  wrapperRef?: (el: HTMLDivElement | null) => void;
}) {
  const isMedia = card.kind === "media";

  // rotate(-r) translateX rotate(r) cancels the wrapper's resting tilt
  // around the slide, so cards move straight sideways instead of along
  // their own tilted axis. Same function list in every state, so the
  // browser interpolates each part on its own.
  const layerTransform =
    `rotate(${-card.rotate}deg) translateX(${layout.x}px) rotate(${card.rotate}deg) ` +
    `scale(${layout.scale}) rotate(${layout.rotateDelta}deg)`;

  return (
    <div
      ref={wrapperRef}
      style={{ ...CARD_ROTATE_VAR(card.rotate), zIndex: active ? 20 : undefined }}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={cx(
        "relative flex h-[310px] w-[280px] shrink-0 items-center justify-center snap-start",
        "first:ml-0 -ml-[34px]",
        WRAPPER_REST
      )}
    >
      <div
        style={{ transform: layerTransform, opacity: layout.opacity }}
        className="deck-spring flex h-full w-full items-center justify-center"
      >
      <article
        style={{
          transform: active ? "translateY(-6px)" : "translateY(0)",
          boxShadow: active ? "0px 20px 40px rgba(2,89,78,0.15)" : "0px 4px 16px rgba(16,24,40,0.08)",
        }}
        className={cx(
          "deck-card-spring group relative h-[294px] w-[264px] min-h-0 min-w-0 overflow-visible rounded-[20px]",
          card.fillClass ?? "bg-bg-surface",
          isMedia ? undefined : "p-5",
          CARD_FOCUS_RING
        )}
      >
      {/* Pop-out images: shown above the card on hover, overlapping its top edge */}
      {card.thumbs && card.thumbs.length > 0 && <ThumbFan thumbs={card.thumbs} active={active} />}

      {isMedia ? (
        <>
          {/* Media needs its own clipped wrapper — the card itself stays
              overflow-visible so its thumbnail fan (if any) isn't clipped. */}
          <div className="relative z-10 h-full w-full overflow-hidden rounded-[20px]">
            {card.mediaSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- placeholder asset path, swap for next/image once a real file exists
              <img src={card.mediaSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-line-subtle">
                <span className="font-mono text-caption font-medium tracking-wide text-text-muted">
                  MEDIA PLACEHOLDER
                </span>
              </div>
            )}
          </div>
          <Link
            href={card.href}
            aria-label={card.ariaLabel}
            className="after:absolute after:inset-0 after:content-['']"
          />
        </>
      ) : (
        <div className="relative z-10 flex h-full flex-col overflow-hidden">
          <h2 className="text-[24px] font-display font-bold leading-tight text-text-primary">
            <Link href={card.href} className="after:absolute after:inset-0 after:content-['']">
              {card.heading}
            </Link>
          </h2>
          <p className="mt-2 text-[20px] leading-[1.5] text-text-primary">{card.body}</p>
          <span
            aria-hidden="true"
            className={cx(
              // pointer-events-none: the pill is rotated, which paints it above
              // the heading link's stretched ::after, so without this a click
              // on the pill hits this span instead of the link.
              "pointer-events-none mt-auto inline-flex h-[40px] items-center self-start whitespace-nowrap rounded-pill",
              "bg-cta-base px-4 font-body text-body text-cta-text",
              "[transform:rotate(-2deg)] [transform-origin:left_center]",
              "transition-[background-color,transform,box-shadow] duration-200 ease-out",
              "group-hover:bg-cta-hover group-hover:shadow-[0px_8px_20px_rgba(0,0,0,0.18)]",
              "group-hover:[transform:rotate(0deg)_translateY(-2px)]",
              "group-focus-within:bg-cta-hover group-focus-within:[transform:rotate(0deg)_translateY(-2px)]",
              "motion-reduce:transition-[background-color,box-shadow] motion-reduce:group-hover:[transform:rotate(-2deg)]"
            )}
          >
            {card.ctaLabel}
            <span
              className={cx(
                "inline-block w-0 overflow-hidden opacity-0",
                "transition-[width,margin,opacity] duration-200 ease-out motion-reduce:transition-none",
                "group-hover:ml-[6px] group-hover:w-[14px] group-hover:opacity-100",
                "group-focus-within:ml-[6px] group-focus-within:w-[14px] group-focus-within:opacity-100"
              )}
            >
              →
            </span>
          </span>
        </div>
      )}
      </article>
      </div>
    </div>
  );
}

// Panel padding lives in one place so the deck's own left/right padding can
// match it exactly (see CardDeck below).
const PANEL_PAD_X = "px-6 md:px-10";

// ---------------------------------------------------------------------------
// Entrance animation
//
// Phase 0 (instant, pre-paint): cards stacked off-screen below, centered.
// Phase 1 (staggered rise): cards rise to the centered stack, unrotated.
// Hold: pause.
// Phase 2 (simultaneous fan-out): cards move to their resting offsets/angles.
//
// All of it is skipped — resting CSS state shown immediately — when: it
// already played this session, the user prefers reduced motion, fonts
// aren't ready yet, or the deck isn't in view. See the useLayoutEffect
// below for exactly how each gate is enforced.
// ---------------------------------------------------------------------------

const HERO_DECK_SESSION_KEY = "heroDeckPlayed";

// phase1 + phase2 is specced at 1.0-1.1s; the 450ms hold is a deliberate
// pause between them and isn't counted against that budget. If tuning ever
// pushes phase1+phase2 past the ceiling, phase 1 is what shrinks — never
// the hold, and never phase 2 (its overshoot curve is load-bearing for how
// the fan-out reads).
const PHASE_2_MS = 500;
const HOLD_MS = 450;
const STAGGER_MS = 45;
const MOTION_BUDGET_MS = 1100;
const PHASE_1_MS = Math.min(520, MOTION_BUDGET_MS - PHASE_2_MS);
const PHASE_0_DROP_PX = 235;
const PHASE_0_SCALE = 0.95;
const PHASE_1_EASE = "cubic-bezier(0.22,1,0.36,1)";
const PHASE_2_EASE = "cubic-bezier(0.34,1.3,0.5,1)";

const cardTransform = (x: number, y: number, scale: number, rotateDeg: number) =>
  `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotateDeg}deg)`;

/** deckWidth/2 - cardWidth/2 - cardOffsetLeft, per card, measured fresh. */
function computeCenterOffsets(scrollEl: HTMLDivElement, cards: HTMLDivElement[]) {
  const scrollRect = scrollEl.getBoundingClientRect();
  const deckWidth = scrollEl.scrollWidth;
  return cards.map((el) => {
    const cardOffsetLeft = el.getBoundingClientRect().left - scrollRect.left + scrollEl.scrollLeft;
    return deckWidth / 2 - el.offsetWidth / 2 - cardOffsetLeft;
  });
}

export function CardDeck() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [roomPx, setRoomPx] = useState(Infinity);
  const layout = useMemo(() => computeDeckLayout(activeIndex, roomPx), [activeIndex, roomPx]);

  // Space between the deck's outer cards and the panel edge, measured at
  // hover time (offsetLeft ignores transforms, so it's the resting layout).
  // The cards shrink to 0.93 when pushed aside, which buys a little more.
  const activate = (i: number) => {
    const scrollEl = scrollRef.current;
    const first = cardRefs.current[0];
    const last = cardRefs.current[cardRefs.current.length - 1];
    if (scrollEl && first && last) {
      const left = first.offsetLeft - scrollEl.scrollLeft;
      const right = scrollEl.clientWidth - (last.offsetLeft + last.offsetWidth - scrollEl.scrollLeft);
      setRoomPx(Math.min(left, right) - 8 + first.offsetWidth * 0.035);
    }
    setActiveIndex(i);
  };
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const cards = cardRefs.current;
    if (!scrollEl || cards.some((c) => !c)) return;
    const cardEls = cards as HTMLDivElement[];

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let alreadyPlayed = true;
    try {
      alreadyPlayed = sessionStorage.getItem(HERO_DECK_SESSION_KEY) === "1";
    } catch {
      alreadyPlayed = true; // storage unavailable — fail toward no animation, not a replay
    }

    // Reduced motion or a repeat mount (including client-side nav back to
    // "/"): leave the resting CSS transform as-is, untouched, unanimated.
    if (reducedMotion || alreadyPlayed) return;

    try {
      sessionStorage.setItem(HERO_DECK_SESSION_KEY, "1");
    } catch {
      // Can't persist the flag — worst case it plays again next mount.
    }

    // Phase 0, applied synchronously before this component's first paint.
    const initialOffsets = computeCenterOffsets(scrollEl, cardEls);
    cardEls.forEach((el, i) => {
      el.style.transition = "none";
      el.style.transform = cardTransform(initialOffsets[i], PHASE_0_DROP_PX, PHASE_0_SCALE, 0);
    });

    let cancelled = false;
    // React (StrictMode, dev only) mounts, cleans up, and mounts again —
    // without this, the throwaway first mount's sessionStorage write would
    // make the real, surviving mount see "already played" and bail before
    // ever starting, leaving the cards stuck in phase 0. Only flip this
    // once the animation has actually committed to running; the cleanup
    // below undoes the sessionStorage mark and the phase-0 styles if it
    // never got there.
    let committedToPlay = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runPhases = () => {
      if (cancelled) return;
      committedToPlay = true;

      // Fonts may have swapped since phase 0 was applied — re-measure now
      // so phase 1's target isn't based on stale pre-swap layout, and snap
      // (no transition) to the corrected position first. This snap is
      // invisible: the cards are still off-screen at this point.
      const offsets = computeCenterOffsets(scrollEl, cardEls);
      cardEls.forEach((el, i) => {
        el.style.transition = "none";
        el.style.transform = cardTransform(offsets[i], PHASE_0_DROP_PX, PHASE_0_SCALE, 0);
      });

      scrollEl.style.overflowX = "hidden";

      cardEls.forEach((el, i) => {
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            el.style.transition = `transform ${PHASE_1_MS}ms ${PHASE_1_EASE}`;
            el.style.transform = cardTransform(offsets[i], 0, 1, 0);
          }, i * STAGGER_MS)
        );
      });

      const lastCardLandsAt = (cardEls.length - 1) * STAGGER_MS + PHASE_1_MS;

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          cardEls.forEach((el, i) => {
            el.style.transition = `transform ${PHASE_2_MS}ms ${PHASE_2_EASE}`;
            el.style.transform = cardTransform(0, 0, 1, DECK_CARDS[i].rotate);
          });
        }, lastCardLandsAt + HOLD_MS)
      );

      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          // Clear inline styles so the class-based resting transform (and
          // its own hover/focus-within transition) takes back over — left
          // in place, these would fight the real CSS transitions on hover.
          cardEls.forEach((el) => {
            el.style.transition = "";
            el.style.transform = "";
          });
          scrollEl.style.overflowX = "";
        }, lastCardLandsAt + HOLD_MS + PHASE_2_MS + 20)
      );
    };

    let fontsReady = false;
    let inView = false;
    const maybeStart = () => {
      if (fontsReady && inView) runPhases();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          inView = true;
          observer.disconnect();
          maybeStart();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(scrollEl);

    document.fonts.ready.then(() => {
      if (cancelled) return;
      fontsReady = true;
      maybeStart();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      timers.forEach(clearTimeout);
      if (!committedToPlay) {
        try {
          sessionStorage.removeItem(HERO_DECK_SESSION_KEY);
        } catch {
          /* ignore */
        }
        cardEls.forEach((el) => {
          el.style.transition = "";
          el.style.transform = "";
        });
      }
    };
  }, []);

  return (
    // Escapes the panel's own padding to run edge-to-edge, then re-applies
    // the same padding internally — first/last card gets breathing room
    // from the panel's clip edge without shrinking the scrollable track.
    <div className={cx("-mx-6 md:-mx-10")}>
      <div
        ref={scrollRef}
        // Cleared on leaving the whole deck rather than each card, so the
        // gaps that open up between spread cards don't snap everything back.
        onMouseLeave={() => setActiveIndex(null)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActiveIndex(null);
        }}
        className={cx(
          // relative: makes this the cards' offsetParent, which the hover
          // spread measurement in activate() relies on.
          "relative flex justify-center overflow-x-auto",
          "snap-x snap-proximity",
          // overflow-x:auto forces overflow-y to auto too; padding-top here
          // (not overflow:visible) reserves room for the hover lift (12px)
          // plus the thumbnail fan (translateY(-16px) + ~72px thumb height)
          // so that reserved space, not scroll clipping, is what the fan
          // moves into, plus ~30px of clearance so the raised thumbnails don't
          // touch the intro text above
          // to keep the gap above the deck tight. pb-10 gives cards full
          // breathing room at the bottom — no bleed/clip against the panel
          // edge (see benshih.design).
          "pt-[132px] pb-10",
          PANEL_PAD_X,
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {DECK_CARDS.map((card, i) => (
          <DeckCardItem
            key={card.id}
            card={card}
            layout={layout[i]}
            active={activeIndex === i}
            onActivate={() => activate(i)}
            wrapperRef={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export default function Hero() {
  return (
    <section className="bg-bg-canvas">
      <Panel className="mt-5 bg-white" dotGrid>
        <div className={cx("relative pt-16 pb-0 md:pt-24", PANEL_PAD_X)}>
          {/* Floating badge */}
          <div className="absolute right-6 top-8 hidden min-[1024px]:block" aria-hidden="false">
            <div className="relative">
              <div className="rounded-pill border border-badge-border bg-badge-fill px-4 py-2 text-[18px] font-body text-text-primary">
                Design @ Bajaj Finserv
              </div>
              {/* Pointer triangle, below the pill's left edge */}
              <span className="absolute left-4 top-full h-0 w-0 border-x-[6px] border-t-[7px] border-x-transparent border-t-badge-fill" />
            </div>
          </div>

          <p className="mb-[14px] font-body text-[18px] font-medium text-text-primary md:text-h3">
            Hi, I&apos;m Sanket, a Product Designer.
          </p>

          {/* Headline */}
          {/* The longer line measures ~13.4x the font size, and the panel's
              inner width is roughly 100vw - 250px, so dividing by 15
              keeps it inside the panel at every desktop width. Below
              1024px the lines are allowed to wrap instead, so phones get a
              readable 38px+ headline rather than one shrunk to fit. */}
          <h1
            className="max-w-3xl font-display font-bold text-accent-base"
            style={{
              fontSize: "clamp(38px, calc((100vw - 250px) / 15), 88px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {/* One flowing sentence on phones; two set lines from 1024px. */}
            <span className="min-[1024px]:block min-[1024px]:whitespace-nowrap">I design the screens </span>
            <span className="min-[1024px]:block min-[1024px]:whitespace-nowrap">where people move their money.</span>
          </h1>

          {/* Sub headline */}
          <p className="mt-[20px] max-w-[46em] font-body text-[18px] font-normal leading-[1.6] text-text-primary md:mt-6 md:text-h3 md:leading-[1.6]">
            I design fintech experiences at <Chip variant="dark" label="Bajaj Finserv" />, across fixed deposits, mutual funds, stocks, and IPOs.
            I use Figma MCP with Claude to design faster, creating components, tokens, and screens directly in Figma through prompts.
            Beyond the desk, I&apos;m cheering for my team or lost in a book.
          </p>

          {/* Card deck — sits fully within the panel, no forced bottom
              clip. An earlier version deliberately bled the deck past the
              panel edge; checking the reference (benshih.design) showed
              its cards are simply laid out with room to spare, not cut
              off, so that trick was removed. No separate top margin here —
              the scroll container's own pt- (below) is what actually
              creates the gap above the cards. */}
          {/* Phones: the fanned card deck doesn't fit, so (as on
              benshih.design) it's swapped for two stacked buttons. */}
          <div className="flex flex-col gap-[12px] pt-[28px] pb-[32px] md:hidden">
            <Link
              href="/#work-timeline-heading"
              className={cx(
                BUTTON_PRIMARY
              )}
            >
              See my work
            </Link>
            <Link
              href="/about"
              className={cx(
                BUTTON_SECONDARY
              )}
            >
              More about me
            </Link>
          </div>
          <div className="hidden md:block">
            <CardDeck />
          </div>
        </div>
      </Panel>
    </section>
  );
}
