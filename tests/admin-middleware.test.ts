// FILE: tests/admin-middleware.test.ts
//
// Root middleware auth gate (WP-B1). Calls the exported middleware()
// directly with fake NextRequest objects and asserts the HTTP status
// returned for every protected path and the unprotected public routes.
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

function basicHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

function requestFor(pathname: string, header?: string): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers: header ? { authorization: header } : {},
  });
}

const VALID = basicHeader("admin", "admin-secret-pass");

// ── protected paths ────────────────────────────────────────────────

test("unauthenticated /admin page → 401 with WWW-Authenticate challenge", async () => {
  const res = middleware(requestFor("/admin/conversations"));
  assert.equal(res.status, 401);
  assert.ok(res.headers.get("WWW-Authenticate")?.includes("Basic"));
});

test("authenticated /admin page → passes through (200)", async () => {
  const res = middleware(requestFor("/admin/conversations", VALID));
  assert.equal(res.status, 200);
});

test("unauthenticated /api/admin/* → 401", async () => {
  for (const path of [
    "/api/admin/staff",
    "/api/admin/conversations",
    "/api/admin/portal-access",
    "/api/admin/portal-access/abc/action",
  ]) {
    const res = middleware(requestFor(path));
    assert.equal(res.status, 401, `${path} must be protected`);
  }
});

test("authenticated /api/admin/* → passes through", async () => {
  const res = middleware(requestFor("/api/admin/staff", VALID));
  assert.equal(res.status, 200);
});

test("invalid credentials → 401 on every protected path", async () => {
  const bad = basicHeader("admin", "wrong");
  const res = middleware(requestFor("/api/admin/staff", bad));
  assert.equal(res.status, 401);
});

test("/api/test-db is protected (401 unauthenticated, 200 authenticated)", async () => {
  assert.equal(middleware(requestFor("/api/test-db")).status, 401);
  assert.equal(middleware(requestFor("/api/test-db", VALID)).status, 200);
});

test("malformed Basic header → 401 (no ':' separator)", async () => {
  const res = middleware(
    requestFor(
      "/api/admin/staff",
      `Basic ${Buffer.from("just-username").toString("base64")}`,
    ),
  );
  assert.equal(res.status, 401);
});

// ── public routes stay open ────────────────────────────────────────

test("public /api/chat is not gated by middleware", async () => {
  const res = middleware(requestFor("/api/chat"));
  assert.equal(res.status, 200);
});

test("public /api/demo-lead is not gated by middleware", async () => {
  const res = middleware(requestFor("/api/demo-lead"));
  assert.equal(res.status, 200);
});

// ── fail closed on unconfigured env ────────────────────────────────

test("ADMIN_USER / ADMIN_PASS unset → 500", async () => {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASS;
    const res = middleware(requestFor("/api/admin/staff", VALID));
    assert.equal(res.status, 500);
  } finally {
    if (savedUser !== undefined) process.env.ADMIN_USER = savedUser;
    if (savedPass !== undefined) process.env.ADMIN_PASS = savedPass;
  }
});