import { cache } from "react";
import { getBookBySlug } from "@/lib/store";

// Request-deduped book lookup shared by the segment's layout, page, and
// generateMetadata so a single render touches the store once.
export const loadBook = cache((slug: string) => getBookBySlug(slug));
