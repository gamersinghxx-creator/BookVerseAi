import { notFound } from "next/navigation";
import {
  BookText,
  ListChecks,
  Clock3,
  Network,
  Users,
  Palette,
  MessageCircleQuestion,
  Layers,
} from "lucide-react";
import { getBookBySlug, seedSlugs } from "@/lib/store";
import { accentFor } from "@/lib/accents";
import { BookHeader } from "@/components/book/BookHeader";
import { Section } from "@/components/book/Section";
import { Timeline } from "@/components/book/Timeline";
import { MindMap } from "@/components/book/MindMap";
import { CharacterMap } from "@/components/book/CharacterMap";
import { Sketches } from "@/components/book/Sketches";
import { AITutor } from "@/components/book/AITutor";
import { Related } from "@/components/book/Related";

export function generateStaticParams() {
  return seedSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book not found - BookVerse AI" };
  return { title: `${book.title} - BookVerse AI`, description: book.overview };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const accent = accentFor(slug);
  const rgb = accent.rgb;

  return (
    <div className="u-container flex flex-col gap-16 pb-10 pt-32">
      <BookHeader book={book} />

      <Section id="overview" accentRgb={rgb} icon={<Layers size={20} className={accent.text} />} title="Overview">
        <p className="max-w-3xl text-xl leading-relaxed text-ink-soft">{book.overview}</p>
      </Section>

      <Section
        id="summary"
        accentRgb={rgb}
        icon={<BookText size={20} className={accent.text} />}
        title="Structured summary"
        subtitle="A transformative overview - not a substitute for the original."
      >
        <div className="max-w-3xl space-y-4">
          {book.summary.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-ink-soft">{p}</p>
          ))}
        </div>
      </Section>

      <Section id="chapters" accentRgb={rgb} icon={<Layers size={20} className={accent.text} />} title="Chapter breakdown">
        <div className="grid gap-4 sm:grid-cols-2">
          {book.chapters.map((c) => (
            <div key={c.number} className="card p-5">
              <div className="flex items-start gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-grotesk text-sm font-bold text-ink"
                  style={{ background: `rgba(${rgb},0.14)` }}
                >
                  {c.number}
                </span>
                <div>
                  <h4 className="font-grotesk font-semibold text-ink">{c.title}</h4>
                  <p className="mt-0.5 text-sm text-ink-soft">{c.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="lessons" accentRgb={rgb} icon={<ListChecks size={20} className={accent.text} />} title="Key lessons">
        <div className="grid gap-4 sm:grid-cols-2">
          {book.lessons.map((l, i) => (
            <div key={i} className="card p-6">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span
                  className="grid h-7 w-7 place-items-center rounded-lg font-grotesk text-xs font-bold text-white"
                  style={{ background: `rgb(${rgb})` }}
                >
                  {i + 1}
                </span>
                <h4 className="font-grotesk font-semibold text-ink">{l.title}</h4>
              </div>
              <p className="text-sm text-ink-soft">{l.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="sketches"
        accentRgb={rgb}
        icon={<Palette size={20} className={accent.text} />}
        title="Conceptual sketches"
        subtitle="AI concept art capturing the book's essence."
      >
        <Sketches sketches={book.sketches} />
      </Section>

      <Section
        id="timeline"
        accentRgb={rgb}
        icon={<Clock3 size={20} className={accent.text} />}
        title="Timeline"
        subtitle={book.category === "fiction" ? "How the story unfolds." : "How the ideas build."}
      >
        <Timeline events={book.timeline} accentRgb={rgb} />
      </Section>

      {book.characters.length > 0 && (
        <Section
          id="characters"
          accentRgb={rgb}
          icon={<Users size={20} className={accent.text} />}
          title="Character map"
          subtitle="Tap a character to explore their connections."
        >
          <CharacterMap characters={book.characters} accentRgb={rgb} />
        </Section>
      )}

      <Section
        id="mindmap"
        accentRgb={rgb}
        icon={<Network size={20} className={accent.text} />}
        title="Mind map"
        subtitle="The book's core concepts, visually connected."
      >
        <div className="card p-5">
          <MindMap nodes={book.mindMap} />
        </div>
      </Section>

      <Section
        id="tutor"
        accentRgb={rgb}
        icon={<MessageCircleQuestion size={20} className={accent.text} />}
        title="Ask the tutor"
        subtitle="Questions answered from the book."
      >
        <AITutor book={book} />
      </Section>

      <Related slug={slug} category={book.category} tags={book.tags} />

      <p className="border-t border-ink/10 pt-8 text-center text-xs text-ink-faint">
        A transformative summary of a public-domain or user-requested work.
        Please support authors and publishers by reading the original.
      </p>
    </div>
  );
}
