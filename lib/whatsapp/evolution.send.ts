// FILE: lib/whatsapp/evolution.send.ts
//
// Outbound WhatsApp conversational messages through Evolution API.
// Used by the Chatwoot → ANU AI → WhatsApp bridge.
//
// SECURITY:
// - Never log the Evolution API key.
// - Never log full API responses.
// - Uses the configured Evolution instance.
// - FAIL-CLOSED CONFIGURATION: EVOLUTION_API_URL has NO localhost
//   fallback. If the URL or API key is missing, the send fails with a
//   deterministic "evolution api not configured" error so production
//   can never silently attempt a local transport. See
//   lib/whatsapp/evolution.config.ts.

import {
  getEvolutionApiKey,
  getEvolutionApiUrl,
  getEvolutionInstance,
} from "./evolution.config";

const MAX_TEXT_LENGTH = 4096;
const REQUEST_TIMEOUT_MS = 15_000;

export type EvolutionSendResult =
  | {
      ok: true;
      messageId: string | null;
    }
  | {
      ok: false;
      error: string;
    };

export async function sendEvolutionWhatsAppText(
  phone: string,
  text: string
): Promise<EvolutionSendResult> {
  const EVOLUTION_URL = getEvolutionApiUrl();
  const apiKey = getEvolutionApiKey();
  const instance = getEvolutionInstance();

  if (!EVOLUTION_URL || !apiKey) {
    // Deterministic fail-closed error. Production must never fall back
    // to a local transport — the lookup is explicit and env-driven only.
    console.error(
      "[Evolution Send] Evolution API is not configured " +
        "(EVOLUTION_API_URL and EVOLUTION_API_KEY are required)"
    );

    return {
      ok: false,
      error: "evolution api not configured",
    };
  }

  if (!phone || !text) {
    return {
      ok: false,
      error: "phone and text are required",
    };
  }

  const number = phone.replace(/\D/g, "");

  if (!number) {
    return {
      ok: false,
      error: "invalid phone",
    };
  }

  const body =
    text.length > MAX_TEXT_LENGTH
      ? `${text.slice(0, MAX_TEXT_LENGTH - 3)}...`
      : text;

  const url =
    `${EVOLUTION_URL.replace(/\/$/, "")}` +
    `/message/sendText/${encodeURIComponent(instance)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number,
        text: body,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const rawText = await response.text();

    if (!response.ok) {
      let reason = `HTTP ${response.status}`;

      try {
        const parsed = JSON.parse(rawText) as {
          response?: {
            message?: unknown;
          };
        };

        const message = parsed.response?.message;

        if (typeof message === "string") {
          reason += `: ${message.slice(0, 300)}`;
        }
      } catch {
        // Keep status-only reason.
      }

      console.error(
        `[Evolution Send] failed: ${reason}`
      );

      return {
        ok: false,
        error: reason,
      };
    }

    let messageId: string | null = null;

    try {
      const parsed = JSON.parse(rawText) as {
        key?: {
          id?: string;
        };
      };

      messageId = parsed.key?.id ?? null;
    } catch {
      // 2xx response with unexpected shape.
    }

    return {
      ok: true,
      messageId,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "unknown network error";

    console.error(
      `[Evolution Send] network failure: ${message}`
    );

    return {
      ok: false,
      error: message,
    };
  }
}