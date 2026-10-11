"use client";

import dynamic from "next/dynamic";

// The root layout is a Server Component, where `ssr: false` isn't allowed,
// so this thin client wrapper does the lazy load. The widget's JS loads after
// hydration and never blocks first paint.
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false });

export default function ChatWidgetLoader() {
  return <ChatWidget />;
}
