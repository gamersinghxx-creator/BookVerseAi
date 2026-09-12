import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LiquidLight } from "@/components/fx/LiquidLight";
import { Cursor } from "@/components/fx/Cursor";
import { RouteProgress } from "@/components/fx/RouteProgress";
import { Analytics } from "@/components/Analytics";

// Self-hosted via next/font — no external request, no layout shift.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BookVerse AI — Step inside any book",
    template: "%s",
  },
  description:
    "An immersive way to understand any book: living summaries, timelines, mind maps, and an AI tutor, painted in light.",
  keywords: [
    "book summaries",
    "AI book summary",
    "reading",
    "study guide",
    "mind map",
    "book tutor",
  ],
  openGraph: {
    type: "website",
    siteName: "BookVerse AI",
    title: "BookVerse AI — Step inside any book",
    description:
      "Living summaries, timelines, mind maps and an AI tutor, painted in light.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "BookVerse AI — Step inside any book",
    description:
      "Living summaries, timelines, mind maps and an AI tutor, painted in light.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${grotesk.variable} ${sans.variable}`}
    >
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-body-sm focus:text-paper"
        >
          Skip to content
        </a>

        <LiquidLight />
        <div className="grain" />
        <Cursor />
        <RouteProgress />

        <Nav />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
