import { PortraitArt } from "@/components/chat/ChatAvatar";

/**
 * Hero introduction: a line-art portrait next to the name, with the role
 * and location set in small mono caps underneath, like a name card.
 *
 * Motion (all in globals.css, all off under prefers-reduced-motion):
 * - on load, the portrait settles in and the three text lines rise in one
 *   after another;
 * - every ~5s the hand comes up and waves hello while he smiles, then
 *   drops out of frame again (modelled on the "says hello" avatar at
 *   rolangomes19.github.io/portfolio); between waves the head sways a
 *   couple of degrees and the eyes blink;
 * - on hover, the brows lift and the head tilts a little further, as if
 *   saying hello.
 */
export default function HeroIntro() {
  return (
    <div className="hero-intro group/intro flex items-center gap-[clamp(16px,2.4vw,28px)]">
      <div
        aria-hidden="true"
        className="hero-intro-portrait relative aspect-[124/100] w-[clamp(106px,11vw,152px)] shrink-0 text-cta-base"
      >
        <PortraitArt wave className="h-full w-full" />
      </div>

      <div className="min-w-0">
        <p
          className="hero-intro-line font-display text-[clamp(26px,2.6vw,34px)] font-bold leading-[1.1] tracking-[-0.02em] text-text-primary"
          style={{ animationDelay: "120ms" }}
        >
          Sanket Sugaonkar
        </p>
        <p
          className="hero-intro-line mt-[10px] font-mono text-[13px] uppercase leading-[1.7] tracking-[0.06em] text-text-secondary md:text-[15px]"
          style={{ animationDelay: "220ms" }}
        >
          Product designer <span aria-hidden="true">·</span> Fintech
        </p>
        <p
          className="hero-intro-line font-mono text-[13px] uppercase leading-[1.7] tracking-[0.06em] text-text-secondary md:text-[15px]"
          style={{ animationDelay: "320ms" }}
        >
          Based in Pune, India
        </p>
      </div>
    </div>
  );
}
