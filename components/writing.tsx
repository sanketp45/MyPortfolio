import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { Panel } from "@/components/panel";
import { BUTTON_PRIMARY } from "@/components/cta-styles";
import { MEDIUM_URL } from "@/lib/site-links";
import { SectionHeading, SECTION_CONTENT_GAP, SECTION_PAD } from "@/components/section-heading";

const MEDIUM_PROFILE_URL = MEDIUM_URL;

export interface WritingPost {
  title: string;
  excerpt: string;
  href: string;
  image: string;
  // Intrinsic size of the image file, so the frame can follow its shape
  // without any layout shift while it loads.
  imageWidth: number;
  imageHeight: number;
  tags: string[];
  reads?: string; // count only, e.g. "56k" — the card appends " reads"
}

// The four latest articles on Medium (medium.com/@patilsanket199), newest
// first. Titles are as published (one typo fixed); each excerpt is the
// article's opening lines, which is what Medium shows as the preview; tags
// come from the article's Medium topics; images are the cover images.
const POSTS: WritingPost[] = [
  {
    title: "The Canvas Is Becoming the Codebase",
    excerpt:
      "For as long as most of us have been building digital products, there’s been an invisible line between design and development. Designers create the experience. Developers build it.",
    href: "https://medium.com/@patilsanket199/the-canvas-is-becoming-the-codebase-80c6bb51eab7",
    image: "/images/article-canvas-codebase.png",
    imageWidth: 1024,
    imageHeight: 576,
    tags: ["Figma", "Product design"],
  },
  {
    title: "From Figma to Storybook to Production, Using Figma Console MCP and Claude Code CLI",
    excerpt:
      "I have been using Figma Console MCP in my design work for a while now. Creating components, setting up tokens, iterating on designs through prompts.",
    href: "https://medium.com/@patilsanket199/from-figma-to-storybook-to-production-using-claude-code-cli-and-figma-console-mcp-4219616375e7",
    image: "/images/article-figma-storybook.png",
    imageWidth: 1024,
    imageHeight: 562,
    tags: ["Claude Code", "Figma MCP"],
  },
  {
    title: "From Eye Strain to Vibe Coding: Building My Personalised Reminder App",
    excerpt:
      "Every day, I’d stare into my screen for hours — sketching ideas, designing layouts, refining prototypes, and making small adjustments to get things just right.",
    href: "https://medium.com/@patilsanket199/from-eye-strain-to-vibe-coding-building-my-personalised-reminder-app-e8ee7e2f897b",
    image: "/images/article-eye-strain.jpg",
    imageWidth: 1024,
    imageHeight: 640,
    tags: ["Vibe coding", "Cursor"],
  },
  {
    title: "Developer, turned designer, and now… vibe coding?",
    excerpt:
      "Ever feel like you’ve jumped between universes? I sure did. I started off writing messy React code, switched to obsessing over pixels as a designer, and now I’ve become a full-on vibe coder.",
    href: "https://medium.com/@patilsanket199/developer-turned-designer-and-now-vibe-coding-440fa20c402c",
    image: "/images/article-dev-designer-vibe.png",
    imageWidth: 1024,
    imageHeight: 514,
    tags: ["Vibe coding"],
  },
];

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}

const NEW_TAB_PROPS = {
  target: "_blank" as const,
  rel: "noopener noreferrer",
};

const CTA_BUTTON = BUTTON_PRIMARY;

export function WritingCard({ post }: { post: WritingPost }) {
  return (
    <article
      className={cx(
        "group relative rounded-[16px] outline-none",
        "has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-2",
        "has-[a:focus-visible]:outline-accent-base has-[a:focus-visible]:outline-offset-[4px]"
      )}
    >
      {/* The frame follows the image's own shape, with the same 16px of
          line/subtle on every side, so nothing is cropped. */}
      <div className="rounded-[14px] bg-line-subtle p-[16px]">
        <div className="overflow-hidden rounded-[8px]">
          <Image
            src={post.image}
            alt=""
            width={post.imageWidth}
            height={post.imageHeight}
            sizes="(min-width: 1100px) 23vw, (min-width: 640px) 46vw, 92vw"
            className={cx(
              "block h-auto w-full transition-transform duration-300 motion-reduce:transition-none",
              "group-hover:scale-[1.04] group-has-[a:focus-visible]:scale-[1.04]"
            )}
          />
        </div>
      </div>

      <div className="mt-[28px]">
        {post.reads && (
          <p className="mb-2 text-body font-medium text-accent-base">
            {post.reads.toLowerCase()} reads
          </p>
        )}

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[22px] font-display font-bold leading-[1.25] text-text-primary">
            <a
              href={post.href}
              {...NEW_TAB_PROPS}
              className={cx(
                "underline-offset-4 outline-none",
                "after:absolute after:inset-0 after:content-['']",
                "group-hover:underline focus-visible:underline"
              )}
            >
              {post.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </h3>
          <ExternalLinkIcon
            className={cx(
              "mt-0.5 h-[18px] w-[18px] shrink-0 text-text-primary",
              "transition-transform duration-300 motion-reduce:transition-none",
              "group-hover:translate-x-[2px] group-hover:-translate-y-[2px]",
              "group-has-[a:focus-visible]:translate-x-[2px] group-has-[a:focus-visible]:-translate-y-[2px]"
            )}
          />
        </div>

        <p className="mt-[8px] line-clamp-3 text-body leading-[1.5] text-text-primary">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-pill bg-line-subtle px-[14px] py-[6px] text-[15px] text-text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Writing() {
  return (
    <section aria-labelledby="writing-heading" className="bg-bg-canvas">
      <Panel className="mt-5 bg-bg-surface">
        <div className={SECTION_PAD}>
          <SectionHeading
            id="writing-heading"
            title="I write. Quite a lot."
            subtitle="Articles on Medium about designing and building with AI."
            action={
              <Link href={MEDIUM_PROFILE_URL} {...NEW_TAB_PROPS} className={CTA_BUTTON}>
                Explore all writings
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            }
          />

          <div className={cx(SECTION_CONTENT_GAP, "grid grid-cols-1 gap-[40px] min-[640px]:grid-cols-2 min-[1100px]:grid-cols-4")}>
            {POSTS.map((post) => (
              <WritingCard key={post.title} post={post} />
            ))}
          </div>
        </div>
      </Panel>
    </section>
  );
}
