// FILE: tests/admin-session.test.ts
//
// Short-lived HttpOnly admin session token (CRM-UI-AUTH-FIX-01).
// Verifies issue/verify roundtrip, tamper/expiry/version fail-closed
// behaviour, and that the token never contains the admin password.
//
// Run: npx tsx tests/admin-session.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  issueAdminSession,
  signSessionToken,
  verifyAdminSession,
  containsSecretMaterial,
} from "../lib/auth/admin-session";

process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASS = "admin-secret-pass";

test("issues a token that round-trips to the authenticated username", async () => {
  const { token } = await issueAdminSession("admin");
  assert.equal(await verifyAdminSession(token), "admin");
});

test("token never contains the admin password or secret literal", async () => {
  const { token } = await issueAdminSession("admin");
  assert.equal(containsSecretMaterial(token), false);
  assert.ok(!token.includes("admin-secret-pass"));
  assert.ok(!token.includes("ADMIN_PASS"));
  assert.ok(!token.includes("password"));
});

test("session token is short-lived (TTL constant)", async () => {
  const { expiresAt } = await issueAdminSession("admin");
  assert.ok(expiresAt > Date.now());
  assert.ok(expiresAt - Date.now() <= ADMIN_SESSION_TTL_MS);
});

test("tampered payload → null (signature mismatch)", async () => {
  const { token } = await issueAdminSession("admin");
  const [encoded] = token.split(".");
  const mut =
    encoded.slice(0, 4) +
    (encoded[4] === "A" ? "B" : "A") +
    encoded.slice(5);
  const forged = `${mut}.${token.split(".")[1]}`;
  assert.equal(await verifyAdminSession(forged), null);
});

test("tampered signature → null", async () => {
  const { token } = await issueAdminSession("admin");
  const [encoded, signature] = token.split(".");
  const mut =
    signature.slice(0, signature.length - 1) +
    (signature.endsWith("AAAA") ? "BBBB" : "AAAA");
  assert.equal(await verifyAdminSession(`${encoded}.${mut}`), null);
});

test("expired token → null (fail closed)", async () => {
  const expired = await signSessionToken({
    v: "v1",
    u: "admin",
    e: Date.now() - 1000,
  });
  assert.equal(await verifyAdminSession(expired), null);
});

test("unknown token version → null", async () => {
  const wrongVersion = await signSessionToken({
    v: "v0",
    u: "admin",
    e: Date.now() + 60_000,
  });
  assert.equal(await verifyAdminSession(wrongVersion), null);
});

test("malformed / missing / empty tokens → null", async () => {
  assert.equal(await verifyAdminSession(null), null);
  assert.equal(await verifyAdminSession(undefined), null);
  assert.equal(await verifyAdminSession(""), null);
  assert.equal(await verifyAdminSession("not-a-token"), null);
  assert.equal(await verifyAdminSession("abc.def"), null);
  assert.equal(await verifyAdminSession("."), null);
});

test("empty username payload → null", async () => {
  const emptyUser = await signSessionToken({
    v: "v1",
    u: "",
    e: Date.now() + 60_000,
  });
  assert.equal(await verifyAdminSession(emptyUser), null);
});

test("cookie name is a stable HttpOnly-oriented identifier", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "anu_admin_session");
  assert.ok(!ADMIN_SESSION_COOKIE.toLowerCase().includes("secret"));
  assert.ok(!ADMIN_SESSION_COOKIE.toLowerCase().includes("password"));
});