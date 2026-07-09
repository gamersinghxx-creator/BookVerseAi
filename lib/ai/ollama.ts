import { aiConfig } from "./config";
import type { AIProvider, ChatMessage, GenerateOptions } from "./types";

// Minimal Ollama client using the native fetch API. Talks to the local
// Ollama server's /api/chat (streaming NDJSON) and /api/generate endpoints.
// Docs: https://github.com/ollama/ollama/blob/main/docs/api.md

export class OllamaProvider implements AIProvider {
  readonly name = "ollama";
  private base = aiConfig.ollamaBaseUrl.replace(/\/$/, "");
  private model = aiConfig.model;

  async available(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), aiConfig.probeTimeoutMs);
      const res = await fetch(`${this.base}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(t);
      return res.ok;
    } catch {
      return false;
    }
  }

  // Names of models the local Ollama has pulled (e.g. "llama3.2:latest").
  async models(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), aiConfig.probeTimeoutMs);
      const res = await fetch(`${this.base}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.models)
        ? data.models.map((m: { name: string }) => m.name)
        : [];
    } catch {
      return [];
    }
  }

  async *chatStream(
    messages: ChatMessage[],
    opts: GenerateOptions = {}
  ): AsyncIterable<string> {
    const res = await fetch(`${this.base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: opts.signal,
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: true,
        options: { temperature: opts.temperature ?? 0.7 },
      }),
    });
    if (!res.ok || !res.body) {
      throw new Error(`Ollama chat failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line) continue;
        try {
          const obj = JSON.parse(line);
          const chunk: string = obj?.message?.content ?? "";
          if (chunk) yield chunk;
        } catch {
          // Ignore malformed partial lines.
        }
      }
    }
  }

  async complete(prompt: string, opts: GenerateOptions = {}): Promise<string> {
    const res = await fetch(`${this.base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: opts.signal,
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
        format: opts.json ? "json" : undefined,
        options: { temperature: opts.temperature ?? 0.6 },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 404) {
        throw new Error(
          `Ollama model "${this.model}" not found. Run: ollama pull ${this.model}`
        );
      }
      throw new Error(`Ollama generate failed: ${res.status} ${body}`);
    }
    const data = await res.json();
    return String(data?.response ?? "");
  }
}
