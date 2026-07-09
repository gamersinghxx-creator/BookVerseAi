"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import type { Book } from "@/lib/types";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

// Live AI tutor. Streams grounded answers from /api/chat (Ollama when
// available, grounded mock otherwise). Restyled for the Liquid Light palette.
export function AITutor({ book }: { book: Book }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: `Hi! I'm your tutor for "${book.title}". Ask me anything about it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.text }));
    history.push({ role: "user", content: q });

    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: book.slug, messages: history }),
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
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", text: "Sorry, I couldn't reach the tutor. Please try again." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex h-[440px] flex-col overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-4">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl text-crimson-ink"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,46,85,0.28), rgba(255,255,255,0.5))" }}
        >
          <Sparkles size={16} />
        </span>
        <div>
          <p className="font-grotesk text-sm font-semibold text-ink">Your AI tutor</p>
          <p className="text-xs text-ink-faint">Grounded in this book</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "text-white"
                    : "border border-ink/10 bg-paper/70 text-ink"
                }`}
                style={m.role === "user" ? { background: "linear-gradient(120deg,#ff2e55,#ff6e88)" } : undefined}
              >
                {m.text || (busy && i === messages.length - 1 ? "..." : "")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <div className="border-t border-ink/10 px-5 py-4">
        <div className="mb-2.5 flex flex-wrap gap-2">
          {book.qa.slice(0, 2).map((p) => (
            <button
              key={p.q}
              onClick={() => send(p.q)}
              disabled={busy}
              className="pill hover:border-ink/25 hover:text-ink disabled:opacity-40"
            >
              {p.q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this book..."
            className="flex-1 rounded-full border border-ink/12 bg-paper/70 px-4 py-2.5 font-grotesk text-sm text-ink outline-none placeholder:text-ink-faint focus:border-crimson/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="btn-primary grid h-11 w-11 place-items-center rounded-full p-0 disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
