import Image from "next/image";
import { cx } from "@/lib/cx";

export interface CaseFigureProps {
  src: string;
  alt: string;
  caption?: string;
  /**
   * "screen" (default) fills a 16:10 viewport, for wide multi-screen shots.
   * "phone" shows a single tall mobile screen at its own aspect ratio,
   * centred; pass its intrinsic width and height.
   */
  variant?: "screen" | "phone";
  width?: number;
  height?: number;
}

/** A screen on the case stage, with a caption. */
export default function CaseFigure({ src, alt, caption, variant = "screen", width, height }: CaseFigureProps) {
  return (
    <figure className="m-0 grid gap-[12px]">
      <div className="case-stage rounded-[20px] p-[clamp(28px,7.2vw,72px)]">
        {variant === "phone" && width && height ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized
            className={cx(
              "mx-auto block h-auto w-full max-w-[300px] rounded-[24px]",
              "shadow-[0_0_0_1px_rgba(17,17,15,0.08),0_18px_48px_rgba(17,17,15,0.12)]"
            )}
          />
        ) : (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[clamp(11px,1.2vw,16px)]">
            <Image src={src} alt={alt} fill unoptimized className="object-cover" />
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-center font-body text-[14px] font-medium leading-[1.2] tracking-[-0.01em] text-case-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
