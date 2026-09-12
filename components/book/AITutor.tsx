"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Square, RotateCcw, Eraser } from "lucide-react";
import type { Book } from "@/lib/types";
import { Markdown } from "@/lib/markdown";

interface Msg {
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

// Live AI tutor. Streams grounded answers from /api/chat (a hosted model when
// configured, a grounded mock otherwise). The conversation persists per book.
export function AITutor({ book }: { book: Book }) {
  const greeting = `Hi! I'm your tutor for "${book.title}". Ask me anything about it.`;
  const storeKey = `bookverse:tutor:${book.slug}`;

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestionRef = useRef<string>("");
  const hydrated = useRef(false);

  // Restore a saved conversation once, on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const saved = JSON.parse(raw) as Msg[];
        if (Array.isArray(saved) && saved.length > 1) setMessages(saved);
      }
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, [storeKey]);

  // Persist after every settled change (not mid-stream).
  useEffect(() => {
    if (!hydrated.current || busy) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify(messages.filter((m) => !m.error)));
    } catch {
      /* ignore */
    }
  }, [messages, busy, storeKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function clearChat() {
    abortRef.current?.abort();
    setMessages([{ role: "assistant", text: greeting }]);
    try {
      localStorage.removeItem(storeKey);
    } catch {
      /* ignore */
    }
  }

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      lastQuestionRef.current = q;
      setInput("");
      setBusy(true);

      const history = messages
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.text }));
      history.push({ role: "user", content: q });

      setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: "" }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: book.slug, messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", text: copy[copy.length - 1].text + chunk };
            return copy;
          });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last.role === "assistant" && !last.text) copy.pop();
            return copy;
          });
        } else {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              text: "I couldn't reach the tutor. Try again in a moment.",
              error: true,
            };
            return copy;
          });
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [book.slug, busy, messages],
  );

  const stop = () => abortRef.current?.abort();
  const retry = () => {
    setMessages((m) => m.filter((x) => !x.error).slice(0, -1));
    void send(lastQuestionRef.current);
  };

  const lastIsError = messages[messages.length - 1]?.error;

  return (
    <div className="card flex h-[440px] flex-col overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-4">
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center rounded-xl text-crimson-ink"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,46,85,0.28), rgba(255,255,255,0.5))" }}
        >
          <Sparkles size={16} />
        </span>
        <div className="flex-1">
          <p className="font-grotesk text-body-sm font-semibold text-ink">Your AI tutor</p>
          <p className="text-xs text-ink-faint">Grounded in this book</p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition hover:bg-ink/5 hover:text-ink"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Eraser size={15} aria-hidden />
          </button>
        )}
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto px-6 py-5"
        aria-live="polite"
        aria-busy={busy}
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ y: 6 }}
              animate={{ y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-body-sm ${
                  m.role === "user"
                    ? "whitespace-pre-wrap text-white"
                    : m.error
                      ? "border border-crimson/30 bg-crimson/5 text-crimson-ink"
                      : "border border-ink/10 bg-paper/70 text-ink"
                }`}
                style={m.role === "user" ? { background: "linear-gradient(120deg,#ff2e55,#ff6e88)" } : undefined}
              >
                {m.role === "assistant" && m.text && !m.error ? (
                  <Markdown text={m.text} />
                ) : (
                  m.text || (busy && i === messages.length - 1 ? "…" : "")
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="border-t border-ink/10 px-5 py-4">
        <div className="mb-2.5 flex flex-wrap gap-2">
          {lastIsError ? (
            <button onClick={retry} className="pill hover:border-ink/25 hover:text-ink">
              <RotateCcw size={12} aria-hidden /> Try again
            </button>
          ) : (
            book.qa.slice(0, 2).map((p) => (
              <button
                key={p.q}
                onClick={() => send(p.q)}
                disabled={busy}
                className="pill hover:border-ink/25 hover:text-ink disabled:opacity-40"
              >
                {p.q}
              </button>
            ))
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this book…"
            aria-label={`Ask the tutor about ${book.title}`}
            className="flex-1 rounded-field border border-ink/12 bg-paper/70 px-4 py-2.5 font-grotesk text-body-sm text-ink outline-none placeholder:text-ink-faint focus:border-crimson/50"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              className="btn-ghost grid h-11 w-11 place-items-center rounded-full p-0"
              aria-label="Stop"
            >
              <Square size={15} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-primary grid h-11 w-11 place-items-center rounded-full p-0 disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} aria-hidden />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
