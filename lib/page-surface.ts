// Pages that sit on a white background instead of the cream canvas (case
// studies, which read like a document). The page itself marks its <main>
// with data-surface="white" so globals.css can whiten <body>; the nav and
// footer use this list to swap their white fills for cream so they stay
// visible against it.
const WHITE_SURFACE_PATHS = ["/nominee"];

export const isWhiteSurface = (pathname: string) =>
  WHITE_SURFACE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
