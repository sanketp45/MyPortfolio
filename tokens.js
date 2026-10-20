// tokens.js
export const color = {
  bg: {
    canvas:    '#F7F5EC',   // confirmed
    surface:   '#FFFFFF',   // card / raised
    inverse:   '#02594E',   // dark sections
  },
  text: {
    primary:   '#4C6763',
    secondary: '#7A8C89',
    muted:     '#A8B0AC',
    inverse:   '#F9F4ED',
  },
  line: {
    subtle:    '#EDE8E0',
    strong:    '#D0D5DD',
  },
  accent: {
    base:      '#02594E',
    hover:     '#013A33',   // darker than base, not lighter — used on hover/press
  },
  // Hero-specific fills, given as exact hex by request rather than derived
  // from the core palette. Kept here (not hardcoded in components) so the
  // "no raw hex in component files" rule still holds.
  card: {
    work:  '#FBDFB8',
    apps:  '#DDD5F8',
    talks: '#C3E2F8',
  },
  badge: {
    fill:   '#FBF3C4',
    border: '#E8D98A',
  },
  // Every CTA button uses this, not text/primary or plain black. On black,
  // hover lightens slightly — the one exception to "darken on hover",
  // since there's nothing darker than near-black to move to.
  // Case-study pages follow a document-style reference (near-black ink,
  // warm grey for secondary text, a brighter green for markers) rather
  // than the site's teal palette.
  caseStudy: {
    ink:   '#11110F',
    muted: '#706C63',
    green: '#148E4B',
    red:   '#C2412D',
    // Iteration tags and the decision callout, after a reference that
    // marks iterations with a lavender pill.
    purple:   '#7B3FD9',
    lavender: '#F8F5FE',
  },
  // Panel behind case-study screens: a royal blue in the FD app's own navy
  // family, lit at the top centre (light) and deepening to the edges.
  stage: {
    light: '#3474C2',
    base:  '#2462B0',
    deep:  '#1A4E93',
  },
  cta: {
    base:  '#0B0B0B',
    hover: '#262626',
    text:  '#FFFFFF',
  },
};

export const font = {
  display: `'acorn', serif`,     // headings
  body:    `'roobert', sans-serif`,
  mono:    `'Inter', monospace`, // metadata, years, labels
};

export const size = {
  h1: '2.25rem', h2: '1.5rem', h3: '1.25rem', body: '1rem', small: '0.875rem', caption: '0.75rem',
};

export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export const radius = { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', pill: '9999px' };
