// FILE: lib/whatsapp/config.ts
//
// ─────────────────────────────────────────────────────────────────
// WhatsApp Cloud API configuration accessors for the webhook layer.
//
// All values are read lazily (at call time, not module load) so that
// serverless cold starts pick up the latest env and unit tests can
// inject configuration before importing consumers.
//
// Canonical variable names (Task 19) with legacy fallbacks so the
// existing .env.local / Vercel deployment keeps working unchanged:
//
//   WHATSAPP_TOKEN              → Meta system-user access token
//   WHATSAPP_PHONE_NUMBER_ID    → falls back to legacy PHONE_NUMBER_ID
//   WHATSAPP_VERIFY_TOKEN       → falls back to legacy VERIFY_TOKEN
//   WHATSAPP_GRAPH_API_VERSION  → Graph API version (no duplication)
//   WHATSAPP_APP_SECRET         → X-Hub-Signature-256 verification
//
// SECURITY: these accessors must NEVER be logged. Only boolean
// presence helpers are exposed for diagnostics.
// ─────────────────────────────────────────────────────────────────

const DEFAULT_GRAPH_VERSION = "v21.0";

export function getWhatsAppToken(): string | null {
  return process.env.WHATSAPP_TOKEN || null;
}

export function getWhatsAppPhoneNumberId(): string | null {
  return (
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.PHONE_NUMBER_ID ||
    null
  );
}

export function getWhatsAppVerifyToken(): string | null {
  return (
    process.env.WHATSAPP_VERIFY_TOKEN ||
    process.env.VERIFY_TOKEN ||
    null
  );
}

export function getWhatsAppGraphVersion(): string {
  const version = process.env.WHATSAPP_GRAPH_API_VERSION;
  return version && /^v\d+\.\d+$/.test(version) ? version : DEFAULT_GRAPH_VERSION;
}

export function getWhatsAppAppSecret(): string | null {
  return process.env.WHATSAPP_APP_SECRET || null;
}

export function getWhatsAppConfigStatus(): {
  hasToken: boolean;
  hasPhoneNumberId: boolean;
  hasVerifyToken: boolean;
  graphVersion: string;
  hasAppSecret: boolean;
} {
  return {
    hasToken: Boolean(getWhatsAppToken()),
    hasPhoneNumberId: Boolean(getWhatsAppPhoneNumberId()),
    hasVerifyToken: Boolean(getWhatsAppVerifyToken()),
    graphVersion: getWhatsAppGraphVersion(),
    hasAppSecret: Boolean(getWhatsAppAppSecret()),
  };
}
