// Shared AI types. Kept provider-agnostic so the app never depends on a
// specific runtime (Ollama today; a hosted API or .NET backend later).

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GenerateOptions {
  temperature?: number;
  // Ask the model to return JSON (Ollama supports format: "json").
  json?: boolean;
  signal?: AbortSignal;
}

export interface AIProvider {
  readonly name: string;
  // Cheap health check; should resolve quickly and never throw.
  available(): Promise<boolean>;
  // Stream a chat completion as plain text chunks.
  chatStream(
    messages: ChatMessage[],
    opts?: GenerateOptions
  ): AsyncIterable<string>;
  // One-shot completion, returns the full text.
  complete(prompt: string, opts?: GenerateOptions): Promise<string>;
}
