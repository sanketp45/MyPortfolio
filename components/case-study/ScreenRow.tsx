import Image from "next/image";
import { cx } from "@/lib/cx";

export interface CaseScreen {
  src: string;
  alt: string;
  caption: string;
}

/**
 * A row of phone screenshots on the same case stage as CaseFigure:
 * two across on small screens, one row from md up where each screen keeps a
 * quarter of the row, so fewer than four sit centred at the same size.
 * Screens keep their own height, so full-page captures show in full; rows
 * line up along the top.
 */
export default function ScreenRow({ screens, label }: { screens: CaseScreen[]; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-cols-2 gap-x-[clamp(12px,2.6vw,24px)] gap-y-[28px] case-stage rounded-[20px] p-[clamp(16px,4.4vw,36px)] md:flex md:items-start md:justify-center"
    >
      {screens.map((screen) => (
        <figure key={screen.src} className="m-0 grid content-start gap-[12px] md:w-[calc(25%-15px)]">
          <Image
            src={screen.src}
            alt={screen.alt}
            width={720}
            height={1600}
            unoptimized
            className={cx(
              "block h-auto w-full rounded-[14px]",
              "shadow-[0_0_0_1px_rgba(17,17,15,0.08),0_10px_28px_rgba(17,17,15,0.10)]"
            )}
          />
          <figcaption className="text-center font-body text-[14px] font-medium leading-[1.3] tracking-[-0.01em] text-case-muted">
            {screen.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
