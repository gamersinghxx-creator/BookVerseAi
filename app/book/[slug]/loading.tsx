export default function BookLoading() {
  return (
    <div className="u-container flex flex-col gap-10 pb-10 pt-32" aria-busy>
      <span className="sr-only">Loading book…</span>
      <div className="flex flex-col gap-8 md:flex-row md:items-end">
        <div className="h-36 w-36 shrink-0 animate-breathe rounded-panel bg-ink/5" />
        <div className="flex-1 space-y-4">
          <div className="h-4 w-24 rounded bg-ink/10" />
          <div className="h-14 w-3/4 rounded-2xl bg-ink/10" />
          <div className="h-4 w-1/2 rounded bg-ink/10" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-breathe rounded-card bg-ink/5"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
