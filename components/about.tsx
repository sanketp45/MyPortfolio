import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { BUTTON_PRIMARY } from "@/components/cta-styles";

// The headline's clamp() deviates from the literal 36-68px spec below
// 900px. At the stated clamp(36px, 5.5vw, 68px), the longer of the two
// lines ("Building is how I prove it.") needs ~500px and the panel only
// has ~295px to give it on a 375px phone — it would wrap into 4 lines. The
// two-term formula scales the minimum down for narrow viewports (same
// technique used for the hero h1) so both lines stay on one line each,
// while landing back on ~36px around the same ~650px width the original
// curve's floor would have taken over anyway.
const HEADLINE_CLAMP = "clamp(18px, 7.7vw - 9px, 68px)";

export default function About() {
  return (
    <section aria-labelledby="about-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className="p-[clamp(28px,4vw,56px)]">
          <p className="mb-[20px] text-h3 font-body font-normal text-text-secondary">
            A bit about me.
          </p>

          <h2
            id="about-heading"
            className="mb-[40px] font-display font-semibold text-accent-base"
            style={{
              fontSize: HEADLINE_CLAMP,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="block whitespace-nowrap">Design is how I think.</span>
            <span className="block whitespace-nowrap">Building is how I prove it.</span>
          </h2>

          <div className="grid grid-cols-1 items-center gap-[56px] min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* Framed image — line/subtle padding reads as a photo mat, not a border */}
            <div className="rounded-lg bg-line-subtle p-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
                {/* Placeholder — swap for a real photo. Alt text describes
                    the intended shot so it still carries meaning once one
                    exists, per spec; update it to match whatever photo
                    actually goes here. */}
                <Image
                  src="/images/about-placeholder.jpg"
                  alt="Sanket sketching a screen layout at his desk, notebook open beside a laptop"
                  fill
                  className="object-cover"
                  sizes="(min-width: 900px) 42vw, 100vw"
                />
              </div>
            </div>

            {/* Copy */}
            <div>
              <p className="max-w-[36em] text-[18px] leading-[1.45] text-text-primary min-[900px]:text-[22px]">
                Being a designer with an engineering background, I&apos;ve always felt like
                I&apos;m in a different room. Now that&apos;s my superpower.
              </p>

              <Link href="/about" className={cx(BUTTON_PRIMARY, "mt-5")}>
                Learn more about me
              </Link>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
