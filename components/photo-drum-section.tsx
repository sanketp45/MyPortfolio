import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import PhotoDrum from "@/components/photo-drum";
import { SectionHeading, SECTION_PAD } from "@/components/section-heading";

// Sanket's own photos, resized for the web from the originals in
// public/photos ("image.png", "image copy*.png").
const PHOTOS = [
  {
    src: "/photos/away-beyond-tools.jpg",
    alt: "A copy of Beyond Tools by Amit Das, held up at a desk next to a laptop",
  },
  { src: "/photos/away-sunset-lake.jpg", alt: "Sunset over a still lake, with hills on the horizon" },
  { src: "/photos/away-kindle-lake.jpg", alt: "Reading on a Kindle on the rocks beside a mountain lake" },
  { src: "/photos/away-field-sky.jpg", alt: "A wide, cloudy sky over an open field" },
];

// Wrapped in the same inset panel as About/Writing for visual consistency
// with the rest of the homepage. Images sit in the second (7fr, right) grid
// column and text in the first (5fr, left).
//
// Canvas-warp PhotoDrum (continuous drift + drum-warp), matching the
// reference screen recording. A CSS 3D "fold" recreation of adityaaa.com's
// photo section was tried and set aside — that was a discrete flip effect,
// not the continuous drift the reference video actually shows.
export default function PhotoDrumSection() {
  return (
    <section aria-labelledby="elsewhere-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className="grid grid-cols-1 items-stretch gap-8 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className={cx("flex flex-col justify-center", SECTION_PAD)}>
            <SectionHeading
              id="elsewhere-heading"
              eyebrow="Away from the desk"
              title="A book, a lake, and a lot of sky."
              subtitle={
                <>
                  When I step away from Figma, I&apos;m usually reading, on paper or on a Kindle, or
                  somewhere outside with nothing to do but look. It&apos;s where ideas slow down
                  enough to make sense, and most of them find their way back into the work.
                </>
              }
            />
          </div>

          {/* No padding here on purpose — photos should touch the panel's
              top and bottom edge directly (drifting in from/out past the
              card border), unlike the padded text column. */}
          <div className={cx("h-[360px] min-[900px]:h-[520px]")}>
            {/* Keyed by the photo list: the drum loads and decodes its photos
                once on mount, so a changed list needs a fresh mount (this
                matters during development, where hot reload keeps the old
                instance alive). */}
            <PhotoDrum
              key={PHOTOS.map((photo) => photo.src).join("|")}
              photos={PHOTOS}
              photoWidthRatio={0.28}
              narrowPhotoWidthRatio={0.62}
              speed={48}
            />
          </div>
        </div>
      </Panel>
    </section>
  );
}
