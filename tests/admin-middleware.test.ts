// FILE: tests/admin-middleware.test.ts
//
// Root middleware auth gate (WP-B1 + CRM-UI-AUTH-FIX-01). Calls the exported
// middleware() directly with fake NextRequest objects and asserts the HTTP
// status returned for every protected path, the public routes, the session
// cookie bridge (HTTP Basic login → HttpOnly session cookie → same-origin
// API passes), and fail-closed behaviour on tampered/expired sessions.
//
// Run: npx tsx tests/admin-middleware.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASS = "admin-secret-pass";

// next/server's middleware import is only valid via the framework
// entry in tsc; this file runs under tsx where the import is direct.
import { middleware } from "../middleware";
import {
  ADMIN_SESSION_COOKIE,
  issueAdminSession,
  signSessionToken,
} from "../lib/auth/admin-session";

function basicHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

function requestFor(
  pathname: string,
  header?: string,
  sessionToken?: string,
): NextRequest {
  const headers: Record<string, string> = {};
  if (header) headers.authorization = header;
  if (sessionToken) headers.cookie = `${ADMIN_SESSION_COOKIE}=${sessionToken}`;
  return new NextRequest(`http://localhost:3000${pathname}`, { headers });
}

const VALID = basicHeader("admin", "admin-secret-pass");

// ── protected paths ────────────────────────────────────────────────

test("unauthenticated /admin page → 401 with WWW-Authenticate challenge", async () => {
  const res = await middleware(requestFor("/admin/conversations"));
  assert.equal(res.status, 401);
  assert.ok(res.headers.get("WWW-Authenticate")?.includes("Basic"));
});

test("authenticated /admin page → passes through (200)", async () => {
  const res = await middleware(requestFor("/admin/conversations", VALID));
  assert.equal(res.status, 200);
});

test("unauthenticated /api/admin/* → 401", async () => {
  for (const path of [
    "/api/admin/staff",
    "/api/admin/conversations",
    "/api/admin/portal-access",
    "/api/admin/portal-access/abc/action",
  ]) {
    const res = await middleware(requestFor(path));
    assert.equal(res.status, 401, `${path} must be protected`);
  }
});

test("authenticated /api/admin/* → passes through", async () => {
  const res = await middleware(requestFor("/api/admin/staff", VALID));
  assert.equal(res.status, 200);
});

test("invalid credentials → 401 on every protected path", async () => {
  const bad = basicHeader("admin", "wrong");
  const res = await middleware(requestFor("/api/admin/staff", bad));
  assert.equal(res.status, 401);
});

test("/api/test-db is protected (401 unauthenticated, 200 authenticated)", async () => {
  assert.equal((await middleware(requestFor("/api/test-db"))).status, 401);
  assert.equal((await middleware(requestFor("/api/test-db", VALID))).status, 200);
});

test("malformed Basic header → 401 (no ':' separator)", async () => {
  const res = await middleware(
    requestFor(
      "/api/admin/staff",
      `Basic ${Buffer.from("just-username").toString("base64")}`,
    ),
  );
  assert.equal(res.status, 401);
});

// ── session cookie bridge (CRM-UI-AUTH-FIX-01) ─────────────────────

test("valid Basic on admin page → 200 AND sets an HttpOnly session cookie", async () => {
  const res = await middleware(requestFor("/admin/conversations", VALID));
  assert.equal(res.status, 200);
  const setCookie = res.headers.get("set-cookie") ?? "";
  assert.ok(setCookie.includes(ADMIN_SESSION_COOKIE), "cookie must be issued");
  assert.ok(setCookie.includes("HttpOnly"), "cookie must be HttpOnly");
  assert.ok(setCookie.toLowerCase().includes("samesite="), "cookie must set SameSite");
  assert.ok(!setCookie.includes("admin-secret-pass"), "cookie must not contain the password");
});

test("valid Basic on /api/admin/* → 200 AND sets the session cookie", async () => {
  const res = await middleware(requestFor("/api/admin/staff", VALID));
  assert.equal(res.status, 200);
  assert.ok((res.headers.get("set-cookie") ?? "").includes(ADMIN_SESSION_COOKIE));
});

test("session cookie ALONE (no Basic header) → /api/admin/* passes through", async () => {
  const { token } = await issueAdminSession("admin");
  const res = await middleware(requestFor("/api/admin/conversations", undefined, token));
  assert.equal(res.status, 200);
});

test("session cookie ALONE (no Basic header) → /admin page passes through", async () => {
  const { token } = await issueAdminSession("admin");
  const res = await middleware(requestFor("/admin/conversations", undefined, token));
  assert.equal(res.status, 200);
});

test("tampered session cookie → 401", async () => {
  const { token } = await issueAdminSession("admin");
  const tampered = `${token.slice(0, -2)}AA`;
  const res = await middleware(requestFor("/api/admin/conversations", undefined, tampered));
  assert.equal(res.status, 401);
});

test("expired session cookie → 401", async () => {
  const expired = await signSessionToken({
    v: "v1",
    u: "admin",
    e: Date.now() - 1000,
  });
  const res = await middleware(requestFor("/api/admin/conversations", undefined, expired));
  assert.equal(res.status, 401);
});

test("cookie carries Strict SameSite (never cross-site)", async () => {
  const res = await middleware(requestFor("/admin/conversations", VALID));
  const setCookie = res.headers.get("set-cookie") ?? "";
  assert.ok(setCookie.toLowerCase().includes("samesite=strict"));
});

test("cookie is marked Secure over HTTPS (production-like)", async () => {
  const res = await middleware(
    new NextRequest("https://www.anuedu.in/admin/conversations", {
      headers: { authorization: VALID },
    }),
  );
  const setCookie = res.headers.get("set-cookie") ?? "";
  assert.ok(setCookie.includes("Secure"), "Secure flag required over HTTPS");
});

test("cookie is NOT marked Secure over plain HTTP (local dev)", async () => {
  const res = await middleware(requestFor("/admin/conversations", VALID));
  const setCookie = res.headers.get("set-cookie") ?? "";
  assert.ok(!setCookie.toLowerCase().includes("; secure"), "no Secure flag over HTTP");
});

// ── public routes stay open ────────────────────────────────────────

test("public /api/chat is not gated by middleware", async () => {
  const res = await middleware(requestFor("/api/chat"));
  assert.equal(res.status, 200);
});

test("public /api/demo-lead is not gated by middleware", async () => {
  const res = await middleware(requestFor("/api/demo-lead"));
  assert.equal(res.status, 200);
});

// ── fail closed on unconfigured env ────────────────────────────────

test("ADMIN_USER / ADMIN_PASS unset → 500", async () => {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASS;
    const res = await middleware(requestFor("/api/admin/staff", VALID));
    assert.equal(res.status, 500);
  } finally {
    if (savedUser !== undefined) process.env.ADMIN_USER = savedUser;
    if (savedPass !== undefined) process.env.ADMIN_PASS = savedPass;
  }
});