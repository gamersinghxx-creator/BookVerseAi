import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LiquidLight } from "@/components/fx/LiquidLight";
import { Cursor } from "@/components/fx/Cursor";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BookVerse AI - Step inside a book",
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
    title: "BookVerse AI - Step inside any book",
    description:
      "Living summaries, timelines, mind maps and an AI tutor, painted in light.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "BookVerse AI - Step inside any book",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..800&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>

        <LiquidLight />
        <div className="grain" />
        <Cursor />

        <Nav />
        <main id="main" className="relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
