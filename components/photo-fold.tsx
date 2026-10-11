"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cx } from "@/lib/cx";

export interface PhotoFoldPhoto {
  src: string;
  alt: string;
}

export interface PhotoFoldProps {
  photos: PhotoFoldPhoto[];
  /** Time each photo stays flat/centered before the drum advances. */
  intervalMs?: number;
  className?: string;
}

// Recreates the "museum stage" photo drum from adityaaa.com: a 3-plane CSS
// 3D fold rather than a canvas warp. Ratios and the 70deg fold angle were
// measured directly off the live site's computed styles (matrix3d decompose
// on .fold elements: top/bottom planes are rotateX(+-70deg), hinged at the
// shared edge with the flat center plane; band heights were 156/208/156px,
// i.e. a 0.3 / 0.4 / 0.3 split of the stage height).
const TOP_RATIO = 0.3;
const MID_RATIO = 0.4;
const BOTTOM_RATIO = 0.3;
const FOLD_ANGLE_DEG = 70;
// The reference's perspective (600px) was tuned for its own ~520px-tall
// stage — copying that absolute number onto a taller container swings the
// folded panels' far edges too close to the camera, over-magnifying and
// blurring them. Keep the same perspective-to-stage-height ratio instead so
// the fold reads identically at any container size.
const PERSPECTIVE_RATIO = 600 / 520;
const TRANSITION_MS = 900;

export default function PhotoFold({ photos, intervalMs = 2600, className }: PhotoFoldProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [perspectivePx, setPerspectivePx] = useState(600);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setPerspectivePx(el.clientHeight * PERSPECTIVE_RATIO);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || photos.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => i + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, intervalMs, photos.length]);

  if (photos.length === 0) return null;

  // Exactly three planes are ever visible (top-folded, flat, bottom-folded),
  // matching the reference markup. A fourth is pre-mounted just below the
  // stage, fully folded and transparent, so it can fade into the bottom
  // slot on the next tick instead of popping in.
  const slots = [index - 1, index, index + 1, index + 2].map((pos) => {
    const offset = pos - index;
    const photo = photos[((pos % photos.length) + photos.length) % photos.length];

    if (offset === -1) {
      return {
        key: pos,
        photo,
        angle: -FOLD_ANGLE_DEG,
        top: 0,
        height: TOP_RATIO,
        origin: "center bottom",
        z: 1,
        opacity: 1,
      };
    }
    if (offset === 0) {
      return {
        key: pos,
        photo,
        angle: 0,
        top: TOP_RATIO,
        height: MID_RATIO,
        origin: "center center",
        z: 3,
        opacity: 1,
      };
    }
    // offset === 1 (visible bottom fold) and offset === 2 (pre-mounted, invisible)
    // share the same transform — only opacity differs — so the fade-in has
    // no accompanying rotation jump.
    return {
      key: pos,
      photo,
      angle: FOLD_ANGLE_DEG,
      top: TOP_RATIO + MID_RATIO,
      height: BOTTOM_RATIO,
      origin: "center top",
      z: offset === 1 ? 2 : 0,
      opacity: offset === 1 ? 1 : 0,
    };
  });

  return (
    <div
      ref={containerRef}
      className={cx("relative h-full w-full overflow-hidden", className)}
      style={{ perspective: `${perspectivePx}px` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {slots.map((slot) => (
          <div
            key={slot.key}
            className="absolute inset-x-0 overflow-hidden"
            style={{
              top: `${slot.top * 100}%`,
              height: `${slot.height * 100}%`,
              transform: `rotateX(${slot.angle}deg)`,
              transformOrigin: slot.origin,
              transition: reducedMotion
                ? "none"
                : `transform ${TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1), opacity ${TRANSITION_MS}ms ease`,
              zIndex: slot.z,
              opacity: slot.opacity,
              backfaceVisibility: "hidden",
            }}
          >
            <Image
              src={slot.photo.src}
              alt={slot.photo.alt}
              fill
              sizes="(min-width: 900px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
