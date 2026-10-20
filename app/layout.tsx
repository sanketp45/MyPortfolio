import type { Metadata } from "next";
import { display, body, mono, serif, hand } from "./fonts";
import SiteNav from "@/components/site-nav";
import Footer from "@/components/footer";
import ChatWidgetLoader from "@/components/chat/ChatWidgetLoader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sanket Sugaonkar — UI/UX Designer",
  description:
    "Portfolio of Sanket Sugaonkar, a product designer with four years in design, currently designing investing products at Bajaj Finserv.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable} ${hand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-canvas pb-[88px] text-text-primary font-body md:pb-0">
        <SiteNav />
        {children}
        <Footer />
        <ChatWidgetLoader />
      </body>
    </html>
  );
}
