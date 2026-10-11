"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

// ---------------------------------------------------------------------------
// Photo drum — a vertical photo column with a screen-fixed "drum" warp and
// a slow upward drift, rendered by row-slicing an offscreen canvas.
//
// The warp is a property of the VIEWPORT (the visible canvas), not of any
// individual photo: every device-pixel row of the canvas has a fixed
// width-scale and source-row-offset, precomputed once per resize. Photos
// drift past through that fixed field, so a photo bends only while it's
// passing through the top/bottom zones and is flat in the middle — exactly
// the opposite of tilting a card with rotateX, which bends the whole card
// uniformly and can't produce a partial, position-in-viewport-dependent
// bend.
// ---------------------------------------------------------------------------

export interface PhotoDrumPhoto {
  src: string;
  alt: string;
}

export interface PhotoDrumProps {
  photos: PhotoDrumPhoto[];
  /** CSS pixels per second. */
  speed?: number;
  /** Photo width as a fraction of the canvas width. Default 0.72. */
  photoWidthRatio?: number;
  /** Ratio used instead when the container is narrower than 500px (phones),
   *  where photoWidthRatio alone would make the photos tiny. */
  narrowPhotoWidthRatio?: number;
  className?: string;
}

const DEFAULT_PHOTO_WIDTH_RATIO = 0.72; // photos sit at 72% of canvas width
const PHOTO_ASPECT = 4 / 3;
const GAP_CSS = 18;
const CORNER_RADIUS_CSS = 10; // outer (mat) corner radius
const FRAME_BORDER_CSS = 6; // cream mat around each photo, polaroid-style
// Canvas can't read CSS custom properties, so this mirrors bg/surface
// (#FDFAF7 in tokens.js) directly. Keep the two in sync by hand.
const FRAME_FILL = "#FDFAF7";
const MAX_DPR = 2;

const TOP_ZONE_END = 0.24;
const BOTTOM_ZONE_START = 0.7;

function warpF(t: number): number {
  if (t < TOP_ZONE_END) {
    const d = (TOP_ZONE_END - t) / TOP_ZONE_END;
    return d * d;
  }
  if (t > BOTTOM_ZONE_START) {
    const d = (t - BOTTOM_ZONE_START) / (1 - BOTTOM_ZONE_START);
    return d * d;
  }
  return 0;
}

interface WarpTables {
  widthScale: Float32Array;
  sourceOffset: Float32Array;
}

function buildWarpTables(heightDevice: number): WarpTables {
  const widthScale = new Float32Array(heightDevice);
  const sourceOffset = new Float32Array(heightDevice);
  const denom = Math.max(1, heightDevice - 1);

  for (let row = 0; row < heightDevice; row++) {
    const t = row / denom;
    widthScale[row] = 1 + 0.3 * warpF(t);
  }

  // Accumulate outward from the vertical centre in both directions. In the
  // top/bottom zones each output row advances the source pointer by more
  // than one pixel, which is what compresses those zones vertically while
  // widthScale simultaneously widens them — the drum bulge.
  const center = Math.floor(heightDevice / 2);
  sourceOffset[center] = 0;
  for (let row = center + 1; row < heightDevice; row++) {
    const t = row / denom;
    sourceOffset[row] = sourceOffset[row - 1] + (1 + 0.75 * warpF(t));
  }
  for (let row = center - 1; row >= 0; row--) {
    const t = row / denom;
    sourceOffset[row] = sourceOffset[row + 1] - (1 + 0.75 * warpF(t));
  }

  return { widthScale, sourceOffset };
}

function drawCoverRounded(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(dx, dy, dw, dh, radius);
  } else {
    // Manual rounded-rect path for engines without CanvasRenderingContext2D.roundRect.
    const r = Math.min(radius, dw / 2, dh / 2);
    ctx.moveTo(dx + r, dy);
    ctx.arcTo(dx + dw, dy, dx + dw, dy + dh, r);
    ctx.arcTo(dx + dw, dy + dh, dx, dy + dh, r);
    ctx.arcTo(dx, dy + dh, dx, dy, r);
    ctx.arcTo(dx, dy, dx + dw, dy, r);
  }
  ctx.clip();

  const targetAspect = dw / dh;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  let sx: number, sy: number, sw: number, sh: number;
  if (imgAspect > targetAspect) {
    sh = img.naturalHeight;
    sw = sh * targetAspect;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / targetAspect;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

/** A photo with a cream mat/border around it, polaroid-style — the mat
 * fills the full dw×dh box; the photo itself is inset by `border`. */
function drawFramedPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  outerRadius: number,
  border: number,
  innerRadius: number
) {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(dx, dy, dw, dh, outerRadius);
  } else {
    const r = Math.min(outerRadius, dw / 2, dh / 2);
    ctx.moveTo(dx + r, dy);
    ctx.arcTo(dx + dw, dy, dx + dw, dy + dh, r);
    ctx.arcTo(dx + dw, dy + dh, dx, dy + dh, r);
    ctx.arcTo(dx, dy + dh, dx, dy, r);
    ctx.arcTo(dx, dy, dx + dw, dy, r);
  }
  ctx.fillStyle = FRAME_FILL;
  ctx.fill();
  ctx.restore();

  drawCoverRounded(
    ctx,
    img,
    dx + border,
    dy + border,
    dw - border * 2,
    dh - border * 2,
    innerRadius
  );
}

type Status = "loading" | "ready" | "failed";

export default function PhotoDrum({
  photos,
  speed = 40,
  photoWidthRatio: wideRatio = DEFAULT_PHOTO_WIDTH_RATIO,
  narrowPhotoWidthRatio,
  className,
}: PhotoDrumProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const stripRef = useRef<HTMLCanvasElement | null>(null);
  const tablesRef = useRef<WarpTables | null>(null);
  const scrollRef = useRef(0);
  const dimsRef = useRef({
    canvasWDevice: 0,
    canvasHDevice: 0,
    photoWDevice: 0,
    photoHDevice: 0,
    slotHDevice: 0,
    setHDevice: 0,
  });
  const rafRef = useRef<number | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  // Pause conditions, tracked in refs so the single rAF loop never needs
  // restarting just because one of them toggled.
  const hoveredRef = useRef(false);
  const intersectingRef = useRef(true);
  const pageHiddenRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const [status, setStatus] = useState<Status>("loading");

  const ratioFor = useCallback(
    (containerWidth: number) =>
      narrowPhotoWidthRatio !== undefined && containerWidth < 500 ? narrowPhotoWidthRatio : wideRatio,
    [narrowPhotoWidthRatio, wideRatio]
  );

  // ---- load + decode every image ----
  useEffect(() => {
    let cancelled = false;

    const canvasSupported =
      typeof document !== "undefined" && !!document.createElement("canvas").getContext;
    if (!canvasSupported) {
      // Deferred rather than an immediate setState in the effect body —
      // keeps this on the same "resolves asynchronously" footing as the
      // decode-failure path below, and avoids a synchronous cascading
      // render straight out of the effect.
      Promise.resolve().then(() => {
        if (!cancelled) setStatus("failed");
      });
      return () => {
        cancelled = true;
      };
    }

    const loaded: HTMLImageElement[] = [];
    Promise.all(
      photos.map((photo) => {
        // Same-origin, per spec — no crossOrigin attribute. Setting one
        // would opt this same-origin request into CORS mode and could
        // fail if the dev/prod server doesn't happen to echo back CORS
        // headers for it.
        const img = new Image();
        img.src = photo.src;
        return img
          .decode()
          .then(() => {
            loaded.push(img);
          });
      })
    )
      .then(() => {
        if (cancelled) return;
        // Preserve the original photo order (Promise.all resolves in
        // order, but push() above is still per-photo-index anyway).
        imagesRef.current = photos.map((_, i) => loaded[i]).filter(Boolean);
        if (imagesRef.current.length !== photos.length) {
          setStatus("failed");
          return;
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- reduced motion ----
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ---- document visibility ----
  useEffect(() => {
    const onVisibility = () => {
      pageHiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // ---- pointer hover ----
  // The container is wider than the photos themselves (photoWidthRatio
  // leaves margin on either side), so pause only while the pointer is over
  // the drawn photo band, not that empty margin.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const photoW = rect.width * ratioFor(rect.width);
      const margin = (rect.width - photoW) / 2;
      hoveredRef.current = localX >= margin && localX <= rect.width - margin;
    };
    const onLeave = () => {
      hoveredRef.current = false;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [status, ratioFor]);

  // ---- offscreen ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        intersectingRef.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);

  // ---- build the strip + warp tables for the current size ----
  const rebuildForSize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const cssW = container.clientWidth;
    const cssH = container.clientHeight;
    if (cssW <= 0 || cssH <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const canvasWDevice = Math.round(cssW * dpr);
    const canvasHDevice = Math.round(cssH * dpr);
    const photoWDevice = Math.round(canvasWDevice * ratioFor(cssW));
    const photoHDevice = Math.round(photoWDevice / PHOTO_ASPECT);
    const gapDevice = Math.round(GAP_CSS * dpr);
    const slotHDevice = photoHDevice + gapDevice;
    const outerRadiusDevice = CORNER_RADIUS_CSS * dpr;
    const borderDevice = FRAME_BORDER_CSS * dpr;
    const innerRadiusDevice = Math.max(0, outerRadiusDevice - borderDevice);
    const images = imagesRef.current;
    const setHDevice = slotHDevice * images.length;

    canvas.width = canvasWDevice;
    canvas.height = canvasHDevice;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStatus("failed");
      return;
    }

    const strip = stripRef.current ?? document.createElement("canvas");
    stripRef.current = strip;
    strip.width = photoWDevice;
    strip.height = setHDevice * 3;
    const stripCtx = strip.getContext("2d");
    if (!stripCtx) {
      setStatus("failed");
      return;
    }

    stripCtx.clearRect(0, 0, strip.width, strip.height);
    for (let setIndex = 0; setIndex < 3; setIndex++) {
      images.forEach((img, i) => {
        const y = setIndex * setHDevice + i * slotHDevice;
        drawFramedPhoto(
          stripCtx,
          img,
          0,
          y,
          photoWDevice,
          photoHDevice,
          outerRadiusDevice,
          borderDevice,
          innerRadiusDevice
        );
      });
    }

    dimsRef.current = {
      canvasWDevice,
      canvasHDevice,
      photoWDevice,
      photoHDevice,
      slotHDevice,
      setHDevice,
    };
    tablesRef.current = buildWarpTables(canvasHDevice);
    scrollRef.current = 0;
  }, [ratioFor]);

  // ---- (re)build on ready + on resize ----
  useEffect(() => {
    if (status !== "ready") return;
    rebuildForSize();

    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      if (resizeRafRef.current !== null) cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => rebuildForSize());
    });
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (resizeRafRef.current !== null) cancelAnimationFrame(resizeRafRef.current);
    };
  }, [status, rebuildForSize]);

  // ---- draw one frame ----
  const drawFrame = () => {
    const canvas = canvasRef.current;
    const strip = stripRef.current;
    const tables = tablesRef.current;
    if (!canvas || !strip || !tables) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { canvasWDevice, canvasHDevice, photoWDevice, setHDevice } = dimsRef.current;
    if (canvasWDevice <= 0 || canvasHDevice <= 0 || setHDevice <= 0) return;

    const { widthScale, sourceOffset } = tables;
    const scroll = scrollRef.current;
    const middleBase = setHDevice; // start of the middle (index 1) set
    const maxSrcY = strip.height - 1;

    ctx.clearRect(0, 0, canvasWDevice, canvasHDevice);
    for (let row = 0; row < canvasHDevice; row++) {
      let srcY = middleBase + scroll + sourceOffset[row];
      if (srcY < 0) srcY = 0;
      if (srcY > maxSrcY) srcY = maxSrcY;
      const destW = photoWDevice * widthScale[row];
      const destX = (canvasWDevice - destW) / 2;
      ctx.drawImage(strip, 0, srcY, photoWDevice, 1, destX, row, destW, 1);
    }
  };

  // ---- the single rAF loop ----
  useEffect(() => {
    if (status !== "ready") return;

    const speedDevicePerSecond = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      return speed * dpr;
    };

    const tick = (now: number) => {
      const last = lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      const dt = last === null ? 0 : (now - last) / 1000;

      const paused =
        hoveredRef.current ||
        !intersectingRef.current ||
        pageHiddenRef.current ||
        reducedMotionRef.current;

      const { setHDevice } = dimsRef.current;
      if (!paused && setHDevice > 0) {
        scrollRef.current = (scrollRef.current + speedDevicePerSecond() * dt) % setHDevice;
      }

      drawFrame();
      rafRef.current = requestAnimationFrame(tick);
    };

    lastFrameTimeRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [status, speed]);

  const showCanvas = status === "ready";
  // Visible whenever canvas isn't actively driving the display — covers
  // both the true failure case and the brief window before images finish
  // decoding (including the very first paint, server-rendered before any
  // effect has run), so there's never a blank gap where neither canvas nor
  // a static column is showing anything.
  const showStaticList = !showCanvas;

  return (
    <div ref={containerRef} className={cx("relative h-full w-full", className)}>
      {showCanvas && <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />}

      {/* Real <img> elements carry the content for screen readers. Visible
          as a static column whenever canvas isn't active (see
          showStaticList above); sr-only once canvas takes over. */}
      <ul
        className={cx(
          "flex flex-col",
          showStaticList ? "h-full w-full gap-[18px] overflow-y-auto" : "sr-only"
        )}
      >
        {photos.map((photo) => (
          <li key={photo.src}>
            {/* eslint-disable-next-line @next/next/no-img-element -- this list is normally sr-only and only becomes visible as the static fallback; next/image isn't the right fit for either case */}
            <img
              src={photo.src}
              alt={photo.alt}
              className={
                showStaticList
                  ? "aspect-[4/3] w-[72%] rounded-[10px] border-[6px] border-bg-surface bg-bg-surface object-cover"
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
