import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-ink/10">
      <div className="u-container flex flex-col items-center justify-between gap-4 py-10 text-body-sm text-ink-soft md:flex-row">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-sky mix-blend-multiply" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-crimson mix-blend-multiply" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-leaf mix-blend-multiply" />
          <span className="ml-2 font-grotesk font-semibold text-ink">BookVerse AI</span>
        </div>

        <nav className="flex items-center gap-5 font-grotesk text-body-sm">
          <Link href="/#library" className="link-underline hover:text-ink">Library</Link>
          <Link href="/shelf" className="link-underline hover:text-ink">Shelf</Link>
          <Link href="/compare" className="link-underline hover:text-ink">Compare</Link>
        </nav>

        <p className="max-w-md text-center text-xs text-ink-faint md:text-right">
          Transformative summaries painted in light — made to help you understand
          books, never to replace reading them.
        </p>
      </div>
    </footer>
  );
}
