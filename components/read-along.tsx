"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

/**
 * Read Along headline (after designbookmark.com/motion#db-read-along).
 * A pill slides from word to word behind the sentence. Its two edges are
 * separate springs, the leading one fast and the trailing one slow, so it
 * stretches as it travels. At a line break it opens up on the new line
 * instead of sliding across the text. Click a word to read from there.
 *
 * Between readings, and always under prefers-reduced-motion, the sentence is
 * plain solid text. Animation frames only run while it is on screen.
 * Word colours live in globals.css (.read-along).
 */
interface ReadAlongProps {
  /** Set lines from 1024px up; one flowing sentence below that. */
  lines: string[];
  className?: string;
  style?: CSSProperties;
}

interface Spring {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
}

const START_DELAY = 4.2; // s, lets the portrait finish its first wave
const LAST_WORD_HOLD = 1.6; // s
const REST = 4; // s of plain text between readings
const PAD = 0.1; // em the pill reaches past each side of a word
const PILL_HEIGHT = 1.14; // em
const PILL_DROP = 0.07; // em, clears descenders

const spring = (k: number, c: number): Spring => ({ x: 0, v: 0, t: 0, k, c });

function step(s: Spring, dt: number) {
  s.v += (-s.k * (s.x - s.t) - s.c * s.v) * dt;
  s.x += s.v * dt;
}

function tune(s: Spring, k: number, c: number) {
  s.k = k;
  s.c = c;
}

export default function ReadAlong({ lines, className, style }: ReadAlongProps) {
  const rootRef = useRef<HTMLHeadingElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pill = pillRef.current;
    if (!root || !pill) return;

    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const left = spring(520, 40);
    const right = spring(520, 40);
    const top = spring(600, 48);
    const fade = spring(300, 30);

    let at = -1; // -1 = resting, plain text
    let wait = START_DELAY;
    let lineTop: number | null = null;
    let visible = false;
    let raf = 0;
    let last = 0;

    const dwell = (i: number) => 0.2 + (words[i].textContent?.length ?? 0) * 0.035;

    const box = (i: number) => {
      const el = words[i];
      const em = parseFloat(getComputedStyle(root).fontSize);
      return {
        l: el.offsetLeft - em * PAD,
        r: el.offsetLeft + el.offsetWidth + em * PAD,
        top: el.offsetTop + (el.offsetHeight - em * PILL_HEIGHT) / 2 + em * PILL_DROP,
      };
    };

    const show = () => {
      root.toggleAttribute("data-reading", at >= 0);
      words.forEach((word, k) => {
        word.dataset.word = at >= 0 && k === at ? "now" : at >= 0 && k > at ? "next" : "read";
      });
      if (at < 0) {
        fade.t = 0;
        lineTop = null;
        return;
      }
      const b = box(at);
      const forward = b.l >= left.t;
      if (lineTop === null || Math.abs(b.top - lineTop) > 2 || fade.x < 0.05) {
        // First word or a new line: open from the word's left edge.
        left.x = b.l;
        right.x = b.l;
        left.v = right.v = 0;
        top.x = b.top;
      }
      lineTop = b.top;
      tune(forward ? right : left, 520, 40);
      tune(forward ? left : right, 210, 26);
      left.t = b.l;
      right.t = b.r;
      top.t = b.top;
      fade.t = 1;
    };

    const paint = () => {
      pill.style.transform = `translate(${left.x.toFixed(2)}px, ${top.x.toFixed(2)}px)`;
      pill.style.width = `${Math.max(0, right.x - left.x).toFixed(2)}px`;
      pill.style.opacity = Math.min(1, Math.max(0, fade.x)).toFixed(3);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      wait -= dt;
      if (wait <= 0) {
        if (at === words.length - 1) {
          at = -1;
          wait = REST;
        } else {
          at += 1;
          wait = at === words.length - 1 ? LAST_WORD_HOLD : dwell(at);
        }
        show();
      }
      for (let i = 0; i < 4; i++) {
        for (const s of [left, right, top, fade]) step(s, dt / 4);
      }
      paint();
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      cancelAnimationFrame(raf);
      if (motion.matches) {
        at = -1;
        wait = START_DELAY;
        show();
        fade.x = fade.v = 0;
        paint();
      } else if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (motion.matches || !(e.target instanceof Element)) return;
      const i = words.findIndex((word) => word === e.target);
      if (i < 0) return;
      at = i;
      wait = i === words.length - 1 ? LAST_WORD_HOLD : dwell(i);
      show();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    // Layout changed under the pill: reopen it on the current word.
    const ro = new ResizeObserver(() => {
      if (at < 0) return;
      lineTop = null;
      show();
    });

    io.observe(root);
    ro.observe(root);
    root.addEventListener("click", onClick);
    motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener("click", onClick);
      motion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <h1 ref={rootRef} aria-label={lines.join(" ")} className={cx("read-along relative isolate", className)} style={style}>
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[0.22em] bg-accent-base opacity-0"
        style={{ height: `${PILL_HEIGHT}em` }}
      />
      {lines.map((line, l) => (
        <span key={line} aria-hidden="true" className="min-[1024px]:block min-[1024px]:whitespace-nowrap">
          {line.split(" ").map((word, w) => (
            <span key={w}>
              {w > 0 || l > 0 ? " " : null}
              <span data-word="read">{word}</span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
