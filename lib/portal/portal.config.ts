// FILE: lib/portal/portal.config.ts
//
// ─────────────────────────────────────────────────────────────────
// Portal registration configuration accessors.
//
// Mirrors the lazy-read pattern of lib/whatsapp/config.ts so cold
// starts pick up fresh env values and tests can inject configuration
// before exercising consumers.
//
// Canonical variable names:
//
//   PORTAL_PASSWORD            → the registration password used when an
//                                explicit password is not supplied at
//                                call time. This is a SINGLE shared
//                                demo/registration credential — never a
//                                per-student secret.
//   PORTAL_REGISTRATION_DEBUG  → "1" | "true" enables OPT-IN diagnostic
//                                screenshots (safe temp destination) for
//                                registration troubleshooting. Default OFF:
//                                the production path creates zero
//                                screenshot artifacts.
//
// SECURITY INVARIANTS:
//   • These accessors must NEVER be logged or echoed. Only boolean
//     presence helpers are exposed for diagnostics.
//   • A returned password must never be stored in Prisma, in notes /
//     errorMessage, in screenshots, in test output, or returned through
//     an API/admin response.
// ─────────────────────────────────────────────────────────────────

/** The registration password value (see PORTAL_PASSWORD above). */
export function getPortalPassword(): string | null {
  const value = process.env.PORTAL_PASSWORD;
  return value && value.trim().length > 0 ? value : null;
}

/**
 * Whether the registration password is configured. Boolean-only — the
 * value itself is never exposed here for diagnostics.
 */
export function hasPortalPassword(): boolean {
  return getPortalPassword() !== null;
}

/**
 * Whether OPT-IN diagnostic screenshots are enabled.
 *
 * Parses PORTAL_REGISTRATION_DEBUG ∈ { "1", "true" }. Everything else —
 * including ABSENT — means OFF, so the default production registration
 * path never writes a screenshot artifact.
 */
export function getPortalRegistrationDebugEnabled(): boolean {
  const value = process.env.PORTAL_REGISTRATION_DEBUG;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
}

export function getPortalConfigStatus(): {
  hasPassword: boolean;
  debugScreenshots: boolean;
} {
  return {
    hasPassword: hasPortalPassword(),
    debugScreenshots: getPortalRegistrationDebugEnabled(),
  };
}
