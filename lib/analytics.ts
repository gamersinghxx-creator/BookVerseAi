"use client";

// Client-side event tracking. A no-op unless analytics is configured
// (see components/Analytics.tsx). Use for the conversion funnel: search →
// summon → book view → tutor.
type Props = Record<string, string | number | boolean>;

interface PlausibleWindow {
  plausible?: (event: string, opts?: { props?: Props }) => void;
}

export function track(event: string, props?: Props) {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as PlausibleWindow).plausible;
  if (typeof fn === "function") {
    fn(event, props ? { props } : undefined);
  }
}
