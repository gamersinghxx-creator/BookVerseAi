import type { Book, Character, MindMapNode } from "@/lib/types";
import { aiConfig, resolveCloud } from "./config";
import { OllamaProvider } from "./ollama";
import { OpenAICompatProvider } from "./openai-compat";
import type { AIProvider } from "./types";

export * from "./types";
export { buildTutorMessages, buildGenerationPrompt } from "./prompts";
export { mockTutorAnswer, mockGeneratedBook } from "./mock";

let cached: { provider: AIProvider | null; at: number } | null = null;
const AVAIL_TTL = 10_000;

// Returns a live provider if one is reachable, else null (callers fall back
// to mock behaviour). Availability is cached briefly to avoid probing on
// every request.
export async function getProvider(): Promise<AIProvider | null> {
  if (aiConfig.provider === "mock") return null;

  // Hosted, OpenAI-compatible provider (Groq / Gemini / OpenAI / custom).
  const cloud = resolveCloud();
  if (cloud) {
    if (!cloud.apiKey || !cloud.baseUrl || !cloud.model) return null;
    return new OpenAICompatProvider(cloud);
  }

  // Local Ollama (default). Availability cached briefly to avoid re-probing.
  const now = Date.now();
  if (cached && now - cached.at < AVAIL_TTL) return cached.provider;
  const ollama = new OllamaProvider();
  const ok = await ollama.available();
  cached = { provider: ok ? ollama : null, at: now };
  return cached.provider;
}

export interface AIStatus {
  provider: string; // active provider name (ollama | groq | gemini | ... | mock)
  available: boolean; // provider reachable / key configured
  model: string; // configured model
  modelReady: boolean; // model usable (pulled for Ollama; key present for cloud)
  models: string[]; // available models (Ollama lists pulled; cloud lists active)
}

// Reports whether live AI is available - powers the UI status badge and the
// /api/health endpoint.
export async function getStatus(): Promise<AIStatus> {
  if (aiConfig.provider === "mock") {
    return { provider: "mock", available: false, model: aiConfig.model, modelReady: false, models: [] };
  }

  // Hosted provider: "ready" means a key is configured.
  const cloud = resolveCloud();
  if (cloud) {
    const ready = Boolean(cloud.apiKey && cloud.baseUrl && cloud.model);
    return {
      provider: cloud.name,
      available: ready,
      model: cloud.model || "(unset)",
      modelReady: ready,
      models: ready ? [cloud.model] : [],
    };
  }

  // Local Ollama.
  const ollama = new OllamaProvider();
  const available = await ollama.available();
  if (!available) {
    return { provider: "mock", available: false, model: aiConfig.model, modelReady: false, models: [] };
  }
  const models = await ollama.models();
  const base = aiConfig.model.split(":")[0];
  const modelReady = models.some((m) => m === aiConfig.model || m.split(":")[0] === base);
  return { provider: "ollama", available: true, model: aiConfig.model, modelReady, models };
}

// Pulls a JSON object out of a model response that may include prose or fences.
export function extractJson(text: string): unknown {
  let s = text.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  return JSON.parse(s.slice(start, end + 1));
}

const TONES = [
  "from-plum-500 to-gold-500",
  "from-gold-500 to-ink-800",
  "from-plum-600 to-ink-800",
];

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

// Coerces arbitrary parsed JSON into a valid, fully-populated Book. Fills any
// missing/invalid fields with safe defaults and repairs the mind-map root so
// the UI never breaks on imperfect model output.
export function normalizeGeneratedBook(raw: unknown, slug: string): Book {
  const o = (raw ?? {}) as Record<string, unknown>;
  const category = o.category === "fiction" ? "fiction" : "non-fiction";

  let mindMap = asArray<MindMapNode>(o.mindMap).filter(
    (n) => n && typeof n.id === "string" && typeof n.label === "string"
  );
  if (!mindMap.some((n) => n.parent === null)) {
    const rootLabel = asString(o.title, slug);
    mindMap = [{ id: "root", label: rootLabel, parent: null }, ...mindMap];
  }

  const characters =
    category === "fiction"
      ? asArray<Character>(o.characters)
          .filter((c) => c && typeof c.name === "string")
          .map((c) => ({
            name: asString(c.name),
            role: asString(c.role, "Character"),
            description: asString(c.description),
            connections: asArray<string>(c.connections),
          }))
      : [];

  const tags = asArray<string>(o.tags).slice(0, 4);

  return {
    slug,
    title: asString(o.title, slug),
    author: asString(o.author, "Unknown author"),
    year: asString(o.year, "n/a"),
    category,
    tags: tags.length ? tags : ["Generated", "Study guide"],
    cover: { emoji: pickEmoji(o), tone: TONES[0] },
    tagline: asString(o.tagline, `An AI study guide for "${asString(o.title, slug)}".`),
    readingTime: "9 min read",
    rating: 4.4,
    cached: true,
    overview: asString(o.overview, "No overview was produced."),
    summary: asArray<string>(o.summary).filter(Boolean).slice(0, 5),
    chapters: asArray<Record<string, unknown>>(o.chapters).map((c, i) => ({
      number: typeof c.number === "number" ? c.number : i + 1,
      title: asString(c.title, `Chapter ${i + 1}`),
      summary: asString(c.summary),
    })),
    lessons: asArray<Record<string, unknown>>(o.lessons).map((l) => ({
      title: asString(l.title, "Lesson"),
      detail: asString(l.detail),
    })),
    timeline: asArray<Record<string, unknown>>(o.timeline).map((t, i) => ({
      label: asString(t.label, `Step ${i + 1}`),
      title: asString(t.title),
      detail: asString(t.detail),
    })),
    characters,
    mindMap,
    sketches: asArray<Record<string, unknown>>(o.sketches).map((s, i) => ({
      caption: asString(s.caption, "Concept sketch"),
      emoji: asString(s.emoji, "🖼️"),
      tone: asString(s.tone, TONES[i % TONES.length]),
    })),
    qa: asArray<Record<string, unknown>>(o.qa).map((p) => ({
      q: asString(p.q, "Question"),
      a: asString(p.a),
    })),
  };
}

function pickEmoji(o: Record<string, unknown>): string {
  const sketches = asArray<Record<string, unknown>>(o.sketches);
  const e = sketches[0]?.emoji;
  return typeof e === "string" && e ? e : o.category === "fiction" ? "📖" : "📘";
}
