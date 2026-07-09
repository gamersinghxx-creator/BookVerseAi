import type { AIProvider, ChatMessage, GenerateOptions } from "./types";

// A single provider for any OpenAI-compatible chat API. Covers:
//   • Groq    — https://api.groq.com/openai/v1
//   • Gemini  — https://generativelanguage.googleapis.com/v1beta/openai
//   • OpenAI  — https://api.openai.com/v1
//   • ...and anything else that speaks POST /chat/completions (OpenRouter,
//     Together, DeepSeek, Mistral, local vLLM, etc.)
//
// Configured entirely from lib/ai/config.ts, so switching providers/models is
// just an env change. Never throws from available(); call sites degrade to the
// grounded mock on any error.

export interface OpenAICompatConfig {
  name: string; // provider label, e.g. "groq" | "gemini"
  baseUrl: string; // no trailing slash needed
  apiKey: string;
  model: string;
}

export class OpenAICompatProvider implements AIProvider {
  readonly name: string;
  private base: string;
  private apiKey: string;
  private model: string;

  constructor(cfg: OpenAICompatConfig) {
    this.name = cfg.name;
    this.base = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
    this.model = cfg.model;
  }

  // A configured key is treated as available; real errors surface at call time
  // and are handled by the route's graceful fallback. Keeps the health poll
  // cheap and free of quota usage.
  async available(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async *chatStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const res = await fetch(`${this.base}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      signal: opts.signal,
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        temperature: opts.temperature ?? 0.7,
      }),
    });
    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      throw new Error(`${this.name} chat failed: ${res.status} ${body}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Server-Sent Events: lines like `data: {json}` separated by blank lines.
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line || !line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const obj = JSON.parse(payload);
          const chunk: string = obj?.choices?.[0]?.delta?.content ?? "";
          if (chunk) yield chunk;
        } catch {
          // Ignore keep-alives / partial frames.
        }
      }
    }
  }

  async complete(prompt: string, opts: GenerateOptions = {}): Promise<string> {
    const res = await fetch(`${this.base}/chat/completions`, {
      method: "POST",
      headers: this.headers(),
      signal: opts.signal,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        temperature: opts.temperature ?? 0.6,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${this.name} generate failed: ${res.status} ${body}`);
    }
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "");
  }
}
