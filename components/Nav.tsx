"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AIStatus } from "./AIStatus";
import { AuthButton } from "./AuthButton";

export function Nav() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass flex w-full max-w-3xl items-center justify-between rounded-full py-2 pl-3 pr-2">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute h-3.5 w-3.5 -translate-x-1 rounded-full bg-sky mix-blend-multiply transition-transform group-hover:-translate-x-1.5" />
            <span className="absolute h-3.5 w-3.5 translate-x-1 rounded-full bg-crimson mix-blend-multiply transition-transform group-hover:translate-x-1.5" />
            <span className="absolute h-3.5 w-3.5 translate-y-1 rounded-full bg-leaf mix-blend-multiply" />
          </span>
          <span className="font-grotesk text-[15px] font-bold tracking-tight text-ink">
            BookVerse
          </span>
        </Link>

        <div className="hidden items-center gap-6 font-grotesk text-sm text-ink-soft sm:flex">
          <Link href="/#library" className="link-underline hover:text-ink">
            Library
          </Link>
          <Link href="/#journey" className="link-underline hover:text-ink">
            The journey
          </Link>
          <Link href="/shelf" className="link-underline hover:text-ink">
            Shelf
          </Link>
          <Link href="/compare" className="link-underline hover:text-ink">
            Compare
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <AIStatus />
          <AuthButton />
          <Link href="/#library" className="btn-primary px-5 py-2 text-[13px]">
            Enter
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
