import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/chat/systemPrompt";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 400;
const MAX_MESSAGES = 12;
const MAX_USER_CHARS = 500;
const MAX_ASSISTANT_CHARS = 2000;
// Generous ceiling for 12 maximum-length messages plus JSON overhead, so an
// oversized body is turned away before we parse it.
const MAX_BODY_BYTES = 64 * 1024;

const isDev = process.env.NODE_ENV === "development";

// Reads ANTHROPIC_API_KEY from the server environment.
const client = new Anthropic();

type ChatMessage = { role: "user" | "assistant"; content: string };

function json(body: unknown, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

const badRequest = () => json({ error: "bad_request" }, 400);

/**
 * Returns the validated messages, or null if the body breaks any rule. Only
 * `messages` is accepted at the top level and only `role` + `content` per
 * message, so the client can never set the model, token limit, or system
 * prompt.
 */
function parseMessages(body: unknown): ChatMessage[] | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  const keys = Object.keys(body);
  if (keys.length !== 1 || keys[0] !== "messages") return null;

  const { messages } = body as { messages: unknown };
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return null;
  }

  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (typeof m !== "object" || m === null || Array.isArray(m)) return null;
    const mKeys = Object.keys(m);
    if (mKeys.length !== 2 || !mKeys.includes("role") || !mKeys.includes("content")) return null;

    const { role, content } = m as { role: unknown; content: unknown };
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.trim().length === 0) return null;
    if (content.length > (role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)) return null;

    out.push({ role, content });
  }

  // The API requires the conversation to start with the visitor, and the
  // model only answers when the visitor spoke last.
  if (out[0].role !== "user" || out[out.length - 1].role !== "user") return null;
  return out;
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return badRequest();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest();
  }
  const messages = parseMessages(body);
  if (!messages) return badRequest();

  // Open the upstream stream before answering, so auth, overload, and
  // rate-limit errors from Anthropic still become a clean 502.
  let upstream: Awaited<ReturnType<typeof openStream>>;
  try {
    upstream = await openStream(messages, request.signal);
  } catch (err) {
    logUpstreamError(err);
    return json({ error: "upstream" }, 502);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const usage = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
      try {
        for await (const event of upstream) {
          if (event.type === "message_start") {
            const u = event.message.usage;
            usage.input = u.input_tokens;
            usage.cacheWrite = u.cache_creation_input_tokens ?? 0;
            usage.cacheRead = u.cache_read_input_tokens ?? 0;
          } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          } else if (event.type === "message_delta") {
            usage.output = event.usage.output_tokens;
          }
        }
        if (isDev) {
          console.log(
            `[chat] input_tokens=${usage.input} cache_creation_input_tokens=${usage.cacheWrite} ` +
              `cache_read_input_tokens=${usage.cacheRead} output_tokens=${usage.output}`
          );
        }
        controller.close();
      } catch (err) {
        // Headers are already sent, so the status can't change. Erroring the
        // stream makes the client's reader throw, and the widget shows its
        // generic error. Nothing from the upstream error reaches the client.
        logUpstreamError(err);
        controller.error(new Error("upstream"));
      }
    },
    cancel() {
      // Visitor closed the panel or navigated away: stop paying for tokens.
      upstream.controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

function openStream(messages: ChatMessage[], signal: AbortSignal) {
  return client.messages.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
      stream: true,
    },
    { signal }
  );
}

// Logs only the status and error class. Never the request, the key, or the
// full upstream message.
function logUpstreamError(err: unknown) {
  if (err instanceof Anthropic.APIError) {
    console.error(`[chat] upstream error: ${err.constructor.name} status=${err.status ?? "none"}`);
  } else if (err instanceof Error && err.name === "AbortError") {
    // Client went away; not worth logging as an error.
  } else {
    console.error(`[chat] upstream error: ${err instanceof Error ? err.name : typeof err}`);
  }
}
