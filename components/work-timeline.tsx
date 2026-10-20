"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { DEFAULT_WORK_ITEMS, type WorkTimelineItem } from "@/lib/work-timeline-items";
import { SectionHeading, SECTION_CONTENT_GAP, SECTION_PAD } from "@/components/section-heading";

export type { WorkTimelineItem };
export { DEFAULT_WORK_ITEMS };

const DEFAULT_LOCKED_LABEL = "Password required to read";

// Only used by the styleguide page, to render each visual state without
// needing a real pointer/keyboard to trigger it. Has no effect when unset,
// which is how the homepage renders this component.
type DemoState = "rest" | "hover" | "focus" | "locked-hover";

/**
 * Tracks a single shared tooltip for whichever locked item is currently
 * hovered. One element for the whole list (not one per item) so there's
 * only ever one DOM node to move. Position updates go straight to the
 * node's style via a ref and are throttled to one write per animation
 * frame — never through React state, per spec.
 */
function useLockedTooltip() {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const canHoverRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover)");
    canHoverRef.current = mq.matches;
    const onChange = () => {
      canHoverRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const applyPosition = useCallback((x: number, y: number) => {
    const el = tooltipRef.current;
    if (!el) return;
    const flip = x > window.innerWidth - 200;
    el.style.transform = flip
      ? `translate(${x}px, ${y}px) translate(calc(-100% - 16px), 14px)`
      : `translate(${x}px, ${y}px) translate(16px, 14px)`;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!canHoverRef.current) return;
      pendingRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (pendingRef.current) applyPosition(pendingRef.current.x, pendingRef.current.y);
      });
    },
    [applyPosition]
  );

  const onPointerEnter = useCallback(
    (itemLabel: string, e: React.PointerEvent) => {
      if (!canHoverRef.current) return;
      setLabel(itemLabel);
      setVisible(true);
      applyPosition(e.clientX, e.clientY);
    },
    [applyPosition]
  );

  const onPointerLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hide = () => setVisible(false);
    window.addEventListener("scroll", hide, true);
    return () => window.removeEventListener("scroll", hide, true);
  }, [visible]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { tooltipRef, label, visible, onPointerMove, onPointerEnter, onPointerLeave };
}

interface TimelineItemProps {
  item: WorkTimelineItem;
  isLast: boolean;
  markerRef: (el: HTMLSpanElement | null) => void;
  tooltip: ReturnType<typeof useLockedTooltip>;
  demoState?: DemoState;
}

// Marker (26) + gap (32) + year (200) + gap (32) before the card column.
// Explicit spacer tracks rather than a uniform `gap` because the two gaps
// aren't the same width.
const ROW_GRID_COLS = "26px 32px 200px 32px minmax(0,1fr)";
const MARKER_OUTER_PX = 22;
const MARKER_DOT_PX = 8;

function TimelineItem({ item, isLast, markerRef, tooltip, demoState }: TimelineItemProps) {
  const locked = !!item.locked;
  // Hover and focus-within share identical classes throughout, per spec,
  // so any of these three demo states renders the same visual treatment.
  const forceHover = demoState === "hover" || demoState === "focus" || demoState === "locked-hover";

  // A function, not a shared JSX element — it's rendered once for desktop
  // (with the ref used for rule/progress-line measurement) and again for
  // the separate mobile-only row. Reusing one element in both places would
  // mount two real DOM nodes for a single ref, and since the mobile one is
  // the one actually attached last, every measurement would read a
  // display:none element's (all-zero) rect instead of the visible one.
  const renderMarker = (withRef: boolean) => (
    <span
      ref={withRef ? markerRef : undefined}
      aria-hidden="true"
      className={cx(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 border-line-strong duration-0 transition-colors",
        "group-has-[[data-hover-zone]:hover]/row:border-accent-base group-has-[[data-hover-zone]:hover]/row:duration-[180ms]",
        "group-focus-within/row:border-accent-base group-focus-within/row:duration-[180ms]",
        forceHover && "border-accent-base"
      )}
      style={{ width: MARKER_OUTER_PX, height: MARKER_OUTER_PX }}
    >
      <span
        className={cx(
          "rounded-full bg-text-muted duration-0 transition-colors",
          "group-has-[[data-hover-zone]:hover]/row:bg-accent-base group-has-[[data-hover-zone]:hover]/row:duration-[180ms]",
          "group-focus-within/row:bg-accent-base group-focus-within/row:duration-[180ms]",
          forceHover && "bg-accent-base"
        )}
        style={{ width: MARKER_DOT_PX, height: MARKER_DOT_PX }}
      />
    </span>
  );

  const year = (
    <span className="font-display text-[48px] font-medium leading-[1.1] text-text-secondary">
      {item.year}
    </span>
  );

  // Whether the whole effect is on is driven by :hover on the content zone
  // itself (title + description + media, tightly wrapped, no padding) —
  // not by hovering the card's padding/whitespace. The card box, marker,
  // and title all read that same zone's hover state:
  //  - the card box is a direct ancestor of the zone, so a plain
  //    `has-[[data-hover-zone]:hover]` on it is enough.
  //  - the marker lives outside the card entirely (a grid sibling), so it
  //    reads the zone's hover via a `has()` on the shared row ancestor,
  //    exposed to descendants as a named group.
  //  - the title is inside the zone, so it can use a simple
  //    group-hover on the zone's own name.
  // Entrance is animated (duration set only on the hovered variant);
  // leaving snaps instantly (base duration is 0), per spec.
  const zoneHover = "group-hover/zone";

  return (
    <div
      className={cx(
        "group/row grid items-start",
        // The 5-column template is applied by class, only at 820px+, via a
        // CSS variable. It used to be an inline style, which beat the
        // max-[819px]:grid-cols-1 class, so phones kept a 26px first
        // column and wrapped every title one word per line.
        "grid-cols-1 gap-y-3 min-[820px]:[grid-template-columns:var(--row-cols)] min-[820px]:gap-y-0",
        !isLast && "pb-[48px] min-[820px]:pb-[72px]"
      )}
      style={{ "--row-cols": ROW_GRID_COLS } as CSSProperties}
      onPointerMove={locked ? tooltip.onPointerMove : undefined}
      onPointerEnter={locked ? (e) => tooltip.onPointerEnter(item.lockedLabel ?? DEFAULT_LOCKED_LABEL, e) : undefined}
      onPointerLeave={locked ? tooltip.onPointerLeave : undefined}
    >
      {/* Marker and year always sit on the panel background — no hover
          background, no card treatment. Hidden here on mobile in favor of
          the inline row rendered above the title instead. */}
      <div className="flex justify-center max-[819px]:hidden">{renderMarker(true)}</div>
      <div aria-hidden="true" className="max-[819px]:hidden" />
      <div className="max-[819px]:hidden">{year}</div>
      <div aria-hidden="true" className="max-[819px]:hidden" />

      {/* Card column — the padded box that visually shows the background
          and shadow. It never triggers the effect itself; it only reacts
          to whether the hover-zone below (its own descendant) is hovered. */}
      <div
        className={cx(
          "relative min-w-0 rounded-[24px] bg-transparent px-[48px] py-[44px] shadow-none duration-0",
          "transition-[background-color,box-shadow,transform]",
          "max-[819px]:px-0 max-[819px]:py-0",
          "has-[[data-hover-zone]:hover]:bg-bg-surface has-[[data-hover-zone]:hover]:shadow-[0px_12px_32px_rgba(0,0,0,0.12)]",
          "has-[[data-hover-zone]:hover]:-translate-y-0.5 has-[[data-hover-zone]:hover]:duration-200 has-[[data-hover-zone]:hover]:ease-out",
          "focus-within:bg-bg-surface focus-within:shadow-[0px_12px_32px_rgba(0,0,0,0.12)] focus-within:-translate-y-0.5",
          "focus-within:duration-200 focus-within:ease-out",
          forceHover && "bg-bg-surface shadow-[0px_12px_32px_rgba(0,0,0,0.12)] -translate-y-0.5"
        )}
      >
        {/* Mobile-only inline marker + year row above the title. */}
        <div className="mb-3 hidden items-center gap-3 max-[819px]:flex">
          {renderMarker(false)}
          {year}
        </div>

        {/* The hover-zone: title, description, and media only. Hovering
            anywhere in here — not the card's padding — is what activates
            the whole effect. */}
        <div data-hover-zone className="group/zone">
          <h3 className="text-[28px] font-display font-bold leading-[1.2] tracking-[-0.01em] text-accent-base min-[820px]:text-[40px]">
            <a
              href={item.href}
              {...(/^https?:\/\//.test(item.href) && { target: "_blank", rel: "noopener noreferrer" })}
              className={cx(
                // The overlay covers the whole card, over the media too (z-10),
                // so anywhere on it opens the case study.
                "outline-none after:absolute after:inset-0 after:z-10 after:content-['']",
                "underline-offset-[5px] focus-visible:underline",
                `${zoneHover}:underline`,
                forceHover && "underline"
              )}
            >
              {item.title}
              {locked && <span className="sr-only"> (password protected)</span>}
              {/^https?:\/\//.test(item.href) && <span className="sr-only"> (opens in a new tab)</span>}
            </a>
          </h3>

          <p className="mt-[12px] max-w-[40em] text-[17px] leading-[1.55] text-text-primary min-[820px]:text-[19px]">
            {item.description}
          </p>

          <div className="mt-[20px] aspect-[16/10] w-full overflow-hidden rounded-[14px] min-[820px]:mt-[32px]">
            {item.image ? (
              // Contained on a tinted ground, not cover-cropped: the
              // Framer media are tall phone mockups that a 16/10 crop
              // would slice through the middle of.
              <div className="relative h-full w-full bg-line-subtle">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-contain py-[clamp(16px,3vw,40px)]"
                  sizes="(min-width: 820px) 30vw, 60vw"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-line-subtle">
                <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-text-muted">
                  Media placeholder
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface WorkTimelineProps {
  items?: WorkTimelineItem[];
  /** Styleguide-only: forces one item's visual state instead of relying on real hover/focus. */
  demoStates?: DemoState[];
}

export default function WorkTimeline({ items = DEFAULT_WORK_ITEMS, demoStates }: WorkTimelineProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);
  // Rule bounds relative to the list container, in px — read by the scroll
  // handler below so it doesn't need to re-measure markers on every scroll.
  const ruleBoundsRef = useRef({ top: 0, bottom: 0 });
  const scrollRafRef = useRef<number | null>(null);
  const tooltip = useLockedTooltip();
  const { tooltipRef, label: tooltipLabel, visible: tooltipVisible } = tooltip;

  const measureRule = useCallback(() => {
    const container = listRef.current;
    const markers = markerRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!container || markers.length === 0) return;
    const containerRect = container.getBoundingClientRect();
    const first = markers[0].getBoundingClientRect();
    const last = markers[markers.length - 1].getBoundingClientRect();
    const top = first.top + first.height / 2 - containerRect.top;
    const bottom = containerRect.bottom - (last.top + last.height / 2);
    container.style.setProperty("--timeline-rule-top", `${Math.max(top, 0)}px`);
    container.style.setProperty("--timeline-rule-bottom", `${Math.max(bottom, 0)}px`);
    ruleBoundsRef.current = { top: Math.max(top, 0), bottom: Math.max(bottom, 0) };
  }, []);

  // Fills the rule with accent/base as the user scrolls, tracking how much
  // of it has passed a fixed point (40% down the viewport) — so it reads
  // as a reading-progress indicator through the timeline, e.g. filled up
  // to the 2025 marker once that item is roughly centered on screen.
  const updateProgress = useCallback(() => {
    const container = listRef.current;
    const progressEl = progressRef.current;
    if (!container || !progressEl) return;
    const { top, bottom } = ruleBoundsRef.current;
    const containerRect = container.getBoundingClientRect();
    const ruleHeight = containerRect.height - top - bottom;
    if (ruleHeight <= 0) return;
    const ruleTopAbs = containerRect.top + top;
    const triggerY = window.innerHeight * 0.4;
    const progress = Math.min(1, Math.max(0, (triggerY - ruleTopAbs) / ruleHeight));
    progressEl.style.top = `${top}px`;
    progressEl.style.height = `${progress * ruleHeight}px`;
  }, []);

  useLayoutEffect(() => {
    measureRule();
    updateProgress();
  }, [measureRule, updateProgress, items]);

  useEffect(() => {
    const onResize = () => {
      measureRule();
      updateProgress();
    };
    const onScroll = () => {
      if (scrollRafRef.current !== null) return;
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        updateProgress();
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [measureRule, updateProgress]);

  return (
    <section aria-labelledby="work-timeline-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className={SECTION_PAD}>
          <SectionHeading
            id="work-timeline-heading"
            title="Some recent work"
            subtitle="From my full-time roles."
          />

          <div ref={listRef} className={cx("timeline-rule relative", SECTION_CONTENT_GAP)}>
            {/* Scroll progress fill — same 1px line as .timeline-rule::before,
                drawn in accent/base, growing as the user scrolls past it. */}
            <div
              ref={progressRef}
              aria-hidden="true"
              className="pointer-events-none absolute w-px bg-accent-base max-[819px]:hidden"
              style={{ left: 13 }}
            />
            {items.map((item, i) => (
              <TimelineItem
                key={item.year + item.title}
                item={item}
                isLast={i === items.length - 1}
                markerRef={(el) => {
                  markerRefs.current[i] = el;
                }}
                tooltip={tooltip}
                demoState={demoStates?.[i]}
              />
            ))}
          </div>
        </div>
      </Panel>

      <div
        ref={tooltipRef}
        role="presentation"
        className={cx(
          "pointer-events-none fixed left-0 top-0 z-50 whitespace-nowrap rounded-sm bg-cta-base px-[10px] py-[6px] text-[13px] text-cta-text transition-opacity duration-100",
          tooltipVisible ? "opacity-100" : "opacity-0"
        )}
      >
        {tooltipLabel}
      </div>
    </section>
  );
}
