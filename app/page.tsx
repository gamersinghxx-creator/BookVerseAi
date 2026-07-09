import { Hero } from "@/components/Hero";
import { Library } from "@/components/Library";
import { Story } from "@/components/Story";
import { listAllBooks } from "@/lib/store";

// Rendered per request so the library reflects the live database, including
// books summoned since the last visit.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const books = await listAllBooks();
  return (
    <>
      <Hero />
      <Library books={books} />
      <Story />
    </>
  );
}
