import type { Book } from "../types";
import type { ChatMessage } from "./types";

// Builds a grounding system prompt so the tutor answers from the book only.
export function buildTutorSystemPrompt(book: Book): string {
  const lessons = book.lessons.map((l) => `- ${l.title}: ${l.detail}`).join("\n");
  const chapters = book.chapters
    .map((c) => `${c.number}. ${c.title} - ${c.summary}`)
    .join("\n");
  return [
    `You are an AI tutor for the book "${book.title}" by ${book.author}.`,
    `Answer strictly using the material below. If a question is not covered, say so briefly and steer back to the book. Keep answers concise, friendly, and educational. Do not reproduce long verbatim passages; summarize in your own words.`,
    ``,
    `OVERVIEW:\n${book.overview}`,
    ``,
    `SUMMARY:\n${book.summary.join("\n")}`,
    ``,
    `KEY LESSONS:\n${lessons}`,
    ``,
    `CHAPTERS:\n${chapters}`,
  ].join("\n");
}

export function buildTutorMessages(
  book: Book,
  history: ChatMessage[]
): ChatMessage[] {
  return [
    { role: "system", content: buildTutorSystemPrompt(book) },
    ...history.filter((m) => m.role !== "system"),
  ];
}

// Prompt that asks the model to return a Book-shaped JSON object.
// Slug, cover, rating, readingTime and cached are filled in by the server.
export function buildGenerationPrompt(title: string): string {
  return [
    `Create an educational, transformative study guide for the book titled "${title}".`,
    `Return ONLY a JSON object (no markdown, no commentary) with EXACTLY these keys:`,
    `{`,
    `  "title": string,`,
    `  "author": string,`,
    `  "year": string,`,
    `  "category": "fiction" | "non-fiction",`,
    `  "tags": string[3],`,
    `  "tagline": string,`,
    `  "overview": string,`,
    `  "summary": string[3],`,
    `  "chapters": { "number": number, "title": string, "summary": string }[4-6],`,
    `  "lessons": { "title": string, "detail": string }[4],`,
    `  "timeline": { "label": string, "title": string, "detail": string }[5],`,
    `  "characters": { "name": string, "role": string, "description": string, "connections": string[] }[],`,
    `  "mindMap": { "id": string, "label": string, "parent": string | null }[],`,
    `  "sketches": { "caption": string, "emoji": string }[3],`,
    `  "qa": { "q": string, "a": string }[3]`,
    `}`,
    ``,
    `Rules:`,
    `- "characters" must be [] for non-fiction, and 3-5 items for fiction.`,
    `- "mindMap" must have exactly one node with "parent": null (the root), and 4-8 child nodes referencing valid parent ids.`,
    `- "emoji" is a single relevant emoji.`,
    `- Write summaries transformatively; never reproduce copyrighted text verbatim.`,
    `- Keep it accurate to the real book if known; if unknown, produce a plausible, clearly-general guide.`,
  ].join("\n");
}
