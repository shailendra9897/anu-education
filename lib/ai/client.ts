// FILE: lib/ai/client.ts
//
// FIXED vs submitted version:
//
//   ❌ BUG: qwen/qwen3.6-27b is a "thinking" model — it emits its
//      full chain-of-thought wrapped in <think>...</think> BEFORE
//      the actual answer, and Groq returns that concatenated
//      directly into response.choices[0].message.content (not in a
//      separate reasoning field). Without stripping it, the raw
//      internal monologue was being saved to the DB as the
//      assistant's message AND sent straight to the student.
//
//   ✅ FIX: stripThinkingTags() removes the <think>...</think> block
//      (and, separately, handles a truncated/unclosed <think> tag —
//      e.g. if maxTokens cuts the response off mid-thought, a naive
//      "match open+close tag" regex would let the entire raw
//      reasoning block through untouched since there's no closing
//      tag to match against). Applied once, here, so every caller
//      of generateChatCompletion() gets clean output automatically —
//      route.ts doesn't need its own stripping logic, and neither
//      will any future consumer of this client.
//
//   💡 WORTH CHECKING SEPARATELY: some reasoning models served via
//      Groq support a `reasoning_format` request parameter (e.g.
//      "hidden" or "parsed") that stops the thinking tokens from
//      being generated into `content` at all — cleaner and cheaper
//      than generating them and stripping after the fact. Not added
//      here since parameter support varies per model and an
//      unsupported field could cause Groq to reject the request
//      outright — worth confirming against Groq's current docs for
//      qwen/qwen3.6-27b specifically before adding it. The regex
//      strip below works regardless of whether that parameter exists
//      or is honoured, so it's the safe baseline either way.
// ─────────────────────────────────────────────────────────────────

import OpenAI from "openai";

// ── Configuration ──────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.6-27b";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 10000;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables.");
}

// Point standard OpenAI SDK to Groq's endpoint
const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ── Types ──────────────────────────────────────────────────────────
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type StreamChatCompletionParams = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  onError?: (error: Error) => void;
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

// ── Strip <think>...</think> reasoning blocks ─────────────────────
// Qwen3 "thinking" models emit their chain-of-thought inline in the
// content field. This must never reach the student or get saved as
// the assistant's message.
function stripThinkingTags(content: string): string {
  if (!content) return content;

  // Case 1: a complete, closed <think>...</think> block — remove it
  // entirely (including any it happens to appear more than once,
  // hence the global flag). [\s\S] instead of . with /s so it
  // matches across newlines without needing the dotAll flag.
  let cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "");

  // Case 2: an UNCLOSED <think> tag — e.g. maxTokens cut the
  // response off mid-reasoning, so there's no closing tag for the
  // regex above to match against, and the entire raw thought block
  // would otherwise leak through untouched. If we still see an
  // opening tag after case 1 ran, drop everything from that point
  // onward — there is no valid answer left to recover from a
  // truncated thinking block anyway.
  const unclosedIndex = cleaned.search(/<think>/i);
  if (unclosedIndex !== -1) {
    cleaned = cleaned.slice(0, unclosedIndex);
  }

  return cleaned.trim();
}

// ── Retry logic with exponential backoff ──────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;

    const isRetryable =
      error?.status === 500 ||
      error?.status === 502 ||
      error?.status === 503 ||
      error?.status === 504 ||
      error?.code === "ECONNRESET" ||
      error?.code === "ETIMEDOUT";

    if (!isRetryable) throw error;

    const backoff = Math.min(delay * 2, MAX_RETRY_DELAY_MS);
    console.warn(`[AI] Retryable error, retrying in ${backoff}ms...`, error.message);
    await new Promise((resolve) => setTimeout(resolve, backoff));
    return withRetry(fn, retries - 1, backoff);
  }
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Generate Completion using Groq ──────────────────────────────────
export async function generateChatCompletion(
  params: Omit<StreamChatCompletionParams, "onToken" | "onError">
): Promise<{ content: string; usage: TokenUsage }> {
  const { messages, model = GROQ_MODEL, temperature = 0.3, maxTokens = 2000 } = params;

  const response = await withRetry(async () => {
    return groq.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
    });
  });

  const rawContent = response.choices[0]?.message?.content || "";
  // ✅ FIX applied here — every caller gets clean, thinking-free content.
  const content = stripThinkingTags(rawContent);

  const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  return {
    content,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    },
  };
}

const aiClient = {
  generateChatCompletion,
  estimateTokenCount,
};

export default aiClient;
