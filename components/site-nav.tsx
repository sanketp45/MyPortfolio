"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CTA_HOVER } from "@/components/cta-styles";
import { LINKEDIN_URL, MAILTO } from "@/lib/site-links";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { CHAT_STATE_EVENT, CHAT_TOGGLE_EVENT } from "@/components/chat/events";

const NAV_LINKS = [
  { key: "home", label: "Home", href: "/" },
  { key: "play", label: "Play", href: "/play" },
  { key: "about", label: "About", href: "/about" },
] as const;

type NavLinkKey = (typeof NAV_LINKS)[number]["key"];

// Forced looks, used only by the /styleguide/nav demo to render a state
// that would otherwise require a real :hover / :focus-visible / :active
// event. Normal usage never passes these — the real pseudo-classes below
// do the work.
type LinkForce = "default" | "hover" | "current" | "currentHover" | "focus" | "active";
type ButtonForce = "default" | "hover" | "focus" | "active";

export interface SiteNavProps {
  forceLinks?: Partial<Record<NavLinkKey, LinkForce>>;
  forceSayHello?: ButtonForce;
  forceLinkedIn?: ButtonForce;
  linkedInHref?: string;
  mailHref?: string;
}

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const TRANSITION =
  "transition-[background-color,color,transform] duration-[120ms] ease motion-reduce:transition-none";

function linkClasses(isCurrent: boolean, force: LinkForce = "default") {
  const base = cx(
    "rounded-full px-4 py-2 text-body font-body outline-none",
    TRANSITION
  );

  if (force === "default") {
    return cx(
      base,
      isCurrent ? "bg-accent-base text-text-inverse font-medium" : "bg-transparent text-text-primary font-normal",
      isCurrent ? "hover:bg-accent-hover" : "hover:bg-line-subtle",
      "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base",
      "active:scale-[0.98]"
    );
  }

  switch (force) {
    case "hover":
      return cx(
        base,
        isCurrent
          ? "bg-accent-hover text-text-inverse font-medium"
          : "bg-line-subtle text-text-primary font-normal"
      );
    case "current":
      return cx(base, "bg-accent-base text-text-inverse font-medium");
    case "currentHover":
      return cx(base, "bg-accent-hover text-text-inverse font-medium");
    case "focus":
      return cx(
        base,
        isCurrent ? "bg-accent-base text-text-inverse font-medium" : "bg-transparent text-text-primary font-normal",
        "outline-solid outline-2 outline-offset-2 outline-accent-base"
      );
    case "active":
      return cx(
        base,
        isCurrent ? "bg-accent-base text-text-inverse font-medium" : "bg-transparent text-text-primary font-normal",
        "scale-[0.98]"
      );
  }
}

function buttonClasses(force: ButtonForce = "default") {
  const base = cx(
    "inline-flex h-[40px] items-center justify-center gap-2 rounded-full bg-cta-base text-cta-text outline-none",
    TRANSITION
  );

  if (force === "default") {
    return cx(
      base,
      "hover:bg-cta-hover",
      CTA_HOVER,
      "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base"
    );
  }

  switch (force) {
    case "hover":
      return cx(base, "bg-cta-hover");
    case "focus":
      return cx(base, "outline-solid outline-2 outline-offset-2 outline-accent-base");
    case "active":
      return cx(base, "scale-[0.98]");
  }
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
      <path d="M2.25 6.75c0-1.036.84-1.875 1.875-1.875h15.75c1.035 0 1.875.84 1.875 1.875v10.5a1.875 1.875 0 01-1.875 1.875H4.125A1.875 1.875 0 012.25 17.25V6.75zm1.5.413v9.337c0 .207.168.375.375.375h15.75a.375.375 0 00.375-.375V7.163l-8.03 5.354a.75.75 0 01-.832 0L3.75 7.163z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function SiteNav({
  forceLinks,
  forceSayHello,
  forceLinkedIn,
  linkedInHref = LINKEDIN_URL,
  mailHref = MAILTO,
}: SiteNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  // Mirrors the chat panel's open state for the pill avatar's aria-expanded.
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onChatState = (e: Event) => setIsChatOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    window.addEventListener(CHAT_STATE_EVENT, onChatState);
    return () => window.removeEventListener(CHAT_STATE_EVENT, onChatState);
  }, []);

  const isCurrentLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className={cx(
        "sticky top-0 z-50 border-b bg-bg-canvas",
        isScrolled ? "border-line-subtle" : "border-transparent",
        "transition-colors duration-150 ease motion-reduce:transition-none"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* Left zone */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-accent-base text-small font-body font-medium text-text-inverse"
          >
            SS
          </span>
          <span className="whitespace-nowrap font-display text-[17px] font-medium text-text-primary md:text-h3">
            Sanket Sugaonkar
          </span>
        </div>

        {/* Centre zone — hidden below md, real viewport centring via the
            grid's equal 1fr outer columns at md+ */}
        <div className="hidden items-center gap-1 rounded-pill bg-white p-[6px] md:flex">
          {NAV_LINKS.map((link) => {
            const force = forceLinks?.[link.key];
            const isCurrent =
              force === "current" || force === "currentHover" || isCurrentLink(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isCurrent ? "page" : undefined}
                className={linkClasses(isCurrent, force)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right zone */}
        <div className="flex items-center gap-3 md:justify-self-end">
          <Link
            href={mailHref}
            aria-label="Say hello"
            className={cx(buttonClasses(forceSayHello), "px-4")}
          >
            <MailIcon />
            <span className="hidden md:inline">Say hello</span>
          </Link>
          <Link
            href={linkedInHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile (opens in a new tab)"
            className={cx(buttonClasses(forceLinkedIn), "w-[40px]")}
          >
            <LinkedInIcon />
          </Link>
        </div>
      </div>

      {/* Phones (below md): the links move into a floating pill at the
          bottom of the screen, as on benshih.design, with the chat avatar
          at its end. The top bar's centre links are hidden at this size,
          so screen readers only meet one copy. */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 md:hidden"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-1 rounded-pill bg-white/90 p-[6px] shadow-[0px_8px_32px_rgba(16,24,40,0.14)] backdrop-blur-md">
          {NAV_LINKS.map((link) => {
            const isCurrent = isCurrentLink(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isCurrent ? "page" : undefined}
                className={linkClasses(isCurrent)}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            aria-label="Ask about Sanket"
            aria-haspopup="dialog"
            aria-expanded={isChatOpen}
            onClick={(e) =>
              window.dispatchEvent(
                new CustomEvent(CHAT_TOGGLE_EVENT, { detail: { opener: e.currentTarget } })
              )
            }
            className={cx(
              "ml-1 rounded-full outline-none",
              "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base",
              "active:scale-[0.96] motion-reduce:active:scale-100"
            )}
          >
            <ChatAvatar className="h-[38px] w-[38px]" />
          </button>
        </div>
      </div>
    </nav>
  );
}
