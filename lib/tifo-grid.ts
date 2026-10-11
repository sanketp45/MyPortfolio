// Shared between the tifo UI (pattern building) and the three.js scene,
// so the UI can build card patterns without pulling in three.js.

export const BLOCKS = 4;
export const COLS_PER_BLOCK = 24;
export const COLS = BLOCKS * COLS_PER_BLOCK;
export const ROWS = 40;

/** How long a Mexican wave takes to cross the stand. */
export const WAVE_MS = 2200;

/** Back rows are trimmed towards the ends, giving the stand its curved top. */
export function rowsInColumn(col: number) {
  const u = col / (COLS - 1);
  return ROWS - Math.round(7 * Math.pow(Math.abs(2 * u - 1), 2));
}

export interface TifoPalette {
  id: string;
  label: string;
  bg: string;
  text: string;
  band: string;
  band2: string;
}

export const PALETTES: TifoPalette[] = [
  { id: "blanco", label: "Blanco", bg: "#F4F4F0", text: "#4B2A7B", band: "#C9A227", band2: "#4B2A7B" },
  { id: "morado", label: "Morado", bg: "#4B2A7B", text: "#F4F4F0", band: "#C9A227", band2: "#F4F4F0" },
  { id: "noche", label: "Noche", bg: "#1B2A4A", text: "#D4AF37", band: "#F4F4F0", band2: "#D4AF37" },
];

/**
 * One card colour per seat, row 0 = front row. A band runs along the back
 * and front of the stand; two lines of text are rasterised at 4x and
 * averaged down to one card per seat.
 */
export function buildPattern(line1: string, line2: string, p: TifoPalette): string[] {
  const S = 4;
  const c = document.createElement("canvas");
  c.width = COLS * S;
  c.height = ROWS * S;
  const ctx = c.getContext("2d")!;
  const family =
    getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "system-ui, sans-serif";

  // Rows here run top (back) to bottom (front), like reading the stand.
  const drawLine = (text: string, top: number, bottom: number) => {
    if (!text) return;
    const h = (bottom - top) * S;
    let size = h * 1.08;
    ctx.font = `800 ${size}px ${family}`;
    const maxW = COLS * S * 0.86;
    const w = ctx.measureText(text).width;
    if (w > maxW) {
      size *= maxW / w;
      ctx.font = `800 ${size}px ${family}`;
    }
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, (COLS * S) / 2, ((top + bottom) / 2) * S + size * 0.04);
  };
  drawLine(line1.toUpperCase(), 9, 20);
  drawLine(line2.toUpperCase(), 21.5, 33);
  const data = ctx.getImageData(0, 0, c.width, c.height).data;

  const out: string[] = new Array(COLS * ROWS);
  for (let readRow = 0; readRow < ROWS; readRow++) {
    const row = ROWS - 1 - readRow; // convert to front-first
    for (let col = 0; col < COLS; col++) {
      let colour: string;
      if (readRow < 7) colour = readRow < 4 ? p.band : p.bg;
      else if (readRow >= ROWS - 3) colour = Math.floor(col / 6) % 2 ? p.band : p.band2;
      else {
        let a = 0;
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) a += data[((readRow * S + y) * c.width + (col * S + x)) * 4 + 3];
        colour = a / (S * S * 255) > 0.42 ? p.text : p.bg;
      }
      out[row * COLS + col] = colour;
    }
  }
  return out;
}
