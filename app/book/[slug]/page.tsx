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
import { seedSlugs, isSeedSlug } from "@/lib/store";
import { isAdminUser } from "@/lib/admin";
import { accentFor } from "@/lib/accents";
import { BookHeader } from "@/components/book/BookHeader";
import { GuideActions } from "@/components/book/GuideActions";
import { Section } from "@/components/book/Section";
import { Timeline } from "@/components/book/Timeline";
import { MindMap } from "@/components/book/MindMap";
import { CharacterMap } from "@/components/book/CharacterMap";
import { Sketches } from "@/components/book/Sketches";
import { AITutor } from "@/components/book/AITutor";
import { Related } from "@/components/book/Related";
import { loadBook } from "./_data";

export function generateStaticParams() {
  return seedSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await loadBook(slug);
  if (!book) return { title: "Book not found — BookVerse AI" };
  return {
    title: `${book.title} — BookVerse AI`,
    description: book.overview.slice(0, 160),
  };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await loadBook(slug);
  if (!book) notFound();

  const accent = accentFor(slug);
  const rgb = accent.rgb;
  const seed = isSeedSlug(slug);
  const admin = seed ? false : await isAdminUser();

  return (
    <div className="u-container flex flex-col gap-16 pb-10 pt-32">
      <BookHeader book={book} />

      <Section id="overview" accentRgb={rgb} icon={<Layers size={20} className={accent.text} />} title="Overview">
        <p className="max-w-prose text-lead leading-relaxed text-ink-soft">{book.overview}</p>
      </Section>

      {book.summary.length > 0 && (
        <Section
          id="summary"
          accentRgb={rgb}
          icon={<BookText size={20} className={accent.text} />}
          title="Structured summary"
          subtitle="A transformative overview — not a substitute for the original."
        >
          <div className="max-w-prose space-y-4">
            {book.summary.map((p, i) => (
              <p key={i} className="text-lead leading-relaxed text-ink-soft">{p}</p>
            ))}
          </div>
        </Section>
      )}

      {book.chapters.length > 0 && (
        <Section id="chapters" accentRgb={rgb} icon={<Layers size={20} className={accent.text} />} title="Chapter breakdown">
          <div className="grid gap-4 sm:grid-cols-2">
            {book.chapters.map((c) => (
              <div key={c.number} className="card p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl font-grotesk text-body-sm font-bold text-ink"
                    style={{ background: `rgba(${rgb},0.14)` }}
                  >
                    {c.number}
                  </span>
                  <div>
                    <h3 className="font-grotesk font-semibold text-ink">{c.title}</h3>
                    <p className="mt-0.5 text-body-sm text-ink-soft">{c.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {book.lessons.length > 0 && (
        <Section id="lessons" accentRgb={rgb} icon={<ListChecks size={20} className={accent.text} />} title="Key lessons">
          <div className="grid gap-4 sm:grid-cols-2">
            {book.lessons.map((l, i) => (
              <div key={i} className="card p-6">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="grid h-7 w-7 place-items-center rounded-lg font-grotesk text-xs font-bold text-white"
                    style={{ background: `rgb(${rgb})` }}
                  >
                    {i + 1}
                  </span>
                  <h3 className="font-grotesk font-semibold text-ink">{l.title}</h3>
                </div>
                <p className="text-body-sm text-ink-soft">{l.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {book.sketches.length > 0 && (
        <Section
          id="sketches"
          accentRgb={rgb}
          icon={<Palette size={20} className={accent.text} />}
          title="Conceptual sketches"
          subtitle="AI concept art capturing the book's essence."
        >
          <Sketches sketches={book.sketches} />
        </Section>
      )}

      {book.timeline.length > 0 && (
        <Section
          id="timeline"
          accentRgb={rgb}
          icon={<Clock3 size={20} className={accent.text} />}
          title="Timeline"
          subtitle={book.category === "fiction" ? "How the story unfolds." : "How the ideas build."}
        >
          <Timeline events={book.timeline} accentRgb={rgb} />
        </Section>
      )}

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

      {book.mindMap.length > 1 && (
        <Section
          id="mindmap"
          accentRgb={rgb}
          icon={<Network size={20} className={accent.text} />}
          title="Mind map"
          subtitle="The book's core concepts, visually connected."
        >
          <div className="card p-5">
            <MindMap nodes={book.mindMap} accentRgb={rgb} />
          </div>
        </Section>
      )}

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

      <GuideActions slug={slug} title={book.title} isSeed={seed} isAdmin={admin} />

      <p className="text-center text-xs text-ink-faint">
        A transformative summary of a public-domain or user-requested work.
        Please support authors and publishers by reading the original.
      </p>
    </div>
  );
}
