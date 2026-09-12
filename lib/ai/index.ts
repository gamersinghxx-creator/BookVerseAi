import { aiConfig, resolveCloud } from "./config";
import { OllamaProvider } from "./ollama";
import { OpenAICompatProvider } from "./openai-compat";
import type { AIProvider } from "./types";

export * from "./types";
export { buildTutorMessages, buildGenerationPrompt } from "./prompts";
export { mockTutorAnswer, mockGeneratedBook } from "./mock";
export { normalizeGeneratedBook } from "../schemas";

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
  modelReady: boolean; // model confirmed usable (pulled for Ollama; listed for cloud)
  verified: boolean; // whether we could actually enumerate models to check
  models: string[]; // available models (Ollama: pulled; cloud: account-visible)
}

// getStatus() calls the provider's /models endpoint; cache the result briefly so
// the health poll (every ~15s per client) doesn't hammer it.
let statusCache: { value: AIStatus; at: number } | null = null;
const STATUS_TTL_MS = 30_000;

async function computeStatus(): Promise<AIStatus> {
  if (aiConfig.provider === "mock") {
    return { provider: "mock", available: false, model: aiConfig.model, modelReady: false, verified: true, models: [] };
  }

  // Hosted, OpenAI-compatible provider (Groq / Gemini / OpenAI / custom).
  const cloud = resolveCloud();
  if (cloud) {
    if (!cloud.apiKey || !cloud.baseUrl || !cloud.model) {
      return { provider: cloud.name, available: false, model: cloud.model || "(unset)", modelReady: false, verified: true, models: [] };
    }
    const models = await new OpenAICompatProvider(cloud).models();
    const verified = models.length > 0;
    // Optimistic when the provider exposes no /models endpoint; strict when it does.
    const modelReady = verified ? models.includes(cloud.model) : true;
    return { provider: cloud.name, available: true, model: cloud.model, modelReady, verified, models };
  }

  // Local Ollama.
  const ollama = new OllamaProvider();
  const available = await ollama.available();
  if (!available) {
    return { provider: "mock", available: false, model: aiConfig.model, modelReady: false, verified: true, models: [] };
  }
  const models = await ollama.models();
  const base = aiConfig.model.split(":")[0];
  const modelReady = models.some((m) => m === aiConfig.model || m.split(":")[0] === base);
  return { provider: "ollama", available: true, model: aiConfig.model, modelReady, verified: true, models };
}

// Reports whether live AI is available - powers the UI status badge and the
// /api/health endpoint.
export async function getStatus(): Promise<AIStatus> {
  const now = Date.now();
  if (statusCache && now - statusCache.at < STATUS_TTL_MS) return statusCache.value;
  const value = await computeStatus();
  statusCache = { value, at: now };
  return value;
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
