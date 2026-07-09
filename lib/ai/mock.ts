import type { Book } from "@/lib/types";

// Offline fallbacks used when no live AI runtime (Ollama) is reachable, so the
// features still work in a demo. These mirror what a real model would return.

// Keyword-matches a question against the book's pre-baked Q&A.
export function mockTutorAnswer(book: Book, question: string): string {
  const q = question.toLowerCase();
  let best: { score: number; a: string } | null = null;
  for (const pair of book.qa) {
    const words = pair.q
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    const score = words.reduce((s, w) => (q.includes(w) ? s + 1 : s), 0);
    if (!best || score > best.score) best = { score, a: pair.a };
  }
  if (best && best.score > 0) return best.a;
  return `That's a good question about "${book.title}". I don't have that detail in my notes for this book, but I can help with its main ideas, key lessons, themes, or characters.`;
}

const TONES = [
  "from-plum-500 to-gold-500",
  "from-gold-500 to-ink-800",
  "from-plum-600 to-ink-800",
];

// A templated, clearly-generic Book for when generation runs without a model.
export function mockGeneratedBook(title: string): Omit<Book, "slug"> {
  const t = title.trim();
  return {
    title: t,
    author: "Unknown author",
    year: "n/a",
    category: "non-fiction",
    tags: ["Generated", "Preview", "Study guide"],
    cover: { emoji: "📘", tone: TONES[0] },
    tagline: `An AI study guide for "${t}".`,
    readingTime: "8 min read",
    rating: 4.2,
    cached: false,
    overview: `This is a preview study guide for "${t}", generated without a live AI model. Connect Ollama to produce a full, book-specific summary. The structure below shows what a generated guide contains.`,
    summary: [
      `A live model would open here with a transformative overview of "${t}": its central argument or story, who it is for, and why it matters.`,
      `The middle section would develop the book's main themes and how they build on one another.`,
      `The closing section would synthesize the takeaways and connect them to the reader's own goals.`,
    ],
    chapters: [
      { number: 1, title: "Introduction", summary: "Sets up the premise and central question." },
      { number: 2, title: "Core ideas", summary: "Develops the main themes with examples." },
      { number: 3, title: "Application", summary: "Turns ideas into practice." },
      { number: 4, title: "Conclusion", summary: "Synthesizes the argument and its implications." },
    ],
    lessons: [
      { title: "Lesson one", detail: "A key takeaway a live model would extract from the book." },
      { title: "Lesson two", detail: "Another central idea, explained in a sentence or two." },
      { title: "Lesson three", detail: "A practical principle the reader can apply." },
      { title: "Lesson four", detail: "A closing insight that ties the book together." },
    ],
    timeline: [
      { label: "Start", title: "Premise", detail: "The book establishes its central question." },
      { label: "Build", title: "Development", detail: "Ideas or events accumulate." },
      { label: "Turn", title: "Pivot", detail: "A key shift reframes what came before." },
      { label: "Rise", title: "Climax", detail: "The argument or story reaches its peak." },
      { label: "End", title: "Resolution", detail: "The takeaways are drawn together." },
    ],
    characters: [],
    mindMap: [
      { id: "root", label: t, parent: null },
      { id: "themes", label: "Themes", parent: "root" },
      { id: "ideas", label: "Key Ideas", parent: "root" },
      { id: "apply", label: "Application", parent: "root" },
      { id: "context", label: "Context", parent: "root" },
    ],
    sketches: [
      { caption: "Concept sketch one", emoji: "🖼️", tone: TONES[0] },
      { caption: "Concept sketch two", emoji: "✏️", tone: TONES[1] },
      { caption: "Concept sketch three", emoji: "🎨", tone: TONES[2] },
    ],
    qa: [
      { q: "What is this book about?", a: `Connect a live model to get a specific answer about "${t}". This preview shows the format.` },
      { q: "Who should read it?", a: "A generated guide would describe the ideal reader here." },
      { q: "What is the main takeaway?", a: "A generated guide would summarize the single most important idea." },
    ],
  };
}
