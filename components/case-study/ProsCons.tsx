import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { CheckIcon, CrossIcon } from "./icons";

export interface ProsConsNotes {
  good: string[];
  bad: string[];
}

const TONES = {
  good: {
    title: "What works",
    heading: "text-case-green",
    note: "bg-[color-mix(in_srgb,var(--color-case-green)_16%,var(--color-bg-surface))]",
  },
  bad: {
    title: "What doesn’t",
    heading: "text-case-red",
    note: "bg-card-work",
  },
} as const;

function NoteColumn({ items, tone }: { items: string[]; tone: keyof typeof TONES }) {
  const t = TONES[tone];
  return (
    <div>
      <h4 className={cx("mb-[16px] font-mono text-[14px] font-medium uppercase tracking-[0.06em]", t.heading)}>{t.title}</h4>
      <ul className="grid gap-[16px]">
        {items.map((item, i) => (
          <li
            key={item.slice(0, 24)}
            className={cx(
              "rounded-[2px] px-[24px] py-[24px] shadow-[0_1px_2px_rgba(17,17,15,0.06),0_10px_22px_rgba(17,17,15,0.08)]",
              t.note,
              i % 2 === 0 ? "md:-rotate-[0.6deg]" : "md:rotate-[0.6deg]"
            )}
          >
            <p className="font-hand text-[18px] leading-[1.45] text-case-ink">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoteList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
  tone: "good" | "bad";
}) {
  return (
    <div>
      <h4
        className={cx(
          "mb-[16px] font-mono text-[14px] font-medium uppercase tracking-[0.06em]",
          tone === "good" ? "text-case-green" : "text-case-red"
        )}
      >
        {title}
      </h4>
      <ul className="grid gap-[16px]">
        {items.map((item) => (
          <li
            key={item.slice(0, 24)}
            className="flex gap-[12px] font-body text-[16px] leading-[1.55] tracking-[-0.016em] text-case-ink"
          >
            <span
              className={cx(
                "mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full",
                tone === "good" ? "bg-case-green/[0.12] text-case-green" : "bg-case-red/[0.12] text-case-red"
              )}
            >
              {icon}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What a reference product gets right and wrong: ticked and crossed lists,
 * or two columns of sticky notes, for research findings.
 */
export default function ProsCons({ notes, sticky = false }: { notes: ProsConsNotes; sticky?: boolean }) {
  if (sticky) {
    return (
      <div className="grid gap-[32px] md:grid-cols-2 md:gap-[28px]">
        <NoteColumn items={notes.good} tone="good" />
        <NoteColumn items={notes.bad} tone="bad" />
      </div>
    );
  }
  return (
    <div className="grid gap-[32px] md:grid-cols-2 md:gap-[36px]">
      <NoteList
        title="What works"
        items={notes.good}
        tone="good"
        icon={<CheckIcon width={11} height={11} strokeWidth={2.6} />}
      />
      <NoteList
        title="What doesn’t"
        items={notes.bad}
        tone="bad"
        icon={<CrossIcon width={10} height={10} strokeWidth={2.6} />}
      />
    </div>
  );
}
