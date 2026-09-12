"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { transition } from "@/lib/motion";
import { Button } from "@/components/ui";
import { AIStatus } from "./AIStatus";
import { AuthButton } from "./AuthButton";

const LINKS = [
  { href: "/#library", label: "Library" },
  { href: "/#journey", label: "The journey" },
  { href: "/shelf", label: "Shelf" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transition(0.7)}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-3 pr-2">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="BookVerse AI home">
          <span className="relative flex h-7 w-7 items-center justify-center" aria-hidden>
            <span className="absolute h-3.5 w-3.5 -translate-x-1 rounded-full bg-sky mix-blend-multiply transition-transform group-hover:-translate-x-1.5" />
            <span className="absolute h-3.5 w-3.5 translate-x-1 rounded-full bg-crimson mix-blend-multiply transition-transform group-hover:translate-x-1.5" />
            <span className="absolute h-3.5 w-3.5 translate-y-1 rounded-full bg-leaf mix-blend-multiply" />
          </span>
          <span className="font-grotesk text-[15px] font-bold tracking-tight text-ink">
            BookVerse
          </span>
        </Link>

        <div className="hidden items-center gap-6 font-grotesk text-body-sm text-ink-soft sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="link-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <AIStatus />
          <AuthButton />
          <Button href="/#library" size="sm">
            Enter
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}
