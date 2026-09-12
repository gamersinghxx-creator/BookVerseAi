import type { MetadataRoute } from "next";
import { listAllBooks } from "@/lib/store";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ["", "/shelf", "/compare"].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
  }));

  let bookRoutes: MetadataRoute.Sitemap = [];
  try {
    const books = await listAllBooks();
    bookRoutes = books.map((b) => ({
      url: `${base}/book/${b.slug}`,
      lastModified: now,
    }));
  } catch {
    // Fall back to static routes only if the store is briefly unavailable.
  }

  return [...staticRoutes, ...bookRoutes];
}
