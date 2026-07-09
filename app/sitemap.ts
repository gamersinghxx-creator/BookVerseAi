import type { MetadataRoute } from "next";
import { books } from "@/lib/books";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/shelf", "/compare"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
  }));
  const bookRoutes = books.map((b) => ({
    url: `${base}/book/${b.slug}`,
    lastModified: now,
  }));
  return [...staticRoutes, ...bookRoutes];
}
