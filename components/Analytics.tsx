import Script from "next/script";

const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";

// Privacy-friendly, cookie-free analytics. Renders nothing unless
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set. Swap for PostHog/GA by changing this file.
export function Analytics() {
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src={src}
      strategy="afterInteractive"
    />
  );
}
