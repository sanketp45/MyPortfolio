import type { WritingPost } from "@/components/writing";

// Every entry in the "Vibe coded experiments" section of the Framer
// portfolio (sanketpportfilio.framer.website), in the same order. Titles and
// links are taken from there; images are its thumbnails, saved locally.
export const VIBE_PROJECTS: WritingPost[] = [
  {
    title: "Figma QA Annotator",
    excerpt: "Chrome extension syncs Figma component specs with production.",
    href: "https://chromewebstore.google.com/detail/figma-qa-annotator/bdkmicbfmngnkefgbjlabgbpijgaopmc",
    image: "/images/vibe-figma-qa.png",
    imageWidth: 2880,
    imageHeight: 1520,
    tags: ["Chrome extension"],
  },
  {
    title: "CharCount",
    excerpt: "Built a Figma Plugin to Auto-Show Character Counts — Meet CharCount",
    href: "https://www.figma.com/community/plugin/1582787448267588063/charcount",
    image: "/images/vibe-charcount.png",
    imageWidth: 2880,
    imageHeight: 1520,
    tags: ["Figma plugin"],
  },
  {
    title: "Personalised Reminder App",
    excerpt:
      "From Eye Strain to Vibe Coding: Building My Personalised Reminder App using Cursor.",
    href: "https://medium.com/@patilsanket199/from-eye-strain-to-vibe-coding-building-my-personalised-reminder-app-e8ee7e2f897b",
    image: "/images/vibe-reminder-wide.png",
    imageWidth: 972,
    imageHeight: 513,
    tags: ["Cursor", "App"],
  },
  {
    title: "Vending Machine",
    excerpt: "A working vending machine with Razorpay integration.",
    href: "https://drawn-olive-72853357.figma.site/",
    image: "/images/vibe-vending-machine.png",
    imageWidth: 1200,
    imageHeight: 662,
    tags: ["Figma Sites", "Razorpay"],
  },
  {
    title: "Orchid",
    excerpt: "A fashion resale platform with Supabase and Razorpay integration.",
    href: "https://stuck-rename-02847459.figma.site/",
    image: "/images/vibe-orchid.png",
    imageWidth: 1200,
    imageHeight: 662,
    tags: ["Supabase", "Razorpay"],
  },
  {
    title: "UX Term Mix-Up",
    excerpt: "A quick quiz game to sharpen UX vocabulary: 10 rounds, 60 seconds per question.",
    href: "https://surf-evil-25713286.figma.site/",
    image: "/images/vibe-ux-term-game.png",
    imageWidth: 1200,
    imageHeight: 675,
    tags: ["Game"],
  },
  {
    title: "Developer, turned designer, and now… vibe coding?",
    excerpt: "On going from writing code, to design, and back to building with AI.",
    href: "https://medium.com/@patilsanket199/developer-turned-designer-and-now-vibe-coding-440fa20c402c",
    image: "/images/vibe-dev-to-designer.png",
    imageWidth: 1200,
    imageHeight: 681,
    tags: ["Medium", "Article"],
  },
];
