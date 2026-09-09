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

// Point standard OpenAI SDK to Groq's endpoint.
// SINGLE RETRY POLICY (S4): maxRetries: 0 disables the SDK's intrinsic
// automatic retries (top of create(), default maxRetries=2 for 408/409/429/5xx).
// Without this, SDK retries stacked UNDER our withRetry() below multiplied a
// persistent 429 into up to ~12 underlying HTTP attempts per message. Now the
// SDK performs zero automatic retries and withRetry() is the ONE retry owner
// (429 / Retry-After / 500-504 / ECONNRESET / ETIMEDOUT) — exactly one HTTP
// attempt per withRetry attempt, no nested multiplication.
export const groq = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  maxRetries: 0,
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
  /**
   * Groq reasoning_effort — supported by qwen3.x thinking models.
   * "none" = non-thinking/instruct mode (no <think> blocks emitted).
   * Defaults to thinking mode when omitted (Groq default).
   */
  reasoningEffort?: "none" | "low" | "medium" | "high";
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
// Phase 1: 429 rate-limit responses are now RETRYABLE. Previously Groq
// rate limits bypassed the retry loop entirely (only 5xx/network codes
// were caught), so a burst would skip the 429 → release the webhook
// claim → HTTP 500 → Meta/Chatwoot immediate retry → another 429:
// a self-amplifying loop that made the TPM problem far worse.
//
// For a 429 the wait honors Groq's Retry-After header when present. All
// retryable failures get exponential backoff + jitter, bounded by
// MAX_RETRY_DELAY_MS and MAX_RETRIES so a wedged service can never stall
// a webhook indefinitely.
const HTTP_429 = 429;
const RETRYABLE_HTTP = new Set([500, 502, 503, 504]);
const RETRYABLE_CODES = new Set(["ECONNRESET", "ETIMEDOUT"]);

export function isRetryableStatus(status: number | undefined): boolean {
  return status === HTTP_429 || (status !== undefined && RETRYABLE_HTTP.has(status));
}

/** Retry-After header ("42", "42.5" seconds, or an HTTP-date) → ms. */
export function parseRetryAfterMs(error: unknown): number | null {
  const headers = (error as any)?.headers;
  if (!headers) return null;

  const header =
    typeof headers.get === "function"
      ? headers.get("retry-after")
      : headers["retry-after"] ?? headers["Retry-After"];

  if (typeof header !== "string" || header.trim() === "") return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS);
  }

  const date = Date.parse(header);
  if (Number.isFinite(date)) {
    return Math.max(0, Math.min(date - Date.now(), MAX_RETRY_DELAY_MS));
  }

  return null;
}

/** Single-delay computation: Retry-After wins; else backoff + jitter. */
export function computeRetryDelayMs(
  error: unknown,
  baseDelayMs: number
): number {
  const retryAfter = parseRetryAfterMs(error);
  if (retryAfter !== null) return retryAfter;
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(baseDelayMs + jitter, MAX_RETRY_DELAY_MS);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) throw error;

    const isRetryable =
      isRetryableStatus(error?.status) ||
      RETRYABLE_CODES.has(error?.code as string);

    if (!isRetryable) throw error;

    const waitMs = computeRetryDelayMs(error, delay);
    console.warn(
      `[AI] Retryable error (status=${error?.status ?? error?.code ?? "unknown"}), retrying in ${waitMs}ms...`,
      error.message
    );
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return withRetry(fn, retries - 1, Math.min(delay * 2, MAX_RETRY_DELAY_MS));
  }
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// ── Generate Completion using Groq ──────────────────────────────────
export async function generateChatCompletion(
  params: Omit<StreamChatCompletionParams, "onToken" | "onError">
): Promise<{ content: string; usage: TokenUsage }> {
  const {
    messages,
    model = GROQ_MODEL,
    temperature = 0.3,
    maxTokens = 2000,
    reasoningEffort,
  } = params;

  const response = await withRetry(async () => {
    return groq.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature,
      max_tokens: maxTokens,
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
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
