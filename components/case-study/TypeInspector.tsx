"use client";

import { useCallback, useEffect, useState } from "react";
import { cx } from "@/lib/cx";

interface Tag {
  key: number;
  top: number;
  left: number;
  /** In the left margin beside the text, or after the end of its last line. */
  side: "margin" | "end";
  label: string;
}

/** Room a tag needs in the left margin. */
const TAG_ROOM = 150;

const FAMILY_NAMES: [RegExp, string][] = [
  [/gabarito|display/i, "Gabarito"],
  [/hanken|body/i, "Hanken"],
  [/jetbrains|mono/i, "JetBrains Mono"],
  [/instrument|serif/i, "Instrument Serif"],
];

const familyName = (stack: string) => FAMILY_NAMES.find(([re]) => re.test(stack))?.[1] ?? stack.split(",")[0];

/** Elements whose own text (not a child's) is visible. */
function textElements(root: Element) {
  const out: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const seen = new Set<HTMLElement>();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;
    // Skip decorative, aria-hidden areas such as the hero's phone mockup.
    if (!el || seen.has(el) || el.closest("[data-type-inspector], [aria-hidden='true']")) continue;
    seen.add(el);
    const rect = el.getBoundingClientRect();
    if (rect.width && rect.height) out.push(el);
  }
  return out;
}

/**
 * Dev-only overlay: a toggle that tags every piece of text on the page with
 * its rendered font size, weight and family, read from computed styles so
 * clamp() and breakpoints show their real value at the current width.
 */
export default function TypeInspector() {
  const [on, setOn] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  const measure = useCallback(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const els = textElements(main);
    const rects = els.map((el) => el.getBoundingClientRect());
    setTags(
      els.map((el, key) => {
        const style = getComputedStyle(el);
        const rect = rects[key];
        const size = Math.round(parseFloat(style.fontSize) * 10) / 10;
        const label = `${size}px · ${style.fontWeight} · ${familyName(style.fontFamily)}`;
        // Margin unless other text (e.g. a neighbouring card column) is there.
        const marginTaken = rects.some(
          (r, i) => i !== key && r.right > rect.left - TAG_ROOM && r.left < rect.left && r.bottom > rect.top && r.top < rect.top + 16
        );
        if (!marginTaken) {
          return { key, top: rect.top + window.scrollY, left: rect.left + window.scrollX, side: "margin" as const, label };
        }
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = range.getClientRects();
        const last = lines[lines.length - 1] ?? rect;
        return { key, top: last.top + window.scrollY, left: last.right + window.scrollX, side: "end" as const, label };
      })
    );
  }, []);

  useEffect(() => {
    if (!on) return;
    // Measure after layout settles, then again on resize.
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [on, measure]);

  return (
    <div data-type-inspector>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className="fixed bottom-[88px] left-[16px] z-[60] rounded-full bg-cta-base px-[14px] py-[8px] font-mono text-[12px] text-cta-text shadow-lg hover:bg-cta-hover md:bottom-[24px] md:left-[72px]"
      >
        {on ? "Hide type sizes" : "Type sizes"}
      </button>
      {on && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[55]">
          {tags.map((tag) => (
            <span
              key={tag.key}
              className={cx(
                "absolute mt-[2px] whitespace-nowrap rounded-[4px] bg-case-red px-[4px] py-[1px] font-mono text-[10px] leading-[1.3] text-white opacity-90",
                tag.side === "margin" ? "-ml-[8px] -translate-x-full" : "ml-[6px]"
              )}
              style={{ top: tag.top, left: tag.left }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
