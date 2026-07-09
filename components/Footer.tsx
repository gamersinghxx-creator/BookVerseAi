export function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-ink/10">
      <div className="u-container flex flex-col items-center justify-between gap-4 py-10 text-sm text-ink-soft md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky mix-blend-multiply" />
          <span className="h-2.5 w-2.5 rounded-full bg-crimson mix-blend-multiply" />
          <span className="h-2.5 w-2.5 rounded-full bg-leaf mix-blend-multiply" />
          <span className="ml-2 font-grotesk font-semibold text-ink">BookVerse AI</span>
        </div>
        <p className="max-w-md text-center text-xs md:text-right">
          Transformative summaries painted in light - made to help you
          understand books, never to replace reading them.
        </p>
      </div>
    </footer>
  );
}
