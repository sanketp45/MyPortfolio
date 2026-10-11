"use client";

import type { CSSProperties, ReactNode } from "react";

// The starting XI as flat vector illustrations, seen from behind, standing
// on the pitch facing the tifo. Drawn over the stadium canvas. Flat colour
// with a two-tone shadow on the right-hand side, after the illustrated
// footballer posters the design was based on.
//
// Last starting line-up: Atlético 2–1 Real Madrid, LaLiga, 20 Sep 2026.

type Pose = "shirt" | "armsOut" | "armsUp" | "applaud";
type Hair = "buzz" | "top" | "swept" | "curly" | "long";

interface Player {
  name: string;
  n: number;
  pose: Pose;
  skin: string;
  hair: string;
  hairStyle: Hair;
  boots: string;
  gk?: boolean;
}

const XI: Player[] = [
  { name: "COURTOIS", n: 1, pose: "armsUp", skin: "#E9BE9C", hair: "#3A2617", hairStyle: "swept", boots: "#1C1C1C", gk: true },
  { name: "DUMFRIES", n: 24, pose: "applaud", skin: "#7E5136", hair: "#141414", hairStyle: "buzz", boots: "#F2F2F2" },
  { name: "KONATÉ", n: 16, pose: "armsUp", skin: "#5E3B27", hair: "#141414", hairStyle: "buzz", boots: "#FF6B3D" },
  { name: "HUIJSEN", n: 4, pose: "applaud", skin: "#EDC4A2", hair: "#7A5532", hairStyle: "swept", boots: "#1C1C1C" },
  { name: "CUCURELLA", n: 17, pose: "applaud", skin: "#E3B08A", hair: "#3D2A1C", hairStyle: "long", boots: "#E9F542" },
  { name: "BELLINGHAM", n: 5, pose: "armsOut", skin: "#A8704C", hair: "#141414", hairStyle: "top", boots: "#E9F542" },
  { name: "TCHOUAMÉNI", n: 14, pose: "applaud", skin: "#5E3B27", hair: "#141414", hairStyle: "buzz", boots: "#F2F2F2" },
  { name: "VALVERDE", n: 8, pose: "armsUp", skin: "#E3B08A", hair: "#2B1D14", hairStyle: "swept", boots: "#1C1C1C" },
  { name: "ARDA GÜLER", n: 15, pose: "armsUp", skin: "#E3B08A", hair: "#1B1410", hairStyle: "swept", boots: "#FF6B3D" },
  { name: "VINI JR.", n: 7, pose: "armsUp", skin: "#7E5136", hair: "#141414", hairStyle: "curly", boots: "#E9F542" },
  { name: "MBAPPÉ", n: 10, pose: "applaud", skin: "#8A5A3C", hair: "#141414", hairStyle: "buzz", boots: "#F2F2F2" },
];

const KIT = { base: "#F7F7F4", shade: "#DADDE3", trim: "#1B2A4A", accent: "#C9A227", ink: "#1B2A4A" };
const GK = { base: "#2F7A64", shade: "#245E4D", trim: "#173C31", accent: "#E8D9A8", ink: "#F4F4F0" };

/** Darken a hex colour for the shadow side. */
function shade(hex: string, k = 0.82) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}

const DISPLAY: CSSProperties = { fontFamily: "var(--font-display)" };

// Body landmarks in the 120 x 260 viewBox (back view, centre x = 60).
const SH_Y = 80; // shoulder height
const SH_X = 29; // shoulder offset from centre

/** One arm as a polyline: sleeve, bare forearm, hand. Angles from straight down, + = outward. */
function Arm({ side, pose, kit, skin, phase }: { side: -1 | 1; pose: Pose; kit: typeof KIT; skin: string; phase: number }) {
  const sx = 60 + side * SH_X;
  const sy = SH_Y;
  const deg = (a: number) => (a * Math.PI) / 180;
  const at = (x: number, y: number, len: number, a: number) => [x + side * Math.sin(deg(a)) * len, y + Math.cos(deg(a)) * len] as const;

  let elbow: readonly [number, number];
  let hand: readonly [number, number];
  switch (pose) {
    case "armsOut":
      elbow = at(sx, sy, 30, 98);
      hand = at(elbow[0], elbow[1], 28, 104);
      break;
    case "armsUp":
      elbow = at(sx, sy, 30, 158);
      hand = at(elbow[0], elbow[1], 28, 172);
      break;
    case "shirt": // gripping the shirt at the shoulders, elbows high
      elbow = at(sx, sy, 30, 122);
      hand = [60 + side * 14, sy - 4];
      break;
    case "applaud": // hands together in front, so only the upper arms show
      elbow = at(sx, sy, 30, 22);
      hand = [60 + side * 20, sy + 46];
      break;
  }
  const sleeveEnd = [sx + (elbow[0] - sx) * 0.5, sy + (elbow[1] - sy) * 0.5];
  const cuff = [sx + (elbow[0] - sx) * 0.56, sy + (elbow[1] - sy) * 0.56];

  // Keep the arms moving, swung from the shoulder: arms up wave side to
  // side, applauding arms clap in and out, arms out lift and drop.
  // (In SVG a positive rotation is clockwise; -side*a turns an arm outward.)
  const MOTION: Record<Pose, { from: number; to: number; ms: number }> = {
    armsUp: { from: -16, to: 16, ms: 1100 },
    applaud: { from: -side * 8, to: side * 2, ms: 340 },
    armsOut: { from: 0, to: -side * 14, ms: 1500 },
    shirt: { from: 0, to: -side * 6, ms: 900 },
  };
  const m = MOTION[pose];
  const swing = {
    transformBox: "view-box",
    transformOrigin: `${sx}px ${sy}px`,
    "--arm-from": `${m.from}deg`,
    "--arm-to": `${m.to}deg`,
    animation: `tifo-arm ${m.ms}ms ease-in-out ${-phase * m.ms}ms infinite alternate`,
  } as CSSProperties;

  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none" className="motion-reduce:[animation:none!important]" style={swing}>
      {/* skin: upper arm below the sleeve, forearm */}
      <polyline points={`${sleeveEnd} ${elbow} ${hand}`} stroke={skin} strokeWidth="10.5" />
      <polyline points={`${elbow} ${hand}`} stroke={shade(skin, 0.88)} strokeWidth="4" strokeOpacity={side === 1 ? 0.9 : 0} transform="translate(1.5 0)" />
      {/* sleeve + cuff */}
      <line x1={sx} y1={sy} x2={sleeveEnd[0]} y2={sleeveEnd[1]} stroke={side === 1 ? kit.shade : kit.base} strokeWidth="15" />
      <line x1={sleeveEnd[0]} y1={sleeveEnd[1]} x2={cuff[0]} y2={cuff[1]} stroke={kit.trim} strokeWidth="13" strokeLinecap="butt" />
      {pose !== "applaud" && <circle cx={hand[0]} cy={hand[1]} r="6.2" fill={kit === GK ? GK.accent : skin} />}
    </g>
  );
}

// From behind you see the back of the head, so every style starts with
// hair covering it down to the nape; the style adds shape on top.
const BACK_OF_HEAD = "M44.6 50 C44 31 76 31 75.4 50 C75.2 58 70.5 64.5 60 65.5 C49.5 64.5 44.8 58 44.6 50 Z";

function HairShape({ style, color }: { style: Hair; color: string }) {
  const dark = shade(color, 0.75);
  const light = shade(color, 1.25);
  const base = (
    <>
      <path d={BACK_OF_HEAD} fill={color} />
      {/* soft highlight on the crown, shadow on the right */}
      <path d="M60 33 C68 33 75 40 75.4 50 C75.2 58 70.5 64.5 60 65.5 Z" fill={dark} opacity="0.35" />
      <ellipse cx="55" cy="40" rx="6" ry="3.5" fill={light} opacity="0.35" />
    </>
  );
  switch (style) {
    case "buzz":
      return base;
    case "top":
      return (
        <g>
          {base}
          <path d="M44 48 C42 28 78 28 76 48 C73 40 47 40 44 48 Z" fill={color} />
          <path d="M47 36 C52 27 68 27 73 36 C67 31 53 31 47 36 Z" fill={dark} />
        </g>
      );
    case "swept":
      return (
        <g>
          {base}
          <path d="M43 50 C40 30 80 27 77 50 C76 44 70 40 60 40 C50 40 45 44 43 50 Z" fill={color} />
          <path d="M50 34 C58 29 70 31 75 38 C68 35 58 34 50 34 Z" fill={dark} />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          {base}
          {[
            [48, 38], [54, 33], [60, 31], [66, 33], [72, 38], [45, 45], [75, 45], [52, 40], [60, 37], [68, 40],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" />
          ))}
        </g>
      );
    case "long":
      return (
        <g fill={color}>
          <path d="M41 50 C38 26 82 26 79 50 C80 60 76 68 72 70 L48 70 C44 68 40 60 41 50 Z" />
          {[[44, 62], [50, 67], [58, 69], [66, 68], [73, 64], [77, 56], [43, 54]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5.5" fill={i % 2 ? color : dark} />
          ))}
        </g>
      );
  }
}

function PlayerFigure({ p, phase }: { p: Player; phase: number }) {
  const kit = p.gk ? GK : KIT;
  const skinShade = shade(p.skin, 0.86);
  const behind = p.pose === "applaud";
  const arms: ReactNode = (
    <>
      <Arm side={-1} pose={p.pose} kit={kit} skin={p.skin} phase={phase} />
      <Arm side={1} pose={p.pose} kit={kit} skin={p.skin} phase={phase} />
    </>
  );
  const longName = p.name.length > 8;

  return (
    <svg viewBox="0 0 120 260" className="block h-full w-full overflow-visible" aria-hidden="true">
      {/* ground shadow */}
      <ellipse cx="60" cy="252" rx="30" ry="5" fill="#000" opacity="0.28" />

      {/* legs */}
      {[-1, 1].map((s) => {
        const x = 60 + s * 11;
        return (
          <g key={s}>
            <path d={`M${x - 7} 186 L${x + 7} 186 L${x + 6} 204 L${x - 6} 204 Z`} fill={s === 1 ? skinShade : p.skin} />
            <rect x={x - 6.5} y="202" width="13" height="40" rx="5" fill={s === 1 ? kit.shade : kit.base} />
            <rect x={x - 6.5} y="202" width="13" height="5" fill={kit.trim} />
            <path d={`M${x - 8} 240 Q${x - 8} 236 ${x - 4} 236 L${x + 5} 236 Q${x + 9} 237 ${x + 9} 243 L${x + 9} 249 L${x - 8} 249 Z`} fill={p.boots} />
            <rect x={x - 8} y="247" width="17" height="3" rx="1.5" fill={shade(p.boots, 0.6)} />
          </g>
        );
      })}

      {/* shorts */}
      <path d="M36 146 L84 146 L88 188 L63 188 L60 176 L57 188 L32 188 Z" fill={kit.base} />
      <path d="M60 146 L84 146 L88 188 L63 188 L60 176 Z" fill={kit.shade} opacity="0.55" />
      <path d="M33.5 150 L32 188" stroke={kit.trim} strokeWidth="2.5" />
      <path d="M86.5 150 L88 188" stroke={kit.trim} strokeWidth="2.5" />
      <text x="78" y="182" textAnchor="middle" fontSize="9" fontWeight="700" fill={kit.ink} style={DISPLAY}>
        {p.n}
      </text>

      {behind && arms}

      {/* shirt: tapered, shadow on the right half, side piping, collar */}
      <path d="M31 80 Q31 74 38 73 L82 73 Q89 74 89 80 L86 150 L34 150 Z" fill={kit.base} />
      <path d="M60 73 L82 73 Q89 74 89 80 L86 150 L60 150 Z" fill={kit.shade} opacity="0.5" />
      <path d="M33 86 L35 150" stroke={kit.trim} strokeWidth="2.4" />
      <path d="M33.8 86 L35.6 150" stroke={kit.accent} strokeWidth="0.9" />
      <path d="M87 86 L85 150" stroke={kit.trim} strokeWidth="2.4" />
      <path d="M86.2 86 L84.4 150" stroke={kit.accent} strokeWidth="0.9" />
      <path d="M47 73 Q60 78 73 73 L73 76.5 Q60 81.5 47 76.5 Z" fill={kit.trim} />
      <rect x="34" y="147" width="52" height="3.5" fill={kit.trim} opacity="0.85" />

      {/* name + number */}
      <text
        x="60"
        y="96"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        letterSpacing="0.4"
        fill={kit.ink}
        style={DISPLAY}
        {...(longName ? { textLength: 46, lengthAdjust: "spacingAndGlyphs" } : {})}
      >
        {p.name}
      </text>
      <text
        x="60"
        y="133"
        textAnchor="middle"
        fontSize="36"
        fontWeight="800"
        fill={kit.ink}
        stroke={kit.accent}
        strokeWidth="1.1"
        paintOrder="stroke"
        style={DISPLAY}
      >
        {p.n}
      </text>

      {/* neck, head, ears, hair */}
      <path d="M53 62 L67 62 L68 75 L52 75 Z" fill={skinShade} />
      <ellipse cx="60" cy="50" rx="15.5" ry="17" fill={p.skin} />
      <path d="M60 33 A15.5 17 0 0 1 60 67 Z" fill={skinShade} opacity="0.55" />
      <ellipse cx="44.5" cy="52" rx="3" ry="4.5" fill={p.skin} />
      <ellipse cx="75.5" cy="52" rx="3" ry="4.5" fill={skinShade} />
      <HairShape style={p.hairStyle} color={p.hair} />

      {!behind && arms}
    </svg>
  );
}

/** The line of players, each waving or applauding the fans on a loop. */
export default function TifoPlayers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[3%] bottom-[4%] flex h-[36%] items-end justify-between max-[600px]:h-[30%]"
    >
      {XI.map((p, i) => (
        <div key={p.name} className="h-full w-[8.4%]">
          <div
            className="h-full w-full origin-bottom motion-safe:animate-[tifo-breathe_2.8s_ease-in-out_infinite_alternate]"
            style={{ animationDelay: `${-i * 0.37}s` }}
          >
            {/* Staggered so they don't move in lockstep */}
            <PlayerFigure p={p} phase={(i * 0.37) % 1} />
          </div>
        </div>
      ))}
    </div>
  );
}
