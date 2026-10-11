"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { PALETTES, buildPattern } from "@/lib/tifo-grid";
import type { TifoScene } from "@/lib/tifo-scene";
import TifoPlayers from "@/components/tifo-players";

// A Real Madrid take on Tifoista (pranshuagarwal.com/side-projects/tifoista):
// a 3D stand at night where every fan lifts a card to spell HALA MADRID,
// then the wave goes round, again and again, while the last starting XI
// stands on the pitch facing the fans. Sits inside a regular section, like
// the bookshelf: the heading lives on the About page, this is the stage.
// three.js is loaded on demand, the first time the stand nears the screen.

const NAVY = "#102032";

export default function MadridTifo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TifoScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState("Hold your card up");

  // Load three.js + build the scene once the stand is near the viewport.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let disposed = false;
    let played = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const near = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        try {
          const [{ createTifoScene }] = await Promise.all([import("@/lib/tifo-scene"), document.fonts.ready]);
          if (disposed) return;
          const scene = createTifoScene(canvas, reduced, (beat) => {
            setStatus(
              beat === "reveal" ? "Cards up in 3, 2, 1…" : beat === "wave" ? "Here comes the wave" : "Cards down… and again"
            );
            if (beat !== "lower") setTimeout(() => setStatus("Hala Madrid y nada más"), beat === "reveal" ? 3800 : 2400);
          });
          sceneRef.current = scene;
          scene.setPattern(buildPattern("HALA", "MADRID", PALETTES[0]), PALETTES[0].band);
          ro = new ResizeObserver(() => scene.resize(stage.clientWidth, stage.clientHeight));
          ro.observe(stage);
          scene.resize(stage.clientWidth, stage.clientHeight);
          setReady(true);

          io = new IntersectionObserver(
            ([e]) => {
              scene.setInView(e.isIntersecting);
              if (e.isIntersecting && !played) {
                played = true;
                setTimeout(() => (reduced ? scene.showFinal() : scene.play()), 900);
              }
            },
            { threshold: 0.35 }
          );
          io.observe(stage);
        } catch {
          setFailed(true);
        }
      },
      { rootMargin: "400px" }
    );
    near.observe(stage);

    return () => {
      disposed = true;
      near.disconnect();
      ro?.disconnect();
      io?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    sceneRef.current?.pointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
  };

  return (
    <div className="relative overflow-hidden rounded-[20px] text-[#F8F8F7]" style={{ background: NAVY }}>
      {/* Live status, floating over the top of the stadium */}
      <div className="pointer-events-none absolute inset-x-0 top-[16px] z-10 flex justify-center">
        <p className="rounded-full bg-black/35 px-[14px] py-[6px] backdrop-blur-sm">
          <span
            aria-live="polite"
            className="tifo-shine font-body text-[14px] font-semibold whitespace-nowrap tracking-[0.02em] text-[#D8CF93]"
            data-label={status}
          >
            {status}
          </span>
        </p>
      </div>

      {/* Stadium */}
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => sceneRef.current?.pointer(0, 0)}
        className="relative aspect-[16/9] w-full max-[600px]:aspect-[4/3]"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A stadium stand at night where the crowd holds up cards that spell HALA MADRID, while Real Madrid's starting eleven stand on the pitch facing the fans"
          className={cx("absolute inset-0 h-full w-full transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        />
        {ready && <TifoPlayers />}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] tracking-[0.2em] text-white/40 uppercase">
            {failed ? "The stand couldn't load here" : "Filling the stand…"}
          </div>
        )}
      </div>
    </div>
  );
}
