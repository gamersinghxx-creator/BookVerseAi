import { getBookBySlug } from "@/lib/store";
import {
  getProvider,
  buildTutorMessages,
  mockTutorAnswer,
  type ChatMessage,
} from "@/lib/ai";

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

export async function POST(req: Request) {
  let body: { slug?: string; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const slug = body.slug ?? "";
  const history = Array.isArray(body.messages) ? body.messages : [];
  const book = await getBookBySlug(slug);
  if (!book) return new Response("Book not found", { status: 404 });

  const lastUser =
    [...history].reverse().find((m) => m.role === "user")?.content ?? "";

  const provider = await getProvider();

  // Fallback: no live model reachable -> stream the grounded mock answer.
  if (!provider) {
    return new Response(streamText(mockTutorAnswer(book, lastUser)), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-AI-Provider": "mock",
      },
    });
  }

  const messages = buildTutorMessages(book, history);
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.chatStream(messages, {
          temperature: 0.6,
        })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        // If the model errors mid-stream, degrade gracefully.
        controller.enqueue(
          encoder.encode(mockTutorAnswer(book, lastUser))
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-AI-Provider": provider.name,
    },
  });
}
