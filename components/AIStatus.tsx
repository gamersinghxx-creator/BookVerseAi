"use client";

import { useEffect, useState } from "react";

interface Status {
  provider: string;
  available: boolean;
  model: string;
  modelReady: boolean;
}

// Small live badge showing which AI backend is active (Ollama or a hosted
// provider like Groq / Gemini). Polls the health endpoint so the dot reflects
// the current state.
export function AIStatus() {
  const [s, setS] = useState<Status | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/health")
        .then((r) => r.json())
        .then((d) => alive && setS(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!s) return null;

  const isOllama = s.provider === "ollama";
  const live = s.available && s.modelReady;
  const color = live ? "#2ECB7C" : s.available ? "#FFB13D" : "#8A7C74";
  const label = live
    ? `AI live · ${s.model.split(":")[0]}`
    : s.available
      ? "Model not pulled"
      : "Preview mode";
  const title = live
    ? `Connected to ${s.provider} (${s.model})`
    : s.available
      ? `Ollama is running but "${s.model}" isn't pulled. Run: ollama pull ${s.model}`
      : isOllama
        ? "Ollama not detected - using offline preview. Start Ollama for real AI."
        : "No AI provider configured - using offline preview. Set AI_PROVIDER + an API key.";

  return (
    <span
      title={title}
      className="hidden items-center gap-1.5 font-grotesk text-xs text-ink-soft sm:inline-flex"
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 0 3px ${color}22` }}
      />
      {label}
    </span>
  );
}
