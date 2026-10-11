import { cx } from "@/lib/cx";

/**
 * Illustrated portrait of Sanket (drawn from public/photos/myimage.jpg) for
 * the chat launcher and the empty state: black line art on a cream circle,
 * with tall swept-up hair, a short beard, and a dark sweater over a shirt
 * collar. Ink is cta/base via currentColor; highlights use the badge/fill
 * cream token. The eyes blink every few seconds (see .chat-avatar-eyes in
 * globals.css), which reduced-motion turns off.
 */
export function ChatAvatar({
  className,
  bordered = true,
}: {
  className?: string;
  bordered?: boolean;
}) {
  const cream = "var(--color-badge-fill)";
  return (
    <span
      aria-hidden="true"
      className={cx(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-badge-fill text-cta-base",
        bordered && "border border-badge-border",
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        {/* Shoulders: dark sweater, light shirt collar. */}
        <path
          d="M15 101 C17 86 29 79.5 42 78.5 L50 87 L58 78.5 C71 79.5 83 86 85 101 Z"
          fill="currentColor"
          fillOpacity="0.88"
        />
        <path d="M42 71 L42 78.5 M58 71 L58 78.5" />
        <path d="M41 78 L46 86.5 L50 82 L54 86.5 L59 78" fill={cream} strokeWidth="1.8" />

        {/* Face and ears. */}
        <path d="M31 44 C30 61 38 74 50 75.5 C62 74 70 61 69 44" />
        <path d="M31 48 C26 46 25 55 31 57.5" />
        <path d="M69 48 C74 46 75 55 69 57.5" />

        {/* Hair: tall, textured, swept up and to the right. */}
        <path
          d="M30 48 C27 40 26 32 30 26 C28 22 31 18 35 19 C35 13 41 10 46 12 C48 7 56 6 60 10 C64 8 70 11 70 16 C75 18 76 25 73 29 C76 34 74 41 70 47 C69 41 67 37 63 35 C60 37 57 35 54 34.5 C51 36 47 35 44 34.5 C41 36 37 36 35 38 C32 40 31 44 30 48 Z"
          fill="currentColor"
        />
        <path
          d="M34 35 C36 29 40 24 46 21.5 M38.5 31 C43 24.5 50 20.5 58 19.5 M45 32.5 C50 27 57 23.5 66 22.5 M56 14 C60 13 64 14 67 16.5"
          stroke={cream}
          strokeWidth="1.2"
        />
        <path d="M31 46.5 L31.6 53.5 M69 46.5 L68.4 53.5" strokeWidth="3" />

        {/* Brows. */}
        <path d="M37.5 44.5 C40 42.5 44 42.3 46.5 43.6" strokeWidth="2.8" />
        <path d="M53.5 43.6 C56 42.3 60 42.5 62.5 44.5" strokeWidth="2.8" />

        {/* Eyes. */}
        <g className="chat-avatar-eyes" fill="currentColor" stroke="none">
          <ellipse cx="42" cy="50" rx="1.9" ry="2.1" />
          <ellipse cx="58" cy="50" rx="1.9" ry="2.1" />
        </g>

        {/* Nose. */}
        <path d="M50.5 50.5 C49.5 54.5 48 56.5 49.5 58 C50.5 58.6 52 58.4 53 57.6" strokeWidth="1.8" />

        {/* Beard along the jaw, leaving the cheeks and upper lip clear. */}
        <path
          d="M31.5 52 C33 66 40.5 75.5 50 76.2 C59.5 75.5 67 66 68.5 52 C66.5 63 59.5 69.5 50 69.5 C40.5 69.5 33.5 63 31.5 52 Z"
          fill="currentColor"
          fillOpacity="0.82"
          stroke="none"
        />

        {/* Mustache and mouth. */}
        <path d="M43 61.2 C46 59.4 48.8 59.8 50 61 C51.2 59.8 54 59.4 57 61.2" strokeWidth="2.4" />
        <path d="M45.5 64.4 C48.2 65.8 51.8 65.8 54.5 64.4" strokeWidth="1.7" />
      </svg>
    </span>
  );
}
