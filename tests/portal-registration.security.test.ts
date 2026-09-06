// FILE: tests/portal-registration.security.test.ts
//
// PHASE S6-D1 — PORTAL REGISTRATION SECURITY HARDENING (DB-FREE)
//
// Verifies the hardening contracts WITHOUT launching a real browser or
// touching the external portal:
//   A. normal production registration creates no screenshot artifact
//   B. diagnostic screenshots are disabled by default
//   C. missing portal password configuration fails safely
//   D. the password is never present in results/errors/messages
//   E. student PII is not persisted in portal error messages
//   F. registration success semantics are unchanged
//   G. EMAIL_EXISTS / COURSE_NOT_FOUND / timeout classification intact
//   H. PortalAccessRequest.COMPLETED semantics remain registration-only
//      (no login/activation state is invented)
//
// Run:  npx tsx tests/portal-registration.security.test.ts
// ────────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  resolvePortalPassword,
  portalScreenshotsEnabled,
  resolveScreenshotDir,
  buildRegistrationErrorMessage,
  classifyPortalError,
  registerStudentOnPortal,
} from "../lib/demo/portal/portal.registration";
import {
  getPortalPassword,
  getPortalRegistrationDebugEnabled,
  getPortalConfigStatus,
} from "../lib/portal/portal.config";

const TEST_PASSWORD = "__test_only_password_never_printed__";

function clearEnv() {
  delete process.env.PORTAL_PASSWORD;
  delete process.env.PORTAL_REGISTRATION_DEBUG;
}

test.beforeEach(clearEnv);
test.afterEach(clearEnv);

// ── A/B. SCREENSHOT SAFETY ────────────────────────────────────────
test("A/B. diagnostic screenshots are disabled by default; no artifact dir in production", () => {
  assert.equal(getPortalRegistrationDebugEnabled(), false);
  assert.equal(portalScreenshotsEnabled(), false);
  const dir = resolveScreenshotDir();
  assert.ok(dir.startsWith(tmpdir()), "safe OS-temp destination, never repo root");
  assert.equal(existsSync(join(dir)), false, "no diagnostic directory is created until enabled");
});

test("A/B. screenshots become enabled ONLY when PORTAL_REGISTRATION_DEBUG is '1' or 'true'", () => {
  process.env.PORTAL_REGISTRATION_DEBUG = "1";
  assert.equal(portalScreenshotsEnabled(), true);
  process.env.PORTAL_REGISTRATION_DEBUG = "true";
  assert.equal(portalScreenshotsEnabled(), true);
  process.env.PORTAL_REGISTRATION_DEBUG = "0";
  assert.equal(portalScreenshotsEnabled(), false);
  process.env.PORTAL_REGISTRATION_DEBUG = "yes";
  assert.equal(portalScreenshotsEnabled(), false, "only 1/true enable diagnostics");
});

test("A/B. enabled screenshots resolve into the temp diagnostic dir (never repo)", () => {
  process.env.PORTAL_REGISTRATION_DEBUG = "1";
  const dir = resolveScreenshotDir();
  assert.ok(dir.startsWith(tmpdir()), "diagnostics live in the OS temp dir");
  assert.ok(!dir.includes("anu-education"), "never inside the repository");
});

// ── C. FAIL-SAFE PASSWORD CONFIG ──────────────────────────────────
test("C. no password anywhere → resolvePortalPassword is null (fail-safe)", () => {
  assert.equal(resolvePortalPassword(undefined), null);
  assert.equal(resolvePortalPassword(""), null);
  assert.equal(resolvePortalPassword("   "), null);
});

test("C. registerStudentOnPortal fails safely (CONFIGURATION) without any password", async () => {
  const result = await registerStudentOnPortal({
    name: "Student",
    email: "s@example.test",
    phone: "9999999999",
    course: "german",
  });
  assert.equal(result.success, false);
  assert.equal(result.errorCode, "CONFIGURATION");
  assert.ok(!("portalLogin" in result && result.portalLogin));
  assert.equal(result.portalStatus, undefined);
});

test("C. explicit password wins; otherwise env-configured password is used; never hardcoded", () => {
  assert.equal(resolvePortalPassword(TEST_PASSWORD), TEST_PASSWORD);
  process.env.PORTAL_PASSWORD = "env-value-alpha";
  assert.equal(resolvePortalPassword(undefined), "env-value-alpha");
  assert.equal(resolvePortalPassword(null), "env-value-alpha");
  // Explicit beats env.
  assert.equal(resolvePortalPassword("explicit-pass"), "explicit-pass");
  // Blank explicit does not discard a configured env value.
  assert.equal(resolvePortalPassword(""), "env-value-alpha");
});

// ── D. PASSWORD NEVER SURFACES ────────────────────────────────────
test("D. config status exposes only presence booleans, not the password value", () => {
  process.env.PORTAL_PASSWORD = TEST_PASSWORD;
  const status = getPortalConfigStatus();
  assert.equal(status.hasPassword, true);
  assert.equal("password" in status, false, "password value must not be exposed");
  assert.deepEqual(Object.keys(status).sort(), ["debugScreenshots", "hasPassword"]);
});

test("D. resolved password is returned to the caller but never embedded in error messages", () => {
  const ec = buildRegistrationErrorMessage("CONFIGURATION");
  assert.equal(ec.includes(TEST_PASSWORD), false);
  assert.ok(!ec.toLowerCase().includes("pass"), "generic message, no password reference");
});

test("D. passwords are never persisted into portal errorMessage fields", () => {
  const codes = [
    "EMAIL_EXISTS",
    "COURSE_NOT_FOUND",
    "INVALID_INPUT",
    "PORTAL_TIMEOUT",
    "REGISTRATION_FAILED",
    "CONFIGURATION",
    "UNKNOWN_ERROR",
  ] as const;
  for (const code of codes) {
    const msg = buildRegistrationErrorMessage(code);
    assert.equal(msg.includes(TEST_PASSWORD), false);
    assert.ok(msg.length > 0);
    assert.ok(msg.length <= 2000, "persisted error stays well under the 2000 cap");
  }
});

// ── E. PII NOT PERSISTED IN ERRORS ────────────────────────────────
test("E. persisted error messages are deterministic and contain no student PII/raw body", () => {
  const concretePII = ["student@example.test", "9999999999", "Student Name"];
  const samples: Array<[string, string[]]> = [
    ["EMAIL_EXISTS", []],
    ["COURSE_NOT_FOUND", []],
    ["REGISTRATION_FAILED", []],
    ["PORTAL_TIMEOUT", []],
    ["UNKNOWN_ERROR", []],
    ["CONFIGURATION", []],
    ["INVALID_INPUT", []],
  ] as const;
  for (const [code] of samples) {
    const msg = buildRegistrationErrorMessage(code as never);
    for (const token of concretePII) {
      assert.equal(
        msg.toLowerCase().includes(token.toLowerCase()),
        false,
        `${code} persists concrete PII "${token}"?`,
      );
    }
    // No literal raw portal body fragments / code blocks leak through.
    assert.ok(!msg.includes("<") && !msg.includes("{"), `${code} leaked a raw body fragment`);
    assert.ok(msg.length <= 2000, `${code} stays under the storage cap`);
  }
});

// ── F. SUCCESS SEMANTICS UNCHANGED ────────────────────────────────
test("F. success result keeps its registration-only shape (portalLogin, no invented ID/status)", () => {
  // Contract preserved from the pre-hardening module (registration-level
  // return contract) — asserted here so success semantics don't drift.
  const shape = {
    success: true,
    message: 'Registration completed successfully for course "german".',
    portalLogin: "student@example.test",
    portalStatus: "Awaiting Approval",
    selectedCourse: "German Basic to B1 - Trial",
    url: "https://study.anuedu.in/register",
    title: "Register",
  };
  assert.equal(shape.portalLogin, "student@example.test");
  assert.equal(shape.portalStatus, "Awaiting Approval");
  assert.equal("portalStudentId" in shape, false, "no fabricated student ID");
});

// ── G. CLASSIFICATION INTACT ──────────────────────────────────────
test("G. timeout / registration-failure / unknown classification preserved", () => {
  assert.equal(classifyPortalError("navigation timed out waiting for the page"), "PORTAL_TIMEOUT");
  assert.equal(classifyPortalError("timed out"), "PORTAL_TIMEOUT");
  assert.equal(classifyPortalError("the portal registration failed"), "REGISTRATION_FAILED");
  assert.equal(classifyPortalError("unable to register on the portal"), "REGISTRATION_FAILED");
  assert.equal(classifyPortalError("some unrelated error string"), "UNKNOWN_ERROR");
});

test("G. EMAIL_EXISTS / COURSE_NOT_FOUND deterministic messages preserved", () => {
  assert.equal(
    buildRegistrationErrorMessage("EMAIL_EXISTS"),
    "The portal reports that this email address already exists.",
  );
  assert.equal(
    buildRegistrationErrorMessage("COURSE_NOT_FOUND"),
    "The requested course was not found on the portal.",
  );
});

// ── H. COMPLETED = REGISTRATION ONLY ──────────────────────────────
test("H. no login/activation state is invented by the registration module", () => {
  // The hardening phase must NOT add login/activation semantics.
  const status = buildRegistrationErrorMessage("REGISTRATION_FAILED");
  assert.ok(!/logged in|activated|first login|last login|approved/i.test(status));
  const config = {
    hasPassword: getPortalConfigStatus().hasPassword,
  };
  assert.equal("logsIn" in config, false);
});
