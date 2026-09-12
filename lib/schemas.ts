import { z } from "zod";
import type { Book } from "./types";

// Zod schemas: API request validation + tolerant normalisation of AI-generated
// book JSON. Kept in one place so the API contract and the domain shape have a
// single source of truth.

// ---- API request inputs --------------------------------------------------

export const GenerateInput = z.object({
  title: z.string().trim().min(1, "A title is required").max(200, "Title is too long"),
  /** Re-generate a previously generated book (never a seed book). */
  force: z.boolean().optional(),
});
export type GenerateInput = z.infer<typeof GenerateInput>;

export const ChatMessageInput = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().max(8_000),
});

export const ChatInput = z.object({
  slug: z.string().min(1).max(120),
  messages: z.array(ChatMessageInput).min(1, "At least one message is required").max(40),
});
export type ChatInput = z.infer<typeof ChatInput>;

// ---- AI output normalisation -------------------------------------------
// Model output is untrusted: fields may be missing, wrong-typed, or over-long.
// Every field has a fallback so the UI can never break on imperfect JSON.

const clamp = (v: string, max: number) => (v.length > max ? v.slice(0, max) : v);

// A tolerant string: missing / wrong type -> fallback; over-long -> truncated.
const str = (max: number, fallback = "") =>
  z
    .unknown()
    .optional()
    .transform((v) => (typeof v === "string" ? clamp(v.trim(), max) : ""))
    .transform((v) => v || fallback);

// A tolerant string array: keeps only non-empty strings, capped in count + length.
const strArray = (max: number, itemMax: number) =>
  z
    .unknown()
    .optional()
    .transform((v) => (Array.isArray(v) ? (v as unknown[]) : []))
    .transform((v) =>
      v
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .slice(0, max)
        .map((x) => clamp(x.trim(), itemMax)),
    );

// A tolerant array of objects, capped in count.
const objList = (max: number) =>
  z
    .unknown()
    .optional()
    .transform((v) => (Array.isArray(v) ? (v as unknown[]).slice(0, max) : []));

const RawChapter = z.object({
  number: z.coerce.number().int().positive().catch(0),
  title: str(160, "Untitled chapter"),
  summary: str(1_200),
});

const RawLesson = z.object({
  title: str(160, "Lesson"),
  detail: str(800),
});

const RawTimelineEvent = z.object({
  label: str(60, "Step"),
  title: str(160),
  detail: str(600),
});

const RawCharacter = z.object({
  name: str(120),
  role: str(80, "Character"),
  description: str(600),
  connections: strArray(12, 120),
});

const RawMindMapNode = z.object({
  id: str(80),
  label: str(120),
  parent: z
    .unknown()
    .optional()
    .transform((v) => (typeof v === "string" && v.trim() ? v.trim() : null)),
});

const RawQA = z.object({ q: str(240, "Question"), a: str(1_200) });

const RawBook = z.object({
  title: str(200),
  author: str(160, "Unknown author"),
  year: str(40, "n/a"),
  category: z
    .unknown()
    .optional()
    .transform((v): Book["category"] => (v === "fiction" ? "fiction" : "non-fiction")),
  tags: strArray(4, 40),
  tagline: str(240),
  overview: str(4_000, "No overview was produced."),
  summary: strArray(6, 1_500),
  chapters: objList(12),
  lessons: objList(10),
  timeline: objList(12),
  characters: objList(8),
  mindMap: objList(40),
  sketches: objList(3),
  qa: objList(6),
});

function parseList<T>(items: unknown[], schema: z.ZodType<T>, withIndex = false): T[] {
  return items
    .map((item, i) => {
      const base =
        withIndex && item && typeof item === "object" && !Array.isArray(item)
          ? { number: i + 1, ...item }
          : item;
      const r = schema.safeParse(base);
      return r.success ? r.data : null;
    })
    .filter((x): x is T => x !== null);
}

// Repairs the mind map so exactly one root exists and every parent reference is
// valid — otherwise the radial renderer breaks or silently drops branches.
function repairMindMap(
  nodes: { id: string; label: string; parent: string | null }[],
  rootLabel: string,
): { id: string; label: string; parent: string | null }[] {
  const seen = new Set<string>();
  const clean = nodes.filter((n) => {
    if (!n.id || !n.label || seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });

  if (clean.length === 0) {
    return [{ id: "root", label: rootLabel || "Overview", parent: null }];
  }

  const rootCandidates = clean.filter((n) => n.parent === null || !seen.has(n.parent));
  const rootId =
    rootCandidates.length === 1
      ? rootCandidates[0].id
      : clean.some((n) => n.id === "root")
        ? "root"
        : clean[0].id;

  return clean.map((n) =>
    n.id === rootId
      ? { id: n.id, label: n.label, parent: null }
      : {
          id: n.id,
          label: n.label,
          parent: n.parent && seen.has(n.parent) && n.parent !== n.id ? n.parent : rootId,
        },
  );
}

// Coerce arbitrary parsed JSON into a valid, fully-populated Book. `slug` and
// the presentation fields (cover, rating, readingTime, cached) are set here.
export function normalizeGeneratedBook(raw: unknown, slug: string): Book {
  const b = RawBook.parse(raw && typeof raw === "object" ? raw : {});
  const title = b.title || slug;

  const chapters = parseList(b.chapters, RawChapter, true).map((c, i) => ({
    ...c,
    number: c.number > 0 ? c.number : i + 1,
  }));

  const mindMap = repairMindMap(parseList(b.mindMap, RawMindMapNode), title);
  const characters =
    b.category === "fiction" ? parseList(b.characters, RawCharacter) : [];

  return {
    slug,
    title,
    author: b.author,
    year: b.year,
    category: b.category,
    tags: b.tags.length ? b.tags : ["Generated", "Study guide"],
    cover: { emoji: pickEmoji(b.sketches, b.category) },
    tagline: b.tagline || `An AI study guide for "${title}".`,
    readingTime: "9 min read",
    rating: 4.4,
    cached: true,
    overview: b.overview,
    summary: b.summary,
    chapters,
    lessons: parseList(b.lessons, RawLesson),
    timeline: parseList(b.timeline, RawTimelineEvent),
    characters,
    mindMap,
    sketches: parseList(
      b.sketches,
      z.object({ caption: str(200, "Concept sketch"), emoji: str(8, "🖼️") }),
    ),
    qa: parseList(b.qa, RawQA),
  };
}

function pickEmoji(sketches: unknown[], category: Book["category"]): string {
  const first = sketches[0];
  if (first && typeof first === "object" && "emoji" in first) {
    const e = (first as { emoji?: unknown }).emoji;
    if (typeof e === "string" && e) return e;
  }
  return category === "fiction" ? "📖" : "📘";
}
