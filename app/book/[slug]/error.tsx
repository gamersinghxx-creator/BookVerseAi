"use client";

import Link from "next/link";

export default function BookError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <h1 className="display text-2xl font-bold text-ink">
          This page couldn&apos;t be painted
        </h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Something went wrong loading this book.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/#library" className="btn-ghost">Back to library</Link>
        </div>
      </div>
    </div>
  );
}
