// One hover/press treatment for every CTA on the site, so they all react the
// same way: a 2px lift, a soft shadow, and the cta/hover fill, settling back
// down with a slight press on click. Reduced-motion users keep the colour
// and shadow change but not the movement.
//
// Lives in components/ (not lib/) so Tailwind's content scan picks up the
// class names.
export const CTA_HOVER =
  "transition-[background-color,border-color,transform,translate,scale,box-shadow] duration-200 ease-out " +
  "hover:-translate-y-[2px] hover:shadow-[0px_8px_20px_rgba(0,0,0,0.18)] " +
  "active:translate-y-0 active:scale-[0.98] " +
  "motion-reduce:transition-[background-color,border-color,box-shadow] motion-reduce:hover:translate-y-0";

const FOCUS_RING =
  "outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2";

// Every button-style link on the site is a full pill. Use these instead of
// hand-rolling a radius so square and round corners can't creep back in.
export const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-cta-base px-[24px] py-[14px] text-[17px] font-body font-medium text-cta-text " +
  "hover:bg-cta-hover " +
  CTA_HOVER +
  " " +
  FOCUS_RING;

export const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-transparent px-[24px] py-[14px] text-[17px] font-body font-medium text-text-primary " +
  "hover:border-text-primary hover:bg-bg-canvas " +
  CTA_HOVER +
  " " +
  FOCUS_RING;
