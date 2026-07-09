import { relatedBooks } from "@/lib/related";
import { BookOrb } from "@/components/BookOrb";

// "Continue wandering" - content-based recommendations from the seed library.
export function Related({
  slug,
  category,
  tags,
}: {
  slug: string;
  category: string;
  tags: string[];
}) {
  const picks = relatedBooks({ slug, category, tags }, 3);
  if (picks.length === 0) return null;

  return (
    <section className="scroll-mt-28">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="display text-2xl font-bold text-ink md:text-3xl">
          Continue wandering
        </h2>
        <a href="/#library" className="link-underline font-grotesk text-sm text-ink-soft hover:text-ink">
          All books
        </a>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((b, i) => (
          <BookOrb key={b.slug} book={b} index={i} />
        ))}
      </div>
    </section>
  );
}
