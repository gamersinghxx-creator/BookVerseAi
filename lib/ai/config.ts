// AI runtime configuration, all overridable via environment variables.
// See .env.example. Defaults target a local Ollama install; set AI_PROVIDER to
// a cloud provider (groq / gemini / openai / openai-compat) to use a hosted API.

export const aiConfig = {
  // "ollama" | "mock" | "groq" | "gemini" | "openai" | "openai-compat".
  // When a provider is selected but has no key / is unreachable, callers
  // gracefully fall back to the mock provider at runtime.
  provider: process.env.AI_PROVIDER ?? "ollama",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  // A small, fast, widely available model by default (Ollama).
  model: process.env.OLLAMA_MODEL ?? "llama3.2",
  // Milliseconds to wait when probing Ollama availability.
  probeTimeoutMs: Number(process.env.AI_PROBE_TIMEOUT_MS ?? 1500),
};

export type AIConfig = typeof aiConfig;

// ---- Hosted (OpenAI-compatible) providers ---------------------------------

// Presets: base URL + key env var + a sensible default model. Every field is
// overridable via env so you can switch models without code changes.
export const cloudPresets = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    keyEnv: "GROQ_API_KEY",
    // Verified live on Groq (2026-09). Supports JSON mode. Older Llama 3.x
    // "versatile"/"instant" models were decommissioned — override with GROQ_MODEL
    // if your account has a different set (see GET /openai/v1/models).
    defaultModel: "openai/gpt-oss-120b",
  },
  gemini: {
    // Gemini's OpenAI-compatibility endpoint.
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyEnv: "GEMINI_API_KEY",
    defaultModel: "gemini-2.0-flash",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    keyEnv: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
  },
} as const;

export type CloudProviderName = keyof typeof cloudPresets;

export interface ResolvedCloud {
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

// Resolves the active cloud provider from AI_PROVIDER, or null when the
// selected provider isn't a cloud one (e.g. "ollama"/"mock"). Model and base
// URL fall back: provider-specific env -> generic LLM_* env -> preset default.
export function resolveCloud(): ResolvedCloud | null {
  const p = aiConfig.provider;

  // Named preset (groq / gemini / openai).
  const preset = cloudPresets[p as CloudProviderName];
  if (preset) {
    const upper = p.toUpperCase();
    return {
      name: p,
      baseUrl: process.env.LLM_BASE_URL ?? preset.baseUrl,
      model:
        process.env[`${upper}_MODEL`] ??
        process.env.LLM_MODEL ??
        preset.defaultModel,
      apiKey: process.env[preset.keyEnv] ?? process.env.LLM_API_KEY ?? "",
    };
  }

  // Generic OpenAI-compatible endpoint driven entirely by LLM_* vars.
  if (p === "openai-compat") {
    return {
      name: "openai-compat",
      baseUrl: process.env.LLM_BASE_URL ?? "",
      model: process.env.LLM_MODEL ?? "",
      apiKey: process.env.LLM_API_KEY ?? "",
    };
  }

  return null;
}
