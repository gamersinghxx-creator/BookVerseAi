"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[80vh] place-items-center px-5 text-center">
      <div>
        <p className="display text-6xl font-black ink-gradient">oops</p>
        <h1 className="display mt-4 text-2xl font-bold text-ink">
          A bloom went astray
        </h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Something interrupted the painting. Try again in a moment.
        </p>
        <button onClick={reset} className="btn-primary mt-8">
          Try again
        </button>
      </div>
    </div>
  );
}
