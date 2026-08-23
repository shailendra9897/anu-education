// FILE: lib/chatwoot/config.ts
//
// ─────────────────────────────────────────────────────────────────
// Chatwoot integration configuration accessors (Task 6B).
//
// Mirrors the lazy-read pattern of lib/whatsapp/config.ts so cold
// starts pick up fresh env values and tests can inject configuration
// before exercising consumers.
//
// Canonical variables (observe-only phase):
//
//   CHATWOOT_WEBHOOK_SECRET → secret carried in the URL path segment
//                             (/api/webhook/chatwoot/<secret>) and
//                             configured on the Chatwoot webhook.
//   CHATWOOT_INBOX_ID       → numeric inbox hosting the WhatsApp API
//                             channel. Default: 1.
//
// NOTE: no Chatwoot API token is required in this phase — the module
// never calls the Chatwoot API.
//
// SECURITY: these values must NEVER be logged. Only a boolean
// presence helper is exposed for diagnostics.
// ─────────────────────────────────────────────────────────────────

const DEFAULT_INBOX_ID = 1;

export function getChatwootWebhookSecret(): string | null {
  const secret = process.env.CHATWOOT_WEBHOOK_SECRET;
  return secret && secret.length > 0 ? secret : null;
}

export function getChatwootInboxId(): number {
  const raw = process.env.CHATWOOT_INBOX_ID;
  if (!raw) return DEFAULT_INBOX_ID;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INBOX_ID;
}

export function getChatwootConfigStatus(): {
  hasWebhookSecret: boolean;
  inboxId: number;
} {
  return {
    hasWebhookSecret: Boolean(getChatwootWebhookSecret()),
    inboxId: getChatwootInboxId(),
  };
}
