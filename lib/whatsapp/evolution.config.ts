// FILE: lib/whatsapp/evolution.config.ts
//
// Evolution API configuration accessors — fail-closed equivalent of
// lib/whatsapp/config.ts (Meta) and lib/chatwoot/config.ts (Chatwoot).
//
// Canonical variables:
//
//   EVOLUTION_API_URL     → base URL of the Evolution API instance
//                           (e.g. https://evolution.anuedu.in).
//                           REQUIRED in every environment; there is NO
//                           localhost fallback. Missing → send fails.
//   EVOLUTION_API_KEY     → Evolution global/instance API key.
//                           REQUIRED in every environment. Missing →
//                           send fails.
//   EVOLUTION_INSTANCE    → Evolution instance name to send through.
//                           REQUIRED in production (fallback below is
//                           a logical default only — never a network
//                           endpoint).
//
// SECURITY: these accessors must NEVER be logged. Only boolean
// presence helpers are exposed for diagnostics.

export function getEvolutionApiUrl(): string | null {
  const value = process.env.EVOLUTION_API_URL;
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function getEvolutionApiKey(): string | null {
  const value = process.env.EVOLUTION_API_KEY;
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function getEvolutionInstance(): string {
  const value = process.env.EVOLUTION_INSTANCE;
  return value && value.trim().length > 0 ? value.trim() : "anu_education";
}

export function getEvolutionConfigStatus(): {
  hasApiUrl: boolean;
  hasApiKey: boolean;
  instance: string;
} {
  return {
    hasApiUrl: Boolean(getEvolutionApiUrl()),
    hasApiKey: Boolean(getEvolutionApiKey()),
    instance: getEvolutionInstance(),
  };
}