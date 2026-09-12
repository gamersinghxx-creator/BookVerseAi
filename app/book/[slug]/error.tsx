"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/observability";
import { Button } from "@/components/ui";

export default function BookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "book", digest: error.digest });
  }, [error]);

  return (
    <div className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <h1 className="display text-h3 font-bold text-ink">
          This page couldn&apos;t be painted
        </h1>
        <p className="mx-auto mt-2 max-w-prose text-body text-ink-soft">
          Something went wrong loading this book.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Button href="/#library" variant="ghost">
            Back to library
          </Button>
        </div>
      </div>
    </div>
  );
}
