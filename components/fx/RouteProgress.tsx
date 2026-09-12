"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// A thin top progress bar for route transitions — the lightweight replacement
// for a full-screen loading.tsx (which was removed because its Suspense boundary
// made notFound() return HTTP 200). Shows on same-origin link clicks, completes
// when the pathname changes. No dependency; the bar itself respects
// prefers-reduced-motion via the global CSS transition override.
export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const a = (e.target as HTMLElement | null)?.closest("a");
      const href = a?.getAttribute("href");
      if (
        !a ||
        !href ||
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href === pathname
      ) {
        return;
      }
      setState("loading");
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  // Pathname changed → the navigation resolved.
  useEffect(() => {
    setState((s) => (s === "loading" ? "done" : "idle"));
    const t = setTimeout(() => setState("idle"), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  if (state === "idle") return null;

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[90] h-0.5 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-crimson via-sky to-iris transition-[width,opacity] ease-out"
        style={
          state === "loading"
            ? { width: "82%", opacity: 1, transitionDuration: "8s" }
            : { width: "100%", opacity: 0, transitionDuration: "220ms" }
        }
      />
    </div>
  );
}
