import type { ReactNode, SVGProps } from "react";

// Small stroke icons for case-study chrome (breadcrumb, meta row, section
// headings). All draw in currentColor on a 24px grid.

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const BackIcon = (p: P) => (
  <Icon {...p}>
    <path d="M18 6c0 6-4 10-11 10" />
    <path d="M10 12l-4 4 4 4" />
  </Icon>
);

export const NomineesIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5" />
    <circle cx="17" cy="9" r="2.4" />
    <path d="M16 14.2c2.4-.3 4.1 1.4 4.6 4.3" />
  </Icon>
);

export const BuildingIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 20V6l8-3 8 3v14" />
    <path d="M3 20h18M9 20v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" />
  </Icon>
);

export const AwardIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
  </Icon>
);

export const PeopleIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M6 20c.5-3.4 3-5.5 6-5.5s5.5 2.1 6 5.5" />
  </Icon>
);

export const CalendarIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);

export const DevicesIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="13" height="10" rx="1.5" />
    <path d="M6 19h6" />
    <rect x="17" y="9" width="4.5" height="10" rx="1.2" />
  </Icon>
);

export const ClockIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const SummaryIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />
  </Icon>
);

export const ProblemIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
  </Icon>
);

export const WorkIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="7" width="17" height="12.5" rx="2" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3.5 12.5h17" />
  </Icon>
);

export const BridgeIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 17h4M17 17h4M7 17c0-4.4 2.2-7 5-7s5 2.6 5 7M12 10V6" />
  </Icon>
);

export const TestingIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 3.5h6M10 3.5v5.5L5 18a1.6 1.6 0 0 0 1.4 2.5h11.2A1.6 1.6 0 0 0 19 18l-5-9V3.5M7.5 14h9" />
  </Icon>
);

export const LearningsIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9V16h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3z" />
  </Icon>
);

export const ChangesIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 9a8 8 0 0 1 14-3l2 2M20 4v4h-4M20 15a8 8 0 0 1-14 3l-2-2M4 20v-4h4" />
  </Icon>
);

export const CheckIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5.5 12.5l4 4 9-9" />
  </Icon>
);

export const CrossIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 7l10 10M17 7L7 17" />
  </Icon>
);

export const ReflectionIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z" />
    <path d="M18 16l.8 1.7 1.7.8-1.7.8L18 21l-.8-1.7-1.7-.8 1.7-.8z" />
  </Icon>
);

export const NextIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </Icon>
);
