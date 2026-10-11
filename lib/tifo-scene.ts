// The Tifoista-style stand, built in three.js. Loaded on demand by
// components/madrid-tifo.tsx so three.js stays out of the main bundle.
//
// Every fan is a few instanced low-poly parts (torso, head, hair, two arms,
// a card) on a seat on a concrete step. Raising the tifo animates each
// fan's arms up and flips a card over their head, in a sweep that runs
// left to right and front to back.

import * as THREE from "three";
import { BLOCKS, COLS, COLS_PER_BLOCK, ROWS, WAVE_MS, rowsInColumn } from "@/lib/tifo-grid";

const SEAT_W = 0.56;
const AISLE = 1.1;
const RISE = 0.6;
const DEPTH = 0.74;
const CURVE = 5; // how far the ends of the stand wrap forward

const SHIRTS = [
  "#F2F2EE", "#F2F2EE", "#F2F2EE", "#F2F2EE", "#E6E6E0",
  "#4B2A7B", "#4B2A7B", "#1B2A4A", "#1B2A4A", "#C9A227", "#1E1E22", "#8C929C",
];
const SKIN = ["#F2CBA8", "#E3B08A", "#CD9470", "#A8704C", "#7E5136", "#5E3B27"];
const HAIR = ["#1B1410", "#2B1D14", "#3D2A1C", "#141414", "#6B4A2E", "#C9A46A"];

const REVEAL_SWEEP = 2700;
const FLIP = 520;
// WAVE_MS is shared with the 2D player overlay so their hops line up.
const WAVE_GAP = 4200;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutBack = (p: number) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

interface Fan {
  index: number; // into the COLS * ROWS pattern
  base: THREE.Matrix4;
  u: number; // 0 left .. 1 right
  t: number; // 0 front .. 1 back
  jitter: number;
}

export interface TifoScene {
  setPattern(colours: string[], seatColour: string): void;
  play(): void;
  replay(): void;
  wave(): void;
  showFinal(): void;
  resize(width: number, height: number): void;
  setInView(inView: boolean): void;
  pointer(x: number, y: number): void;
  dispose(): void;
}

export function createTifoScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
  onBeat?: (beat: "reveal" | "wave" | "lower") => void
): TifoScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#102032");
  scene.fog = new THREE.Fog("#102032", 90, 170);

  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 260);
  const camBase = new THREE.Vector3(0, 7.4, 62);
  const lookAt = new THREE.Vector3(0, 9.6, -12);
  camera.position.copy(camBase);
  camera.lookAt(lookAt);

  scene.add(new THREE.HemisphereLight("#DCE4FF", "#20242E", 1.5));
  const key = new THREE.DirectionalLight("#FFF4E0", 1.7);
  key.position.set(-8, 30, 40);
  scene.add(key);
  const fill = new THREE.DirectionalLight("#9FB4FF", 0.45);
  fill.position.set(20, 10, 10);
  scene.add(fill);

  const disposables: { dispose(): void }[] = [];
  const mat = (color: string, extra: THREE.MeshLambertMaterialParameters = {}) => {
    const m = new THREE.MeshLambertMaterial({ color, ...extra });
    disposables.push(m);
    return m;
  };
  const geo = <G extends THREE.BufferGeometry>(g: G) => {
    disposables.push(g);
    return g;
  };

  // --- Seat positions ------------------------------------------------------
  const r = rng(14);
  const totalW = COLS * SEAT_W + (BLOCKS - 1) * AISLE;
  const colX = (col: number) => -totalW / 2 + col * SEAT_W + Math.floor(col / COLS_PER_BLOCK) * AISLE + SEAT_W / 2;
  const curveZ = (x: number) => CURVE * Math.pow(x / (totalW / 2), 2);
  const curveAngle = (x: number) => -Math.atan((2 * CURVE * x) / Math.pow(totalW / 2, 2));

  const fans: Fan[] = [];
  for (let col = 0; col < COLS; col++) {
    const x = colX(col);
    const rows = rowsInColumn(col);
    for (let row = 0; row < rows; row++) {
      const y = row * RISE;
      const z = -row * DEPTH + curveZ(x);
      const m = new THREE.Matrix4()
        .makeTranslation(x, y, z)
        .multiply(new THREE.Matrix4().makeRotationY(curveAngle(x)));
      fans.push({ index: row * COLS + col, base: m, u: col / (COLS - 1), t: row / (ROWS - 1), jitter: r() });
    }
  }
  const N = fans.length;

  // --- Instanced fan parts -------------------------------------------------
  const make = (g: THREE.BufferGeometry, m: THREE.Material) => {
    const mesh = new THREE.InstancedMesh(g, m, N);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  };
  const white = () => mat("#ffffff");

  const torsoGeo = geo(new THREE.BoxGeometry(0.38, 0.44, 0.24));
  const headGeo = geo(new THREE.SphereGeometry(0.135, 12, 9));
  const hairGeo = geo(new THREE.SphereGeometry(0.142, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5));
  const armGeo = geo(new THREE.BoxGeometry(0.1, 0.36, 0.1));
  armGeo.translate(0, -0.18, 0); // pivot at the shoulder
  const cardGeo = geo(new THREE.BoxGeometry(0.52, 0.42, 0.025));
  const seatGeo = geo(new THREE.BoxGeometry(0.46, 0.34, 0.06));

  const torso = make(torsoGeo, white());
  const head = make(headGeo, white());
  const hair = make(hairGeo, white());
  const armL = make(armGeo, white());
  const armR = make(armGeo, white());
  const card = make(cardGeo, white());
  const seat = make(seatGeo, white());

  const c = new THREE.Color();
  fans.forEach((f, i) => {
    const shirt = SHIRTS[Math.floor(r() * SHIRTS.length)];
    torso.setColorAt(i, c.set(shirt));
    armL.setColorAt(i, c.set(shirt));
    armR.setColorAt(i, c.set(shirt));
    head.setColorAt(i, c.set(SKIN[Math.floor(r() * SKIN.length)]));
    hair.setColorAt(i, c.set(HAIR[Math.floor(r() * HAIR.length)]));
    card.setColorAt(i, c.set("#ffffff"));
    seat.setColorAt(i, c.set("#2F3B5C"));
    seat.setMatrixAt(i, f.base.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.42, -0.24)));
  });
  [torso, head, hair, armL, armR, card, seat].forEach((m) => m.instanceColor && (m.instanceColor.needsUpdate = true));
  seat.instanceMatrix.needsUpdate = true;

  // --- Stand structure ---------------------------------------------------------
  const concrete = mat("#2A2F3A");
  const concreteDark = mat("#1A1E26");
  const stepGeo = geo(new THREE.BoxGeometry(SEAT_W * COLS_PER_BLOCK + 0.2, RISE, DEPTH));
  for (let b = 0; b < BLOCKS; b++) {
    const firstCol = b * COLS_PER_BLOCK;
    const midCol = firstCol + COLS_PER_BLOCK / 2;
    const cx = (colX(firstCol) + colX(firstCol + COLS_PER_BLOCK - 1)) / 2;
    const ang = curveAngle(cx);
    const rows = rowsInColumn(midCol);
    for (let row = 0; row < rows + 1; row++) {
      const step = new THREE.Mesh(stepGeo, row % 2 ? concrete : concreteDark);
      step.position.set(cx, row * RISE - RISE / 2, -row * DEPTH + curveZ(cx) - 0.1);
      step.rotation.y = ang;
      scene.add(step);
    }
    // Back wall behind the top row
    const wall = new THREE.Mesh(geo(new THREE.BoxGeometry(SEAT_W * COLS_PER_BLOCK + 1.4, 2.2, 0.4)), concreteDark);
    wall.position.set(cx, rows * RISE + 0.6, -rows * DEPTH + curveZ(cx) - 0.6);
    wall.rotation.y = ang;
    scene.add(wall);
  }
  // Front wall
  const front = new THREE.Mesh(geo(new THREE.BoxGeometry(totalW + 8, 1.4, 0.5)), concreteDark);
  front.position.set(0, -0.9, 1.0);
  scene.add(front);

  // Walkways sticking out from the side blocks
  const railMat = mat("#5B6573");
  [13, 26].forEach((row) => {
    [-1, 1].forEach((side) => {
      const x = side * (totalW / 2 - (SEAT_W * COLS_PER_BLOCK) / 2 + 2);
      const rail = new THREE.Mesh(geo(new THREE.BoxGeometry(SEAT_W * COLS_PER_BLOCK + 6, 0.18, 1.0)), railMat);
      rail.position.set(x, row * RISE + 0.1, -row * DEPTH + curveZ(x) + 0.2);
      rail.rotation.y = curveAngle(x) * 0.8;
      scene.add(rail);
    });
  });

  // --- Roof -------------------------------------------------------------------
  const roofY = ROWS * RISE + 4.6;
  const roof = new THREE.Mesh(geo(new THREE.BoxGeometry(totalW + 22, 0.7, 30)), mat("#07090D"));
  roof.position.set(0, roofY, -ROWS * DEPTH * 0.55);
  roof.rotation.x = -0.06;
  scene.add(roof);
  const fascia = new THREE.Mesh(geo(new THREE.BoxGeometry(totalW + 22, 0.55, 0.4)), mat("#1F2633"));
  fascia.position.set(0, roofY - 0.45, roof.position.z + 15);
  scene.add(fascia);
  const lightGeo = geo(new THREE.SphereGeometry(0.13, 8, 6));
  const lightMat = new THREE.MeshBasicMaterial({ color: "#FFE2A0" });
  disposables.push(lightMat);
  for (let i = 0; i < 30; i++) {
    const l = new THREE.Mesh(lightGeo, lightMat);
    l.position.set(-(totalW + 18) / 2 + (i * (totalW + 18)) / 29, roofY - 0.78, fascia.position.z + 0.1);
    scene.add(l);
  }
  // Scoreboard hanging under the front of the roof
  const board = new THREE.Mesh(geo(new THREE.BoxGeometry(11, 1.3, 0.4)), mat("#2B3A52"));
  board.position.set(0, roofY - 1.6, fascia.position.z - 0.6);
  scene.add(board);
  // Cables and struts across the underside
  const cablePts: number[] = [];
  for (let i = 0; i <= 14; i++) {
    const x0 = -(totalW + 18) / 2 + (i * (totalW + 18)) / 14;
    cablePts.push(x0, roofY - 0.5, fascia.position.z, x0 * 0.55, roofY - 0.3, roof.position.z - 14);
  }
  const cables = new THREE.LineSegments(
    geo(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(cablePts, 3))),
    new THREE.LineBasicMaterial({ color: "#5D6E88", transparent: true, opacity: 0.55 })
  );
  disposables.push(cables.material as THREE.Material);
  scene.add(cables);
  const strutMat = mat("#3A4659");
  [-0.75, -0.42, 0.42, 0.75].forEach((k) => {
    const s = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.12, 0.12, 6.5, 6)), strutMat);
    s.position.set(k * (totalW / 2), roofY - 3, fascia.position.z - 3);
    s.rotation.x = 0.55;
    scene.add(s);
  });

  // --- Pitch, LED boards, goal ---------------------------------------------
  const pitch = new THREE.Mesh(geo(new THREE.PlaneGeometry(160, 60)), mat("#2E8A42"));
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.set(0, -1.6, 30);
  scene.add(pitch);
  const lineMat = new THREE.MeshBasicMaterial({ color: "#D9F2DF" });
  disposables.push(lineMat);
  const line = (w: number, d: number, x: number, z: number) => {
    const m = new THREE.Mesh(geo(new THREE.PlaneGeometry(w, d)), lineMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, -1.58, z);
    scene.add(m);
  };
  line(150, 0.12, 0, 6.5); // goal line
  line(0.12, 9, -10, 11); // box sides
  line(0.12, 9, 10, 11);
  line(20.1, 0.12, 0, 15.5);
  const ledColours: THREE.MeshBasicMaterial[] = [];
  const boardGeo = geo(new THREE.BoxGeometry(5.6, 0.85, 0.2));
  for (let i = 0; i < 10; i++) {
    const m = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    disposables.push(m);
    ledColours.push(m);
    const b = new THREE.Mesh(boardGeo, m);
    b.position.set(-27 + i * 6, -1.15, 4.6);
    scene.add(b);
  }
  const postMat = new THREE.MeshBasicMaterial({ color: "#F2F2F2" });
  disposables.push(postMat);
  const post = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(geo(new THREE.BoxGeometry(w, h, 0.14)), postMat);
    m.position.set(x, y, 6.4);
    scene.add(m);
  };
  post(0.14, 2.4, -3.66, -0.4);
  post(0.14, 2.4, 3.66, -0.4);
  post(7.46, 0.14, 0, 0.8);

  // --- The XI, on the pitch facing the fans ---------------------------------
  // Switched off: the XI is now drawn as flat 2D illustrations over the
  // canvas (components/tifo-players.tsx). Flip this to bring the 3D
  // versions back.
  const SHOW_3D_PLAYERS = false;
  // Last starting line-up (Atlético 2–1 Real Madrid, LaLiga, 20 Sep 2026),
  // seen from behind like the reference: names and numbers on their backs.
  type Pose = "shirt" | "armsOut" | "armsUp" | "applaud";
  type Hair = "buzz" | "top" | "swept" | "curly" | "long";
  const XI: { name: string; n: number; pose: Pose; skin: string; hair: string; hairStyle: Hair; gk?: boolean }[] = [
    { name: "COURTOIS", n: 1, pose: "armsUp", skin: "#E9BE9C", hair: "#2B1D14", hairStyle: "swept", gk: true },
    { name: "DUMFRIES", n: 24, pose: "applaud", skin: "#7E5136", hair: "#141414", hairStyle: "buzz" },
    { name: "KONATÉ", n: 16, pose: "armsUp", skin: "#5E3B27", hair: "#141414", hairStyle: "buzz" },
    { name: "HUIJSEN", n: 4, pose: "applaud", skin: "#EDC4A2", hair: "#6B4A2E", hairStyle: "swept" },
    { name: "CUCURELLA", n: 17, pose: "shirt", skin: "#E3B08A", hair: "#3D2A1C", hairStyle: "long" },
    { name: "BELLINGHAM", n: 5, pose: "armsOut", skin: "#A8704C", hair: "#141414", hairStyle: "top" },
    { name: "TCHOUAMÉNI", n: 14, pose: "applaud", skin: "#5E3B27", hair: "#141414", hairStyle: "buzz" },
    { name: "VALVERDE", n: 8, pose: "armsUp", skin: "#E3B08A", hair: "#2B1D14", hairStyle: "swept" },
    { name: "ARDA GÜLER", n: 15, pose: "shirt", skin: "#E3B08A", hair: "#1B1410", hairStyle: "swept" },
    { name: "VINI JR.", n: 7, pose: "armsUp", skin: "#7E5136", hair: "#141414", hairStyle: "curly" },
    { name: "MBAPPÉ", n: 10, pose: "shirt", skin: "#8A5A3C", hair: "#141414", hairStyle: "buzz" },
  ];
  const PLAYER_SCALE = 3.0;
  const PLAYER_Z = 24;
  const playerSpacing = 3.55;
  // Players get a smoother, slightly glossier material than the crowd.
  const std = (color: string, roughness = 0.72) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    disposables.push(m);
    return m;
  };
  const KIT = { base: "#F6F6F2", trim: "#1B2A4A", accent: "#C9A227" };
  const GK = { base: "#2E6B5A", trim: "#16352C", accent: "#E8D9A8" };
  const kitMats = (gk: boolean) => {
    const k = gk ? GK : KIT;
    return { base: std(k.base, 0.6), trim: std(k.trim, 0.6), accent: std(k.accent, 0.5) };
  };
  const bootMat = std("#111111", 0.35);
  const bootSole = std("#E8E8E8", 0.5);

  // Rim light from the stand side so the players' outlines read against the crowd.
  const rim = new THREE.DirectionalLight("#FFE9C4", 1.1);
  rim.position.set(0, 14, -30);
  if (SHOW_3D_PLAYERS) scene.add(rim);

  /**
   * Shirt texture wrapped round the torso. In three.js cylinder UVs u=0 is
   * the front (+z) and u=0.5 the back (-z), which here faces the camera, so
   * the name and number are drawn in the middle of the canvas.
   */
  function shirtTexture(name: string, n: number, gk: boolean) {
    const k = gk ? GK : KIT;
    const W = 1024;
    const H = 512;
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d")!;
    g.fillStyle = k.base;
    g.fillRect(0, 0, W, H);
    // Subtle tonal fabric pattern
    g.globalAlpha = 0.05;
    g.fillStyle = k.trim;
    for (let y = 0; y < H; y += 14) g.fillRect(0, y, W, 6);
    g.globalAlpha = 1;
    // Side piping (u = 0.25 and 0.75 are the flanks)
    for (const cx of [W * 0.25, W * 0.75]) {
      g.fillStyle = k.trim;
      g.fillRect(cx - 7, 0, 14, H);
      g.fillStyle = k.accent;
      g.fillRect(cx - 2, 0, 4, H);
    }
    // Collar band across the top of the back, V-neck at the front
    g.fillStyle = k.trim;
    g.fillRect(W * 0.38, 0, W * 0.24, 16);
    g.fillStyle = k.accent;
    g.fillRect(W * 0.38, 16, W * 0.24, 4);
    g.beginPath();
    g.moveTo(W * 0.94, 0);
    g.lineTo(W, 60);
    g.lineTo(W, 0);
    g.moveTo(0, 0);
    g.lineTo(0, 60);
    g.lineTo(W * 0.06, 0);
    g.fillStyle = k.trim;
    g.fill();
    // Hem
    g.fillStyle = k.trim;
    g.fillRect(0, H - 10, W, 10);

    const family =
      getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "system-ui, sans-serif";
    const ink = gk ? "#F4F4F0" : k.trim;
    g.textAlign = "center";
    g.textBaseline = "middle";
    let size = 60;
    g.font = `700 ${size}px ${family}`;
    while (g.measureText(name).width > W * 0.3 && size > 26) {
      size -= 1;
      g.font = `700 ${size}px ${family}`;
    }
    g.fillStyle = ink;
    g.fillText(name, W / 2, 104);
    // Number with a thin gold keyline, like the real kit's printing
    g.font = `800 250px ${family}`;
    g.lineWidth = 8;
    g.strokeStyle = k.accent;
    g.strokeText(String(n), W / 2, 300);
    g.fillText(String(n), W / 2, 300);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    disposables.push(tex);
    return tex;
  }

  interface PlayerRig {
    root: THREE.Group;
    shadow: THREE.Mesh;
    x: number;
    shoulders: [THREE.Group, THREE.Group];
    elbows: [THREE.Group, THREE.Group];
    pose: Pose;
    u: number;
    phase: number;
  }

  // Shared rounded parts
  const capsule = (r: number, len: number) => geo(new THREE.CapsuleGeometry(r, len, 6, 14));
  const thighGeo = capsule(0.078, 0.2);
  const shinGeo = capsule(0.062, 0.3);
  const sockBandGeo = geo(new THREE.CylinderGeometry(0.068, 0.068, 0.05, 16));
  const bootGeo = capsule(0.062, 0.14);
  bootGeo.rotateX(Math.PI / 2);
  const soleGeo = geo(new THREE.BoxGeometry(0.12, 0.025, 0.27));
  const shortsGeo = geo(new THREE.CylinderGeometry(0.205, 0.235, 0.28, 24, 1, true));
  const shortsCapGeo = geo(new THREE.CircleGeometry(0.205, 24));
  const shortsStripeGeo = geo(new THREE.BoxGeometry(0.012, 0.26, 0.05));
  const pTorsoGeo = geo(new THREE.CylinderGeometry(0.255, 0.2, 0.62, 32, 4, false));
  const shoulderGeo = geo(new THREE.SphereGeometry(0.09, 16, 12));
  const sleeveGeo = geo(new THREE.CylinderGeometry(0.074, 0.068, 0.17, 16));
  const cuffGeo = geo(new THREE.CylinderGeometry(0.069, 0.069, 0.025, 16));
  const upperArmGeo = capsule(0.052, 0.14);
  const foreArmGeo = capsule(0.048, 0.2);
  const handGeo = geo(new THREE.SphereGeometry(0.056, 12, 10));
  const neckGeo = geo(new THREE.CylinderGeometry(0.056, 0.062, 0.1, 16));
  const pHeadGeo = geo(new THREE.SphereGeometry(0.118, 24, 18));
  const earGeo = geo(new THREE.SphereGeometry(0.026, 10, 8));
  const hairCapGeo = geo(new THREE.SphereGeometry(0.123, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.56));
  const curlGeo = geo(new THREE.SphereGeometry(0.045, 10, 8));

  const players: PlayerRig[] = !SHOW_3D_PLAYERS ? [] : XI.map((pl, i) => {
    const root = new THREE.Group();
    const gk = !!pl.gk;
    const kit = kitMats(gk);
    const skin = std(pl.skin, 0.55);
    const hairMat = std(pl.hair, 0.85);
    const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // Legs, slightly apart
    for (const s of [-1, 1]) {
      const lx = s * 0.105;
      add(root, soleGeo, bootSole, lx, 0.012, 0.02);
      add(root, bootGeo, bootMat, lx, 0.07, 0.02).scale.set(1, 0.85, 1);
      add(root, shinGeo, kit.base, lx, 0.32, 0); // sock
      add(root, sockBandGeo, kit.trim, lx, 0.5, 0);
      add(root, thighGeo, skin, lx, 0.66, 0);
    }
    // Shorts: flared, with a side stripe
    const shorts = add(root, shortsGeo, kit.base, 0, 0.86, 0);
    shorts.scale.z = 0.68;
    const cap = add(root, shortsCapGeo, kit.base, 0, 1.0, 0);
    cap.rotation.x = -Math.PI / 2;
    cap.scale.y = 0.68;
    for (const s of [-1, 1]) add(root, shortsStripeGeo, kit.trim, s * 0.222, 0.86, 0);

    // Torso: tapered (broad shoulders, narrower waist), flattened front to back
    const shirt = new THREE.MeshStandardMaterial({ map: shirtTexture(pl.name, pl.n, gk), roughness: 0.6 });
    disposables.push(shirt);
    const torso = add(root, pTorsoGeo, shirt, 0, 1.27, 0);
    torso.scale.z = 0.6;
    torso.rotation.y = 0; // u=0.5 (the back print) sits on local -z

    // Neck, head, ears, hair
    add(root, neckGeo, skin, 0, 1.6, 0);
    const headMesh = add(root, pHeadGeo, skin, 0, 1.74, 0);
    headMesh.scale.set(0.95, 1.08, 1);
    for (const s of [-1, 1]) add(root, earGeo, skin, s * 0.112, 1.735, 0.0);
    const hairCap = add(root, hairCapGeo, hairMat, 0, 1.755, -0.004);
    hairCap.scale.set(0.97, pl.hairStyle === "buzz" ? 0.85 : 1.0, 1.02);
    if (pl.hairStyle === "top" || pl.hairStyle === "swept") {
      const top = add(root, hairCapGeo, hairMat, 0, 1.79, pl.hairStyle === "swept" ? 0.01 : 0);
      top.scale.set(0.9, 0.7, 0.95);
    }
    if (pl.hairStyle === "curly") {
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const ring = k % 2 ? 0.085 : 0.06;
        add(root, curlGeo, hairMat, Math.cos(a) * ring, 1.83 + (k % 3) * 0.012, Math.sin(a) * ring);
      }
    }
    if (pl.hairStyle === "long") {
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * Math.PI * 2;
        add(root, curlGeo, hairMat, Math.cos(a) * 0.11, 1.72 + Math.sin(k * 1.7) * 0.05, Math.sin(a) * 0.1).scale.setScalar(1.15);
      }
    }

    // Arms: rounded shoulder, short sleeve with a cuff, bare forearm, hand
    const shoulders: THREE.Group[] = [];
    const elbows: THREE.Group[] = [];
    for (const s of [-1, 1]) {
      add(root, shoulderGeo, kit.base, s * 0.255, 1.5, 0).scale.set(1, 0.9, 0.85);
      const sh = new THREE.Group();
      sh.position.set(s * 0.29, 1.5, 0);
      add(sh, sleeveGeo, kit.base, 0, -0.07, 0);
      add(sh, cuffGeo, kit.trim, 0, -0.16, 0);
      add(sh, upperArmGeo, skin, 0, -0.2, 0);
      const el = new THREE.Group();
      el.position.y = -0.3;
      add(el, foreArmGeo, skin, 0, -0.13, 0);
      add(el, handGeo, gk ? kit.accent : skin, 0, -0.27, 0).scale.set(0.9, 1.1, 0.75);
      sh.add(el);
      root.add(sh);
      shoulders.push(sh);
      elbows.push(el);
    }

    const x = (i - (XI.length - 1) / 2) * playerSpacing;
    root.position.set(x, -1.6, PLAYER_Z + Math.abs(x) * 0.08);
    root.rotation.y = Math.PI - x * 0.006; // face the stand, backs to the camera
    root.scale.setScalar(PLAYER_SCALE);
    scene.add(root);

    // Soft contact shadow
    const shadow = new THREE.Mesh(
      geo(new THREE.CircleGeometry(0.42 * PLAYER_SCALE, 24)),
      new THREE.MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.3, depthWrite: false })
    );
    disposables.push(shadow.material as THREE.Material);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, -1.585, root.position.z);
    shadow.scale.set(1, 0.55, 1);
    scene.add(shadow);

    return {
      root,
      shadow,
      x,
      shoulders: shoulders as [THREE.Group, THREE.Group],
      elbows: elbows as [THREE.Group, THREE.Group],
      pose: pl.pose,
      u: (x / (totalW / 2) + 1) / 2,
      phase: i * 0.9,
    };
  });

  /** Arms for each pose; `pump` (0..1) exaggerates it as the wave passes. */
  function posePlayers(now: number, front: number) {
    for (const p of players) {
      const lift = front > -1 ? Math.exp(-((p.u - front) ** 2) / (2 * 0.05 ** 2)) : 0;
      const breathe = Math.sin(now / 700 + p.phase) * 0.04;
      p.root.position.y = -1.6 + lift * 0.45;
      for (const k of [0, 1] as const) {
        const s = k === 0 ? -1 : 1;
        const sh = p.shoulders[k];
        const el = p.elbows[k];
        sh.rotation.set(0, 0, 0);
        el.rotation.set(0, 0, 0);
        // The rig is turned 180°, so its local +x is the camera's left; the
        // `s` sign below is in the rig's own frame.
        switch (p.pose) {
          case "armsOut": // Bellingham: arms spread wide
            sh.rotation.z = s * (1.5 + breathe + lift * 0.5);
            break;
          case "armsUp":
            sh.rotation.z = s * (2.75 + breathe * 0.5);
            el.rotation.z = s * 0.15;
            if (lift > 0.05) sh.rotation.z = s * (2.75 - lift * 0.35);
            break;
          case "shirt": // the reference pose: pulling the shirt by the shoulders
            sh.rotation.z = s * (2.1 + breathe);
            el.rotation.z = -s * (2.55 - lift * 1.4);
            break;
          case "applaud":
            sh.rotation.x = -(1.15 + lift * 1.3);
            sh.rotation.z = s * 0.25;
            el.rotation.x = -0.7 + Math.sin(now / 90 + p.phase) * 0.18 * (1 + lift);
            el.rotation.z = -s * 0.5;
            break;
        }
      }
    }
  }

  // --- Animation ---------------------------------------------------------------
  let revealStart: number | null = null;
  let waveStart: number | null = null;
  let autoplay = false;
  let lowerStart: number | null = null;
  let wavesDone = 0;
  const WAVES_PER_LOOP = 2;
  let waveTimer: ReturnType<typeof setTimeout> | null = null;
  let inView = false;
  let raf = 0;
  const target = new THREE.Vector2();
  const current = new THREE.Vector2();

  const tmp = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const rot = new THREE.Matrix4();
  const scl = new THREE.Matrix4();

  function poseFans(now: number): boolean {
    let animating = false;
    const front = waveStart !== null ? ((now - waveStart) / WAVE_MS) * 1.4 - 0.2 : -9;
    if (waveStart !== null && now - waveStart < WAVE_MS + 400) animating = true;

    for (let i = 0; i < N; i++) {
      const f = fans[i];
      let p = 1;
      if (revealStart === null) p = 0;
      else if (lowerStart !== null && !reducedMotion) {
        // Cards come down in a quicker sweep, same direction.
        const at = 100 + f.u * (REVEAL_SWEEP * 0.6) + f.jitter * 200;
        const q = (now - lowerStart - at) / FLIP;
        p = 1 - Math.min(1, Math.max(0, q));
        if (q < 1) animating = true;
      } else if (!reducedMotion) {
        const at = 150 + f.u * REVEAL_SWEEP + f.t * 700 + f.jitter * 260;
        p = Math.min(1, Math.max(0, (now - revealStart - at) / FLIP));
        if (p < 1) animating = true;
      }
      const lift = front > -1 ? Math.exp(-((f.u - front) ** 2) / (2 * 0.035 ** 2)) : 0;
      const stand = lift * 0.32;
      const e = easeInOut(Math.min(1, p * 1.25));
      const k = p > 0 ? easeOutBack(p) : 0;

      // torso
      local.makeTranslation(0, 0.56 + stand, 0);
      torso.setMatrixAt(i, tmp.multiplyMatrices(f.base, local));
      // head + hair
      local.makeTranslation(0, 0.92 + stand, 0.01);
      head.setMatrixAt(i, tmp.multiplyMatrices(f.base, local));
      local.makeTranslation(0, 0.95 + stand, -0.012);
      hair.setMatrixAt(i, tmp.multiplyMatrices(f.base, local));

      // arms: resting forward on the lap, swinging up overhead with the card
      const armAngle = -0.35 - e * 2.55 - lift * 0.3;
      for (const [mesh, side] of [
        [armL, -1],
        [armR, 1],
      ] as const) {
        local.makeTranslation(side * 0.24, 0.74 + stand, 0.02);
        rot.makeRotationX(armAngle);
        local.multiply(rot);
        rot.makeRotationZ(side * (0.12 + e * 0.18));
        local.multiply(rot);
        mesh.setMatrixAt(i, tmp.multiplyMatrices(f.base, local));
      }

      // card: flips up from flat to upright above the head
      if (p > 0) {
        local.makeTranslation(0, 0.86 + e * 0.5 + stand + lift * 0.18, 0.06 + (1 - e) * 0.12);
        rot.makeRotationX((1 - e) * 1.35);
        local.multiply(rot);
        scl.makeScale(Math.max(0.001, k), Math.max(0.001, k), 1);
        local.multiply(scl);
      } else {
        local.makeScale(0.0001, 0.0001, 0.0001);
      }
      card.setMatrixAt(i, tmp.multiplyMatrices(f.base, local));
    }
    [torso, head, hair, armL, armR, card].forEach((m) => (m.instanceMatrix.needsUpdate = true));
    return animating;
  }

  function frame(now: number) {
    const fansMoving = poseFans(now);
    posePlayers(now, waveStart !== null ? ((now - waveStart) / WAVE_MS) * 1.4 - 0.2 : -9);
    // The loop, on repeat while the stand is on screen: cards up, a couple
    // of waves, cards down, and up again.
    if (autoplay && !fansMoving && inView && !waveTimer && revealStart !== null) {
      const next = (ms: number, fn: () => void) => {
        waveTimer = setTimeout(() => {
          waveTimer = null;
          if (!inView) return;
          fn();
          kick();
        }, ms);
      };
      if (lowerStart !== null) {
        next(700, startReveal);
      } else if (wavesDone < WAVES_PER_LOOP) {
        next(wavesDone === 0 ? 500 : WAVE_GAP, () => {
          waveStart = performance.now();
          wavesDone++;
          onBeat?.("wave");
        });
      } else {
        next(2200, () => {
          waveStart = null;
          lowerStart = performance.now();
          onBeat?.("lower");
        });
      }
    }
    // Gentle parallax that follows the pointer.
    current.lerp(target, 0.08);
    const camMoving = current.distanceTo(target) > 0.001;
    camera.position.set(camBase.x + current.x * 2.2, camBase.y + current.y * 1.1, camBase.z);
    camera.lookAt(lookAt);
    renderer.render(scene, camera);
    if ((fansMoving || camMoving) && inView) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  function startReveal() {
    revealStart = performance.now() + 200;
    waveStart = null;
    lowerStart = null;
    wavesDone = 0;
    if (waveTimer) clearTimeout(waveTimer);
    waveTimer = null;
    onBeat?.("reveal");
    if (reducedMotion) revealStart = 0;
    kick();
  }

  function kick() {
    if (!raf && inView) raf = requestAnimationFrame(frame);
  }

  function renderOnce() {
    poseFans(performance.now());
    posePlayers(performance.now(), -9);
    renderer.render(scene, camera);
  }

  return {
    setPattern(colours, ledA) {
      fans.forEach((f, i) => card.setColorAt(i, c.set(colours[f.index] ?? "#ffffff")));
      if (card.instanceColor) card.instanceColor.needsUpdate = true;
      const unique = Array.from(new Set(colours));
      ledColours.forEach((m, i) => m.color.set(unique[i % unique.length] ?? ledA));
      if (raf) return;
      renderOnce();
    },
    play() {
      autoplay = true;
      this.replay();
    },
    replay() {
      startReveal();
      if (!inView) renderOnce();
    },
    wave() {
      if (revealStart === null) return this.replay();
      if (reducedMotion) return;
      waveStart = performance.now();
      kick();
    },
    showFinal() {
      revealStart = 0;
      renderOnce();
    },
    resize(width, height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Keep the whole stand in frame on narrow screens.
      camera.fov = camera.aspect < 1.6 ? 36 * (1.6 / camera.aspect) * 0.9 : 36;
      camera.updateProjectionMatrix();
      // Pull the line of players in on narrow screens so all eleven fit.
      const squeeze = Math.min(1, Math.max(0.62, camera.aspect / 1.78));
      for (const pl of players) {
        pl.root.position.x = pl.x * squeeze;
        pl.shadow.position.x = pl.x * squeeze;
        pl.root.scale.setScalar(PLAYER_SCALE * (0.75 + 0.25 * squeeze));
      }
      if (!raf) renderOnce();
    },
    setInView(v) {
      inView = v;
      if (v) kick();
    },
    pointer(x, y) {
      if (reducedMotion) return;
      target.set(x, y);
      kick();
    },
    dispose() {
      cancelAnimationFrame(raf);
      if (waveTimer) clearTimeout(waveTimer);
      disposables.forEach((d) => d.dispose());
      [torso, head, hair, armL, armR, card, seat].forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
