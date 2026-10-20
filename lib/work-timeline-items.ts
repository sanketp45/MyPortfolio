export interface WorkTimelineItem {
  year: string;
  title: string;
  description: string;
  image?: string;
  href: string;
  locked?: boolean;
  lockedLabel?: string;
}

// Titles, descriptions, links, and images are taken verbatim from the
// "My Projects" section of the Framer portfolio
// (sanketpportfilio.framer.website). Years carried over from the earlier
// work-section ordering.
export const DEFAULT_WORK_ITEMS: WorkTimelineItem[] = [
  {
    year: "2026",
    title: "Multiple nominees for FDs at one of India’s largest NBFCs",
    description:
      "Turning a single nominee form into a flow that explains priority and percentage, and helps people set up the right one.",
    image: "/case-studies/fd-nomination/hero/summary-three.png",
    href: "/nominee",
  },
  {
    year: "2026",
    title: "Redesigning the investment page for India's largest NBFC",
    description:
      "Investment mall is a seamless platform that signifies investing (Stocks, MF, FD, Savings plan).",
    image: "/images/work-investment-mall.png",
    href: "https://sanketportfilio.framer.website/page-3",
  },
  {
    year: "2025",
    title: "Revamping one of the largest onboarding experiences for a brokerage app",
    description:
      "Transforming the onboarding journey of a leading brokerage app in a single, impactful move.",
    image: "/images/work-onboarding.png",
    href: "https://www.figma.com/proto/8X7BNkulDMD1z9VXLPtUsC/Sanket-Patil-s-team-library?node-id=2318-75&p=f&t=afEcBM4yDrcXiTlK-0&scaling=min-zoom&content-scaling=fixed&page-id=2318%3A75",
  },
  {
    year: "2024",
    title: "Enhancing the IPO listing experience for India’s largest NBFC",
    description: "Turning IPO frustration into understanding with simplicity, education and insight",
    image: "/images/work-ipo.png",
    href: "https://medium.com/@patilsanket199/case-study-revolutionising-the-ipo-listing-experience-for-abc-firm-7e8c67c9a363",
  },
];
