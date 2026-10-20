"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cx } from "@/lib/cx";

// The hero phone's prototype: the Simultaneous flow from the final design,
// played as real screens (Figma exports at 2x, 750 wide) with a cursor that
// taps through them. Picks the type, fills a nominee, lands on the summary
// at 100%, adds more, splits in the drawer and ends on the three-way split.

const DIR = "/case-studies/fd-nomination/hero";

/** Screen px of a 750-wide export, in cqw of the PhoneMockup around it (its screen is 93.4cqw wide). */
const u = (px: number) => `calc(${px} * 93.4cqw / 750)`;

interface FlowState {
  screen: number;
  /** Simultaneous picked on the type screen. */
  picked: boolean;
  /** Scroll of each form screen, in export px. */
  scroll: [number, number];
  drawer: boolean;
  cursor: { x: number; y: number; show: boolean };
  tap: boolean;
  /** Loop seam: everything fades out, resets without transitions, fades back. */
  hidden: boolean;
  instant: boolean;
}

const START: FlowState = {
  screen: 0,
  picked: false,
  scroll: [0, 0],
  drawer: false,
  cursor: { x: 560, y: 1320, show: false },
  tap: false,
  hidden: false,
  instant: false,
};

type Step = [patch: (s: FlowState) => Partial<FlowState>, wait: number];

const at = (x: number, y: number) => (s: FlowState) => ({ cursor: { ...s.cursor, x, y, show: true } });
const tap = (then: Partial<FlowState> = {}): Step[] => [
  [() => ({ tap: true }), 160],
  [() => ({ tap: false, ...then }), 0],
];
const FORM_SCROLL = 402;
/** Height of the form's app bar and step tracker, in export px. */
const FORM_HEADER = 290;

const SCRIPT: Step[] = [
  [() => ({ ...START, hidden: true, instant: true }), 60],
  [() => ({ hidden: false, instant: false }), 900],
  [at(560, 1320), 350],
  // Type screen: pick Simultaneous, continue.
  [at(330, 1036), 800],
  ...tap({ picked: true }),
  [() => ({}), 900],
  [at(375, 1494), 800],
  ...tap({ screen: 1 }),
  // Nominee form: scroll to the button, continue.
  [() => ({}), 700],
  [() => ({ scroll: [FORM_SCROLL, 0] }), 900],
  [at(380, 1539), 650],
  ...tap({ screen: 2 }),
  // One nominee: straight to the summary at 100%. Add another.
  [() => ({}), 1500],
  [at(199, 1506), 800],
  ...tap({ screen: 3 }),
  [() => ({}), 600],
  [() => ({ scroll: [FORM_SCROLL, FORM_SCROLL] }), 800],
  [at(380, 1539), 600],
  ...tap({ screen: 4, drawer: true }),
  // The split drawer, then the summary with every share.
  [() => ({}), 1400],
  [at(549, 1491), 800],
  ...tap({ drawer: false }),
  [() => ({}), 600],
  [(s) => ({ cursor: { ...s.cursor, show: false } }), 2600],
  [() => ({ hidden: true }), 450],
];

const SCREENS = [
  { src: `${DIR}/type-successive.png`, height: 1624, alt: "Select nomination type, with Successive and Simultaneous options" },
  { src: `${DIR}/form.png`, height: 2026, alt: "Add nominee details form", form: 0 },
  { src: `${DIR}/summary-one.png`, height: 1624, alt: "Nominee summary with one nominee at a 100% share" },
  { src: `${DIR}/form.png`, height: 2026, alt: "Add nominee details form for the next nominee", form: 1 },
  { src: `${DIR}/summary-three.png`, height: 1624, alt: "Nominee summary with three nominees at 45%, 35% and 20%", fade: true },
] as const;

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function SimultaneousFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [s, setState] = useState<FlowState>(START);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Reduced motion gets the final summary as a still (see below).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let first = true;
    const run = (i: number) => {
      const [patch, wait] = SCRIPT[i];
      setState((s) => ({ ...s, ...patch(s) }));
      timer = window.setTimeout(() => run((i + 1) % SCRIPT.length), wait);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (!entry.isIntersecting) return;
        // Wait for the hero's swing-in the first time round.
        timer = window.setTimeout(() => run(0), first ? 2200 : 200);
        first = false;
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const motion = (ms: number, props = "transform, opacity") =>
    s.instant ? "none" : props.split(", ").map((p) => `${p} ${ms}ms ${EASE}`).join(", ");

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-[25] overflow-hidden bg-white"
      style={{ opacity: s.hidden ? 0 : 1, transition: s.instant ? "none" : "opacity 400ms ease" }}
    >
      {SCREENS.map((screen, i) => {
        // A screen that fades in (the summary under the drawer) leaves the one beneath it in place.
        const incomingFades = "fade" in SCREENS[s.screen] && i === s.screen - 1;
        let transform = "none";
        let opacity = 1;
        if (i > s.screen) {
          if ("fade" in screen) opacity = 0;
          else transform = "translateX(100%)";
        } else if (i < s.screen && !incomingFades) {
          transform = "translateX(-28%)";
        }
        const scroll = "form" in screen ? s.scroll[screen.form] : 0;
        const style: CSSProperties = { transform, opacity, zIndex: i, transition: motion(520) };
        return (
          <div
            key={i}
            aria-hidden={i !== s.screen}
            className={cx("absolute inset-0 overflow-hidden bg-white", i > 0 && !("fade" in screen) && "shadow-[-8px_0_24px_rgba(0,0,0,0.12)]")}
            style={style}
          >
            <div style={{ transform: `translateY(${u(-scroll)})`, transition: motion(700, "transform") }}>
              <Image src={screen.src} alt={screen.alt} width={750} height={screen.height} unoptimized priority={i === 0} className="block h-auto w-full" />
            </div>
            {"form" in screen && (
              // The app bar and step tracker stay put while the form scrolls under them.
              <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: u(FORM_HEADER) }}>
                <Image src={screen.src} alt="" width={750} height={screen.height} unoptimized className="block h-auto w-full" />
              </div>
            )}
            {i === 0 && (
              <Image
                src={`${DIR}/type-simultaneous.png`}
                alt="Select nomination type with Simultaneous picked"
                width={750}
                height={1624}
                unoptimized
                className="absolute inset-x-0 top-0 block h-auto w-full"
                style={{ opacity: s.picked ? 1 : 0, transition: motion(160, "opacity") }}
              />
            )}
            {"fade" in screen && (
              <>
                <div className="absolute inset-0 bg-black" style={{ opacity: s.drawer ? 0.72 : 0, transition: motion(320, "opacity") }} />
                <div
                  className="absolute inset-x-0"
                  style={{
                    top: u(438),
                    transform: s.drawer ? "none" : "translateY(110%)",
                    transition: s.instant ? "none" : `transform ${s.drawer ? 520 : 380}ms ${EASE} ${s.drawer ? 120 : 0}ms`,
                  }}
                >
                  <Image src={`${DIR}/drawer-sheet.png`} alt="Nominee added drawer splitting shares 45%, 35% and 20%, with Allocate equally" width={750} height={1186} unoptimized className="block h-auto w-full" />
                </div>
              </>
            )}
          </div>
        );
      })}

      <Image
        src={`${DIR}/summary-three.png`}
        alt="Nominee summary with three nominees at 45%, 35% and 20%"
        width={750}
        height={1624}
        unoptimized
        className="absolute inset-x-0 top-0 z-50 hidden h-auto w-full motion-reduce:block"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-40 motion-reduce:hidden"
        style={{
          transform: `translate(${u(s.cursor.x)}, ${u(s.cursor.y)})`,
          opacity: s.cursor.show ? 1 : 0,
          transition: s.instant ? "none" : `transform 650ms ${EASE}, opacity 250ms ease`,
        }}
      >
        <span
          className="absolute left-0 top-0 h-[9cqw] w-[9cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-case-ink/25"
          style={{ opacity: s.tap ? 1 : 0, scale: s.tap ? "1" : "0.4", transition: "opacity 160ms ease, scale 160ms ease" }}
        />
        <svg
          viewBox="0 0 24 24"
          className="relative -ml-[0.6cqw] -mt-[0.4cqw] h-[5.6cqw] w-[5.6cqw] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
          style={{ scale: s.tap ? "0.82" : "1", transition: "scale 140ms ease" }}
        >
          <path d="M5 3l14 8.2-6.1 1.3 3.6 6.7-2.6 1.4-3.6-6.8L5 18.5z" className="fill-white stroke-case-ink" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
