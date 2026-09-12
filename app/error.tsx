"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "route", digest: error.digest });
  }, [error]);

  return (
    <div className="grid min-h-[80vh] place-items-center px-5 text-center">
      <div>
        <p className="display ink-gradient text-6xl font-black">oops</p>
        <h1 className="display mt-4 text-h3 font-bold text-ink">A bloom went astray</h1>
        <p className="mx-auto mt-2 max-w-prose text-body text-ink-soft">
          Something interrupted the painting. Try again in a moment.
        </p>
        <button onClick={reset} className="btn-primary mt-8">
          Try again
        </button>
      </div>
    </div>
  );
}
