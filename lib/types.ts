// Core domain types for BookVerse AI.
// These mirror the shape a real AI-generation backend would return,
// so the UI can later swap mock data for live API responses with no changes.

export interface Chapter {
  number: number;
  title: string;
  summary: string;
}

export interface Lesson {
  title: string;
  detail: string;
}

export interface TimelineEvent {
  label: string;      // e.g. "1808" or "Act I"
  title: string;
  detail: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
  // ids of connected characters (for the relationship map)
  connections: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  // parent id, or null for the root
  parent: string | null;
}

export interface Sketch {
  caption: string;
  // A simple emoji/gradient placeholder stands in for AI-generated art.
  emoji: string;
  tone: string; // tailwind gradient class fragment, e.g. "from-plum-500 to-gold-500"
}

export interface Book {
  slug: string;
  title: string;
  author: string;
  year: string;
  category: "fiction" | "non-fiction";
  tags: string[];
  cover: { emoji: string; tone: string };
  tagline: string;
  readingTime: string;   // e.g. "12 min read"
  rating: number;        // 0-5
  cached: boolean;       // demonstrates the "generate once, serve forever" model

  overview: string;
  summary: string[];     // paragraphs of the structured summary
  chapters: Chapter[];
  lessons: Lesson[];
  timeline: TimelineEvent[];
  characters: Character[];      // empty for pure non-fiction
  mindMap: MindMapNode[];
  sketches: Sketch[];
  // Pre-baked Q&A pairs the mock "AI tutor" can answer.
  qa: { q: string; a: string }[];
}
