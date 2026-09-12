import { getBookBySlug } from "@/lib/store";
import {
  getProvider,
  buildTutorMessages,
  mockTutorAnswer,
} from "@/lib/ai";
import { route, parseJson, notFound } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";
import { ChatInput } from "@/lib/schemas";
import { errMeta } from "@/lib/log";
import { track } from "@/lib/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

function streamText(text: string): ReadableStream {
  // Emit the mock answer word-by-word so the client sees a typing effect.
  const words = text.split(/(\s+)/);
  let i = 0;
  return new ReadableStream({
    pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(words[i++]));
    },
  });
}

export const POST = route("chat", { limit: LIMITS.chat }, async (req, ctx) => {
  const { slug, messages } = await parseJson(req, ChatInput);

  const book = await getBookBySlug(slug);
  if (!book) throw notFound("No book matches that slug");
  track("tutor.ask", { slug, turns: messages.length });

  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const provider = await getProvider();

  // Fallback: no live model reachable -> stream the grounded mock answer.
  if (!provider) {
    return new Response(streamText(mockTutorAnswer(book, lastUser)), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-AI-Provider": "mock",
        "x-request-id": ctx.requestId,
      },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let produced = 0;
      try {
        for await (const chunk of provider.chatStream(buildTutorMessages(book, messages), {
          temperature: 0.6,
        })) {
          produced += chunk.length;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        ctx.log.warn("chat.stream_failed", { slug, provider: provider.name, produced, ...errMeta(err) });
        // If the model errors before producing anything, degrade to the grounded
        // mock. If it already streamed text, end cleanly rather than contradict it.
        if (produced === 0) {
          controller.enqueue(encoder.encode(mockTutorAnswer(book, lastUser)));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-AI-Provider": provider.name,
      "x-request-id": ctx.requestId,
    },
  });
});
