// FILE: lib/ai/client.ts
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

  const content = response.choices[0]?.message?.content || "";
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