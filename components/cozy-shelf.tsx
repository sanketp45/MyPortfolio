"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { BOOKS, type Book } from "@/lib/books";

// Warm floating wall shelves (wood planks, plants, stacked books), after a
// Pinterest reference. Clicking a book opens it straight into a pair of
// hands, unfolding in a shallow V like Apple's iPhone Duo hero, with its
// note beside it. Closing folds it shut and the hands drop away.

// Which books sit on which shelf, left to right.
const SHELVES = [
  [0, 1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

/** Shelf-scale book height: the data heights are for the big shelf. */
const shelfH = (book: Book) => Math.round(book.h * 0.6);
const shelfW = (book: Book) => Math.round(book.spineW * 0.82);

// ---------------------------------------------------------------------------
// Decor
// ---------------------------------------------------------------------------

const WOOD: CSSProperties = {
  background:
    "repeating-linear-gradient(90deg, rgba(60,30,10,0.05) 0 2px, transparent 2px 11px), " +
    "repeating-linear-gradient(90deg, rgba(255,240,220,0.06) 0 1px, transparent 1px 23px), " +
    "linear-gradient(180deg, #D19A66 0%, #B9804D 55%, #9A6436 100%)",
  boxShadow: "0 12px 18px -6px rgba(90,55,25,0.35), inset 0 1px 0 rgba(255,235,210,0.5)",
};

function Plank({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("h-[18px] rounded-[3px]", className)} style={WOOD} />;
}

function PottedPlant() {
  return (
    <svg aria-hidden="true" viewBox="0 0 90 110" className="h-[110px] w-[90px] shrink-0">
      {[
        [45, 55, -40],
        [45, 55, -15],
        [45, 55, 10],
        [45, 55, 35],
        [45, 55, -62],
        [45, 55, 58],
      ].map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y - 26}
          rx="9"
          ry="26"
          fill={i % 2 ? "#4E7F45" : "#3F6B3A"}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <path d="M22 62 H68 L62 106 H28 Z" fill="#C46A43" />
      <rect x="18" y="58" width="54" height="10" rx="2" fill="#B35B36" />
    </svg>
  );
}

function Succulent() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 64" className="h-[64px] w-[80px] shrink-0">
      {[-60, -30, 0, 30, 60, -45, 45, -15, 15].map((r, i) => (
        <ellipse
          key={i}
          cx="40"
          cy="18"
          rx="7"
          ry={i > 4 ? 11 : 15}
          fill={i > 4 ? "#8DB58A" : "#6E9C6B"}
          transform={`rotate(${r} 40 32)`}
        />
      ))}
      <path d="M16 34 H64 L58 62 H22 Z" fill="#F4F0E8" stroke="#DDD5C8" />
      <path d="M22 44 Q40 50 58 44" stroke="#DDD5C8" fill="none" />
    </svg>
  );
}

function FramedPrint() {
  return (
    <svg aria-hidden="true" viewBox="0 0 70 86" className="h-[86px] w-[70px] shrink-0 -rotate-3">
      <rect x="1" y="1" width="68" height="84" rx="2" fill="#E9DFCF" stroke="#C9B9A2" strokeWidth="2" />
      <rect x="9" y="9" width="52" height="68" fill="#F7F2E9" />
      <path d="M35 70 V28" stroke="#7E8F6A" strokeWidth="1.5" />
      {[30, 38, 46, 54].map((y, i) => (
        <g key={y}>
          <ellipse cx={35 - 8} cy={y} rx="8" ry="3.5" fill="#9AAC85" transform={`rotate(${-25 - i * 4} ${35 - 8} ${y})`} />
          <ellipse cx={35 + 8} cy={y + 4} rx="8" ry="3.5" fill="#9AAC85" transform={`rotate(${25 + i * 4} ${35 + 8} ${y + 4})`} />
        </g>
      ))}
    </svg>
  );
}

/** Ivy hanging over a shelf edge. Absolutely positioned by the parent. */
function TrailingIvy({ className, flip }: { className?: string; flip?: boolean }) {
  const leaves = [
    [18, 14, -30],
    [30, 34, 20],
    [16, 56, -40],
    [32, 80, 25],
    [20, 104, -20],
    [34, 128, 30],
    [24, 150, -10],
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 170"
      className={cx("pointer-events-none h-[170px] w-[60px]", flip && "-scale-x-100", className)}
    >
      <path d="M26 0 C 14 30, 38 50, 24 80 S 36 130, 28 168" stroke="#4A6B3E" strokeWidth="1.6" fill="none" />
      {leaves.map(([x, y, r], i) => (
        <path
          key={i}
          d={`M${x} ${y} c -9 -6 -9 -16 0 -18 c 9 2 9 12 0 18 z`}
          fill={i % 2 ? "#5B8A4C" : "#476F3C"}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

function BookStack({ colors }: { colors: string[] }) {
  return (
    <div aria-hidden="true" className="flex shrink-0 flex-col items-center">
      {colors.map((c, i) => (
        <span
          key={i}
          className="block rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
          style={{ background: c, height: 15 + (i % 2) * 3, width: 118 - (i % 3) * 8, marginLeft: (i % 2) * 6 }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The open book, held in two hands (after Apple's iPhone Duo hero).
// ---------------------------------------------------------------------------

/** A page of "text": grey bars of varying length, the same on every page so
 *  a page snapping back after a turn is invisible. */
function PageText() {
  const widths = [96, 92, 98, 88, 95, 70, 0, 94, 97, 90, 96, 84, 93, 58, 0, 95, 91, 97, 76];
  return (
    <div className="absolute inset-x-[12%] top-[16%] bottom-[10%] flex flex-col" style={{ gap: "3.4%" }}>
      {widths.map((wd, i) =>
        wd === 0 ? (
          <span key={i} className="block h-[2%]" />
        ) : (
          <span key={i} className="block h-[1.6%] rounded-full bg-[#3C3228]/[0.17]" style={{ width: `${wd}%` }} />
        )
      )}
    </div>
  );
}

const PAPER = "#F8F2E7";

function Paper({ side, head, style }: { side: "left" | "right"; head?: string; style?: CSSProperties }) {
  // Gutter shadow towards the spine, like a real spread.
  const dir = side === "right" ? "90deg" : "270deg";
  return (
    <div
      className={cx("absolute inset-0 overflow-hidden [backface-visibility:hidden]", side === "right" ? "rounded-r-[4px]" : "rounded-l-[4px]")}
      style={{
        background: `linear-gradient(${dir}, rgba(60,40,20,0.24), rgba(60,40,20,0.07) 10%, transparent 28%), ${PAPER}`,
        ...style,
      }}
    >
      {head && (
        <span
          className={cx(
            "absolute top-[6.5%] max-w-[76%] truncate font-mono text-[clamp(7px,0.8vw,10px)] uppercase tracking-[0.16em] text-[#3C3228]/50",
            side === "left" ? "left-[12%]" : "right-[12%]"
          )}
        >
          {head}
        </span>
      )}
      <PageText />
    </div>
  );
}

// Held like Apple's iPhone Duo hero: the hands photo sits BEHIND the book,
// so the book hides every finger, and a thumbs-only cut-out of the same
// photo (same size and position) sits IN FRONT, resting on the pages.
// bookLeft/bookRight are where the spread's outer edges fall across the
// image's width (just inside the thumbs, covering the fingers, which start
// at ~0.20 / ~0.80); bookTop puts the thumb tips about a third of the way
// down the pages.
const HANDS = {
  back: "/books/hands/hands-open.png",
  thumbs: "/books/hands/thumbs-v2.png",
  aspect: 974 / 1615, // height / width
  bookLeft: 0.205,
  bookRight: 0.795,
  bookTop: -0.06,
};

const V_ANGLE = 5; // how far each half tilts towards you when open
const FOLDED = 74; // nearly shut, at the start and end

// ---------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------

interface Opened {
  index: number;
}

const CLOSE_MS = 560;

function BookOverlay({ opened, onClosed }: { opened: Opened; onClosed: () => void }) {
  const book = BOOKS[opened.index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const closingRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [size] = useState(() => {
    const small = typeof window !== "undefined" && window.innerWidth < 768;
    const h = small ? 133 : 266;
    const w = Math.round(h * book.coverRatio);
    return { w, h };
  });
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Straight into the hands: open on the next frame so it unfolds.
  useEffect(() => {
    closeRef.current?.focus();
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setOpen(true);
        timers.current.push(setTimeout(() => setReading(true), reduced ? 0 : 1300));
      })
    );
    const t = timers.current;
    return () => {
      cancelAnimationFrame(id);
      t.forEach(clearTimeout);
    };
  }, [reduced]);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setReading(false);
    setOpen(false);
    timers.current.push(setTimeout(onClosed, reduced ? 0 : CLOSE_MS));
  };

  // Escape to close; lock page scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close is stable for this overlay's lifetime
  }, []);

  const { w, h } = size;
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const tr = (props: string, ms: number, delay = 0) => (reduced ? "none" : props.split(",").map((p) => `${p.trim()} ${ms}ms ${ease} ${delay}ms`).join(", "));
  const angle = open ? V_ANGLE : FOLDED;

  // Both hand layers share one box so the thumbs line up with the hands.
  const iw = (2 * w) / (HANDS.bookRight - HANDS.bookLeft);
  const ih = iw * HANDS.aspect;
  const handsLayer = (src: string, imgClass?: string) => (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute"
      style={{
        width: iw,
        height: ih,
        left: -HANDS.bookLeft * iw,
        top: -HANDS.bookTop * ih,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(30%)",
        transition: tr("opacity, transform", 800, open ? 300 : 0),
        // Soften where the photo crops the wrists.
        maskImage: "linear-gradient(to bottom, #000 86%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 86%, transparent 100%)",
      }}
    >
      <Image src={src} alt="" fill sizes="(min-width: 768px) 1100px, 560px" className={cx("object-contain", imgClass)} />
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} by ${book.author}`}
      className="fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto md:overflow-hidden"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
        className={cx(
          "fixed inset-0 cursor-default bg-[rgba(24,18,12,0.55)] backdrop-blur-[4px] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div className="pointer-events-none relative flex min-h-full flex-col items-center justify-center gap-[40px] px-5 pt-[72px] pb-[48px] md:flex-row md:gap-[clamp(96px,14vw,220px)]">
        {/* Stage: the book plus the hands holding it */}
        <div className="relative shrink-0" style={{ width: 2 * w, height: h }}>
          <div
            className={cx("absolute inset-x-0 top-0", reading && "motion-safe:animate-[book-read-bob_3.6s_ease-in-out_infinite_alternate]")}
            style={{ height: h }}
          >
            {/* Behind: the hands, fingers hidden by the book */}
            {handsLayer(HANDS.back)}

            {/* Soft shadow under the spread */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[6%] -bottom-[6%] h-[14%] rounded-[50%] bg-black/35 blur-[14px]"
              style={{ opacity: open ? 1 : 0, transition: tr("opacity", 600, 200) }}
            />

            {/* The spread: two halves hinged at the spine, in a shallow V */}
            <div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{
                perspective: 1400,
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0) scale(1)" : "translateY(24px) scale(0.94)",
                transition: tr("opacity, transform", 700),
              }}
            >
              <div
                className="absolute top-0 left-0 h-full origin-right [transform-style:preserve-3d]"
                style={{ width: w, transform: `rotateY(${angle}deg)`, transition: tr("transform", 1000, 80) }}
              >
                <Paper side="left" head={book.title} />
              </div>
              <div
                className="absolute top-0 right-0 h-full origin-left [transform-style:preserve-3d]"
                style={{ width: w, transform: `rotateY(${-angle}deg)`, transition: tr("transform", 1000, 80) }}
              >
                <Paper side="right" head="47" />
                {/* page stack along the outer edge */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-[1%] -right-[3px] w-[4px] rounded-r-[2px]"
                  style={{ background: "repeating-linear-gradient(0deg, #E8DFCE 0 1px, #D6C9B2 1px 2px)" }}
                />
              </div>

              {/* A page turning now and then */}
              {reading && !reduced && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 h-full origin-left [transform-style:preserve-3d] animate-[book-page-turn-v_5s_cubic-bezier(.45,.05,.3,1)_0.8s_infinite]"
                  style={{ width: w, transform: `rotateY(${-V_ANGLE}deg)` }}
                >
                  {/* Same running heads as the pages beneath, so nothing
                      blinks in or out as the page turns over. */}
                  <Paper side="right" head="47" style={{ transform: "translateZ(1px)" }} />
                  <Paper side="left" head={book.title} style={{ transform: "rotateY(180deg) translateZ(1px)" }} />
                </div>
              )}
            </div>

            {/* In front: just the thumbs, over the page edges */}
            {handsLayer(HANDS.thumbs, "[filter:drop-shadow(0_4px_5px_rgba(40,25,10,0.35))]")}
          </div>
        </div>

        {/* Note */}
        <div
          className={cx(
            "pointer-events-auto relative z-10 w-full max-w-[440px] rounded-[24px] bg-bg-surface p-[28px] shadow-[0_24px_60px_rgba(30,20,10,0.25)]",
            "transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-opacity",
            open ? "translate-x-0 opacity-100 delay-[350ms]" : "translate-y-[12px] opacity-0 md:translate-x-[24px] md:translate-y-0"
          )}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Put the book back"
            className={cx(
              "absolute top-[16px] right-[16px] inline-flex h-[36px] w-[36px] items-center justify-center rounded-full",
              "bg-bg-canvas text-text-primary hover:bg-line-subtle",
              "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base"
            )}
          >
            <svg viewBox="0 0 14 14" className="h-[12px] w-[12px]" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2 12 12M12 2 2 12" />
            </svg>
          </button>
          <h3 className="pr-[40px] font-display text-[28px] font-bold leading-[1.15] text-accent-base">
            {book.title}
          </h3>
          <p className="mt-[10px] font-body text-[16px] font-medium leading-[1.55] text-text-primary">{book.about}</p>
          <p className="mt-[22px] font-mono text-caption font-medium uppercase tracking-[0.12em] text-text-primary">
            What I took from it
          </p>
          <p className="mt-[8px] border-l-2 border-accent-base pl-[14px] font-body text-[17px] font-medium leading-[1.6] text-text-primary">
            {book.lesson}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shelf
// ---------------------------------------------------------------------------

function ShelfRow({
  children,
  className,
  plankClassName,
}: {
  children: ReactNode;
  className?: string;
  plankClassName?: string;
}) {
  return (
    <div className={cx("relative", className)}>
      <div className="flex items-end gap-[3px] px-[14px]">{children}</div>
      <Plank className={plankClassName} />
    </div>
  );
}

export default function CozyShelf() {
  const [opened, setOpened] = useState<Opened | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const open = (index: number) => {
    const el = buttonRefs.current[index];
    if (!el) return;
    setOpened({ index });
  };

  const closed = () => {
    const index = opened?.index;
    setOpened(null);
    if (index !== undefined) buttonRefs.current[index]?.focus();
  };

  const spine = (i: number) => {
    const book = BOOKS[i];
    const hidden = opened?.index === i;
    return (
      <button
        key={book.id}
        ref={(el) => {
          buttonRefs.current[i] = el;
        }}
        type="button"
        onClick={() => open(i)}
        aria-label={`${book.title} by ${book.author}`}
        className={cx(
          "relative flex shrink-0 cursor-pointer justify-center overflow-hidden rounded-t-[2px]",
          "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),inset_-3px_0_0_rgba(0,0,0,0.08)]",
          "transition-transform duration-300 ease-out hover:-translate-y-[8px] focus-visible:-translate-y-[8px] motion-reduce:transition-none",
          "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base"
        )}
        style={{
          width: shelfW(book),
          height: shelfH(book),
          background: book.spine,
          color: book.spineText,
          visibility: hidden ? "hidden" : "visible",
        }}
      >
        <span
          className="mt-2 overflow-hidden font-display text-[11px] font-medium whitespace-nowrap select-none [writing-mode:vertical-rl] rotate-180"
          style={{ maxHeight: shelfH(book) - 16 }}
        >
          {book.title}
        </span>
      </button>
    );
  };

  return (
    <>
      <div
        className="relative overflow-hidden rounded-[20px] px-[clamp(16px,5vw,64px)] pt-[40px] pb-[56px]"
        style={{
          background:
            "radial-gradient(120% 90% at 85% 10%, rgba(255,236,200,0.55), transparent 60%), linear-gradient(115deg, #FBF7F0 0%, #F2EADF 100%)",
        }}
      >
        <p className="mb-[28px] text-center font-mono text-caption uppercase tracking-[0.2em] text-text-primary opacity-60">
          Pick a book off the shelf
        </p>

        <div className="mx-auto flex max-w-[640px] flex-col gap-[64px]">
          {/* Top shelf */}
          <ShelfRow className="mr-auto w-[min(100%,520px)]">
            {SHELVES[0].map(spine)}
            <div className="ml-auto flex items-end gap-[12px]">
              <div className="hidden sm:block">
                <BookStack colors={["#E7DCCB", "#C9A27A", "#EFE7DA"]} />
              </div>
              <PottedPlant />
            </div>
          </ShelfRow>

          {/* Middle shelf, ivy hanging off the left */}
          <ShelfRow className="ml-auto w-[min(100%,560px)]">
            <div className="relative mr-[10px] w-[60px] shrink-0 self-stretch">
              <TrailingIvy className="absolute -bottom-[150px] left-0" />
            </div>
            {SHELVES[1].map(spine)}
            <div className="ml-auto">
              <BookStack colors={["#EFE7DA", "#D8C3A5", "#F3EEE5", "#C7865F", "#E9E0D2"]} />
            </div>
          </ShelfRow>

          {/* Bottom shelf */}
          <ShelfRow className="mr-auto w-[min(100%,540px)]">
            <Succulent />
            <div className="w-[10px] shrink-0" />
            {SHELVES[2].map(spine)}
            <div className="ml-auto flex items-end gap-[10px]">
              <FramedPrint />
            </div>
          </ShelfRow>
        </div>

        <TrailingIvy flip className="absolute top-0 right-[6%] hidden opacity-90 md:block" />
      </div>

      {/* Portalled to <body>: the section panel is `isolate`, which would
          otherwise keep the overlay under the sticky nav and chat button. */}
      {opened && createPortal(<BookOverlay key={opened.index} opened={opened} onClosed={closed} />, document.body)}
    </>
  );
}
