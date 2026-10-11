"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { CHAT_STATE_EVENT, CHAT_TOGGLE_EVENT } from "@/components/chat/events";

// Mirrors the limits enforced in app/api/chat/route.ts.
const MAX_INPUT = 500;
const COUNTER_FROM = 400;
const MAX_HISTORY = 12;
const MAX_ASSISTANT_CHARS = 2000;
// Three lines of the 15px/22px body text plus vertical padding.
const MAX_INPUT_HEIGHT = 3 * 22 + 16;

const SUGGESTIONS = [
  "What does Sanket work on?",
  "What tools has he built?",
  "How does he use AI in design?",
  "How do I reach him?",
];

const ERROR_RATE_LIMITED =
  "That is a lot of questions in a short time. Try again in a few minutes, or email Sanket directly.";
const ERROR_GENERIC = "Something went wrong on my side. Please try again.";

// Same soft shadow the site's raised cards use.
const SOFT_SHADOW = "shadow-[0px_12px_32px_rgba(0,0,0,0.12)]";
const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-base";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  // Error notices render like assistant replies but are never sent back to
  // the model as conversation history.
  error?: boolean;
}

/** The last 12 real messages, starting with a visitor message as the API requires. */
function toHistory(messages: Message[]) {
  const real = messages.filter((m) => !m.error && m.content.trim().length > 0);
  const recent = real.slice(-MAX_HISTORY);
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  return recent.map((m) => ({
    role: m.role,
    content: m.role === "assistant" ? m.content.slice(0, MAX_ASSISTANT_CHARS) : m.content,
  }));
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const wasOpen = useRef(false);
  // Where focus goes back to on close: the launcher, or the mobile nav
  // pill's avatar when that's what opened the panel.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const counterId = useId();

  // Focus the input on open; hand focus back to the launcher on close.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) (returnFocusRef.current ?? launcherRef.current)?.focus();
    wasOpen.current = open;
    window.dispatchEvent(new CustomEvent(CHAT_STATE_EVENT, { detail: { open } }));
  }, [open]);

  // The mobile nav pill opens and closes the chat through a window event.
  useEffect(() => {
    const onToggle = (e: Event) => {
      returnFocusRef.current = (e as CustomEvent<{ opener?: HTMLElement }>).detail?.opener ?? null;
      setOpen((o) => !o);
    };
    window.addEventListener(CHAT_TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(CHAT_TOGGLE_EVENT, onToggle);
  }, []);

  // Escape closes. Listening on the document (not the panel) so it still
  // works while the input is disabled mid-reply and focus has left the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Stop any in-flight reply if the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Keep the newest message in view as text streams in. Skipped for the
  // empty state so it opens at the top, with the avatar and heading visible.
  useEffect(() => {
    const list = listRef.current;
    if (list && messages.length > 0) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  // Grow the input from one line up to three, then scroll inside it.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [input, open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT);
      if (!text || streaming) return;

      const userMsg: Message = { id: nextId.current++, role: "user", content: text };
      const replyId = nextId.current++;
      const history = toHistory([...messages, userMsg]);

      setMessages((prev) => [...prev, userMsg, { id: replyId, role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);

      const setReply = (update: (m: Message) => Message) =>
        setMessages((prev) => prev.map((m) => (m.id === replyId ? update(m) : m)));
      const fail = (message: string) =>
        setReply((m) => ({ ...m, content: message, error: true }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          fail(res.status === 429 ? ERROR_RATE_LIMITED : ERROR_GENERIC);
          return;
        }

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let received = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value;
          const snapshot = received;
          setReply((m) => ({ ...m, content: snapshot }));
        }
        if (!received.trim()) fail(ERROR_GENERIC);
      } catch {
        if (!controller.signal.aborted) fail(ERROR_GENERIC);
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [messages, streaming]
  );

  // The input is disabled while a reply streams, which drops focus. Put it
  // back once the reply is done so keyboard users can keep typing.
  useEffect(() => {
    if (!streaming && open) inputRef.current?.focus();
  }, [streaming, open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <>
      {/* Hidden on phones, where the nav pill at the bottom carries the
          avatar instead. */}
      <div className="group fixed right-6 bottom-[calc(24px+env(safe-area-inset-bottom))] z-50 max-md:hidden">
        {/* Greeting bubble on hover or keyboard focus, hidden while the
            panel is open. Decorative: the button's aria-label already says
            what it does. */}
        {!open && (
          <span
            aria-hidden="true"
            className={cx(
              "pointer-events-none absolute right-0 bottom-full mb-[12px] whitespace-nowrap",
              "rounded-full bg-cta-base px-[14px] py-[8px] font-body text-[13px] font-medium text-cta-text",
              SOFT_SHADOW,
              "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
              "motion-safe:translate-y-[4px] motion-safe:transition-[opacity,translate] motion-safe:duration-200",
              "motion-safe:group-hover:translate-y-0 motion-safe:group-focus-within:translate-y-0",
              // Pointer, aimed at the middle of the avatar.
              "after:absolute after:top-full after:right-[22px] after:border-[6px] after:border-transparent after:border-t-cta-base after:content-[''] sm:after:right-[26px]"
            )}
          >
            Hey! Ask me anything about Sanket ✨
          </span>
        )}
        <button
          ref={launcherRef}
          type="button"
          aria-label="Ask about Sanket"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => {
            returnFocusRef.current = launcherRef.current;
            setOpen((o) => !o);
          }}
          className={cx(
            "block h-14 w-14 rounded-full sm:h-16 sm:w-16",
            SOFT_SHADOW,
            "motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105",
            FOCUS_RING
          )}
        >
          <ChatAvatar className="h-full w-full" />
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-labelledby={titleId}
          className={cx(
            "fixed z-[60] flex flex-col overflow-hidden border border-line-strong bg-bg-surface",
            SOFT_SHADOW,
            // Phones: bottom sheet, full width, 85% of the viewport.
            "inset-x-0 bottom-0 h-[85dvh] rounded-t-[28px] border-b-0",
            // 640px and up: floating panel above the launcher.
            "sm:inset-x-auto sm:right-6 sm:bottom-[calc(24px+64px+12px+env(safe-area-inset-bottom))]",
            "sm:h-[min(560px,calc(100dvh-140px))] sm:w-[420px] sm:rounded-[28px] sm:border-b",
            "motion-safe:transition-[opacity,translate] motion-safe:duration-200 motion-safe:ease-out",
            "motion-safe:starting:translate-y-3 motion-safe:starting:opacity-0"
          )}
        >
          <header className="flex items-center gap-3 border-b border-line-strong bg-bg-canvas py-4 pr-4 pl-5">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                className="font-display text-[16px] font-semibold leading-tight text-cta-base"
              >
                Ask about Sanket
              </h2>
              <p className="mt-0.5 font-mono text-caption text-text-primary">
                AI assistant · answers can be wrong
              </p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className={cx(
                "inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full",
                "bg-line-subtle text-text-primary hover:bg-line-strong",
                FOCUS_RING
              )}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <div
            ref={listRef}
            aria-live="polite"
            aria-busy={streaming}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-5 font-body"
          >
            {messages.length === 0 ? (
              <div>
                <ChatAvatar bordered={false} className="h-[64px] w-[64px]" />
                <p className="mt-3 font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.01em] text-cta-base">
                  What would you like to know about Sanket?
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className={cx(
                        "w-full rounded-full border border-line-strong bg-bg-canvas px-5 py-2.5 text-left",
                        "font-body text-[14px] font-medium text-text-primary shadow-[0px_4px_12px_rgba(0,0,0,0.04)]",
                        "hover:border-accent-base",
                        FOCUS_RING
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cx(
                    "max-w-[85%] whitespace-pre-wrap break-words rounded-[16px] px-3.5 py-2 text-[14px] leading-[20px]",
                    m.role === "user"
                      ? "ml-auto rounded-br-[6px] bg-accent-base text-text-inverse"
                      : "mr-auto rounded-bl-[6px] bg-bg-canvas text-text-primary"
                  )}
                >
                  {m.role === "user" && <span className="sr-only">You: </span>}
                  {m.content === "" && !m.error ? (
                    <TypingDots />
                  ) : m.role === "assistant" ? (
                    <Linkified text={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-line-strong px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:pb-4"
          >
            <label className="sr-only" htmlFor={`${titleId}-input`}>
              Your question
            </label>
            {/* The field's focus ring sits on this wrapper so it surrounds the
                send button too, the way the filled pill reads visually. */}
            <div
              className={cx(
                "flex items-end gap-2 rounded-[18px] border border-text-muted bg-bg-canvas py-1.5 pr-1.5 pl-4",
                "has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-accent-base"
              )}
            >
              <textarea
                id={`${titleId}-input`}
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_INPUT}
                disabled={streaming}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-describedby={input.length > COUNTER_FROM ? counterId : undefined}
                placeholder="Ask anything about Sanket…"
                className={cx(
                  "min-w-0 flex-1 resize-none self-center bg-transparent py-1.5 outline-none",
                  "font-body text-[16px] leading-[22px] text-text-primary placeholder:text-text-primary sm:text-[14px]",
                  "disabled:opacity-60"
                )}
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={streaming || input.trim().length === 0}
                className={cx(
                  "inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full",
                  "bg-accent-base text-text-inverse hover:bg-accent-hover disabled:opacity-40",
                  FOCUS_RING
                )}
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="M4 10h11M11 5l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            {input.length > COUNTER_FROM && (
              <p
                id={counterId}
                className="mt-1.5 pr-3 text-right font-mono text-caption text-text-primary"
              >
                {input.length}/{MAX_INPUT}
              </p>
            )}
          </form>
        </div>
      )}
    </>
  );
}

// Turns email addresses and https links in a reply into real links, so
// "how do I reach him?" ends in something the visitor can tap: the email
// opens their mail app, profiles open in a new tab.
const LINK_PATTERN = /([\w.+-]+@[\w-]+\.[\w.-]*\w|https?:\/\/[^\s]*[^\s.,;:!?)])/g;

function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(LINK_PATTERN).map((part, i) => {
        if (i % 2 === 0) return part;
        const isEmail = !part.startsWith("http");
        return (
          <a
            key={i}
            href={isEmail ? `mailto:${part}` : part}
            target={isEmail ? undefined : "_blank"}
            rel={isEmail ? undefined : "noopener noreferrer"}
            className="font-medium underline underline-offset-2 hover:text-accent-hover"
          >
            {part.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        );
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1">
      <span className="sr-only">Assistant is typing</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-text-primary motion-safe:animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
