import PhotoDrum from "@/components/photo-drum";

// Lorem Picsum photos are randomly selected per seed, not actually of the
// place the seed names — so the alt text below is deliberately generic
// rather than claiming false content ("a street in Kolkata" etc). Replace
// both the files and this alt text once real photos are in.
const PHOTOS = [
  { src: "/photos/kolkata.jpg", alt: "Placeholder photograph, seed: kolkata" },
  { src: "/photos/dusk.jpg", alt: "Placeholder photograph, seed: dusk" },
  { src: "/photos/blossom.jpg", alt: "Placeholder photograph, seed: blossom" },
  { src: "/photos/alps.jpg", alt: "Placeholder photograph, seed: alps" },
  { src: "/photos/street.jpg", alt: "Placeholder photograph, seed: street" },
  { src: "/photos/coast.jpg", alt: "Placeholder photograph, seed: coast" },
  { src: "/photos/forest.jpg", alt: "Placeholder photograph, seed: forest" },
  { src: "/photos/harbour.jpg", alt: "Placeholder photograph, seed: harbour" },
];

export default function PhotoDrumStyleguidePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10 flex flex-col gap-2 border-b border-line-subtle pb-8">
        <p className="text-caption font-mono uppercase tracking-wide text-text-muted">
          Component styleguide
        </p>
        <h1 className="text-h1 font-display font-semibold text-text-primary">Photo drum</h1>
        <p className="max-w-2xl text-body text-text-secondary">
          A vertical photo column with a screen-fixed drum warp and a slow upward drift. The
          warp is fixed to this viewport — the middle third is flat, only the top and bottom
          zones bend. Hover to pause; it also pauses when scrolled offscreen or when the tab is
          hidden.
        </p>
      </header>

      <div className="grid grid-cols-1 items-stretch gap-10 min-[900px]:grid-cols-2">
        <div className="h-[640px]">
          <PhotoDrum photos={PHOTOS} />
        </div>

        <div className="flex flex-col justify-center gap-4">
          <h2 className="text-h2 font-display font-semibold text-text-primary">
            Placeholder text block
          </h2>
          <p className="text-body leading-relaxed text-text-secondary">
            This column exists to demonstrate the drum sitting beside a real text block in a
            two-column layout, per spec — it isn&apos;t final copy for any real section. The
            drum column above has an explicit height (640px) so the canvas has a definite size to
            work with; in a real layout it would take its height from whatever the surrounding
            section establishes.
          </p>
          <p className="text-body leading-relaxed text-text-secondary">
            Try resizing the window: the offscreen strip and both warp lookup tables rebuild on
            every resize, and the scroll position resets so nothing samples out of bounds
            mid-transition.
          </p>
        </div>
      </div>
    </main>
  );
}
