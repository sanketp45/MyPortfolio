"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { GITHUB_URL, LINKEDIN_URL, MAILTO, MEDIUM_URL, RESUME_URL } from "@/lib/site-links";

// ---------------------------------------------------------------------------
// Spotify embed
// ---------------------------------------------------------------------------

// Swap the track here — nothing else in the component needs to change.
const TRACK_ID = "4y1KR84zpSoU0aVOdiAGIT";
const TRACK_NAME = "Jai Jai Ram";
const TRACK_ARTIST = "A.R. Rahman";

// If this project ever gets a Content Security Policy, frame-src must
// include https://open.spotify.com or this embed silently stops rendering
// (no console error a future reader would necessarily connect to a CSP
// change made elsewhere).

type EmbedStatus = "pending" | "mounted" | "loaded" | "failed";

function SpotifyEmbed() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<EmbedStatus>("pending");

  // Mount the iframe only once the embed is within 200px of the viewport.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStatus((s) => (s === "pending" ? "mounted" : s));
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Once mounted, give it 6s to fire onLoad before treating it as failed
  // (third-party cookie / tracker blocking won't always fire onError).
  useEffect(() => {
    if (status !== "mounted") return;
    const timer = setTimeout(() => {
      setStatus((s) => (s === "mounted" ? "failed" : s));
    }, 6000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div
      ref={wrapperRef}
      className="relative h-[152px] max-w-[440px] overflow-hidden rounded-[12px] bg-line-subtle"
    >
      {/* Backing card under the player, so the block never reads as empty
          while Spotify's iframe is still painting (or if it never does). */}
      {status !== "failed" && (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-center gap-[4px] px-[20px]">
          <span className="font-display text-[18px] font-bold text-text-primary">{TRACK_NAME}</span>
          <span className="font-body text-small text-text-primary">{TRACK_ARTIST}</span>
        </div>
      )}
      {(status === "mounted" || status === "loaded") && (
        <iframe
          src={`https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator`}
          width="100%"
          height="152"
          style={{ border: 0 }}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Now on repeat: ${TRACK_NAME} by ${TRACK_ARTIST}`}
          className="relative"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
        />
      )}

      {status === "failed" && (
        <Link
          href={`https://open.spotify.com/track/${TRACK_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            "flex h-full w-full items-center justify-center rounded-[12px] bg-line-subtle px-4 text-center outline-none",
            "text-small text-text-primary underline underline-offset-4",
            "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2"
          )}
        >
          Listening to {TRACK_NAME} by {TRACK_ARTIST} on Spotify
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link lists
// ---------------------------------------------------------------------------

interface FooterLink {
  label: string;
  href: string;
  newTab?: boolean;
}

// Contact opens the visitor's mail app; there's no /contact page.
const NAV_LINKS: FooterLink[] = [
  { label: "Recent work", href: "/#work-timeline-heading" },
  { label: "Fun stuff", href: "/play" },
  { label: "About me", href: "/about" },
  { label: "Contact", href: MAILTO },
];

const EXTERNAL_LINKS: FooterLink[] = [
  { label: "LinkedIn", href: LINKEDIN_URL, newTab: true },
  { label: "GitHub", href: GITHUB_URL, newTab: true },
  { label: "Resume", href: RESUME_URL, newTab: true },
  { label: "Medium", href: MEDIUM_URL, newTab: true },
];

const LINK_BASE =
  "text-h2 font-body outline-none underline-offset-4 " +
  "transition-[color,text-decoration-color] duration-150 motion-reduce:transition-none " +
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent-base focus-visible:outline-offset-2";

function FooterLinkList({
  links,
  ariaLabel,
  currentPathname,
}: {
  links: FooterLink[];
  ariaLabel: string;
  currentPathname?: string;
}) {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex list-none flex-col gap-4">
        {links.map((link) => {
          const isCurrent = currentPathname !== undefined && currentPathname === link.href;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                aria-current={isCurrent ? "page" : undefined}
                className={cx(
                  LINK_BASE,
                  isCurrent
                    ? "font-medium text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:underline"
                )}
              >
                {link.label}
                {link.newTab && <span className="sr-only"> (opens in a new tab)</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const COLUMN_HEADING =
  "mb-[28px] font-display font-bold text-accent-base";
const COLUMN_HEADING_STYLE = {
  fontSize: "clamp(28px, 3vw, 40px)",
  letterSpacing: "-0.02em",
} as const;

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer>
      <Panel className="mb-5 mt-5 bg-bg-surface">
        <div
          className={cx(
            // No explicit grid gap was given — inferred a moderate,
            // explicit value rather than relying on Tailwind's default
            // (un-overridden) numeric scale, to keep it unambiguous.
            "grid grid-cols-1 gap-x-[32px] gap-y-[48px] p-[clamp(28px,4vw,56px)]",
            "min-[560px]:grid-cols-2",
            "min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)]"
          )}
        >
          {/* Spotify block */}
          <div className="col-span-1 min-[560px]:col-span-2 min-[1000px]:col-span-1">
            <h2 className={COLUMN_HEADING} style={COLUMN_HEADING_STYLE}>
              On repeat
            </h2>
            <SpotifyEmbed />
          </div>

          {/* Spacer — column 2 in the 4-column desktop grid only */}
          <div aria-hidden="true" className="hidden min-[1000px]:block" />

          <div>
            <h2 className={COLUMN_HEADING} style={COLUMN_HEADING_STYLE}>
              Navigation
            </h2>
            <FooterLinkList
              links={NAV_LINKS}
              ariaLabel="Footer navigation"
              currentPathname={pathname}
            />
          </div>

          <div>
            <h2 className={COLUMN_HEADING} style={COLUMN_HEADING_STYLE}>
              Links
            </h2>
            <FooterLinkList links={EXTERNAL_LINKS} ariaLabel="External links" />
          </div>
        </div>
      </Panel>
    </footer>
  );
}
