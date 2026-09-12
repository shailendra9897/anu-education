// FILE: tests/admin-session-integration.test.ts
//
// Focused end-to-end auth bridge test (CRM-UI-AUTH-FIX-01):
//
//   authenticated /admin page request (HTTP Basic)
//     → middleware verifies + issues HttpOnly session cookie
//     → same-origin /api/admin/conversations sent with ONLY the cookie
//     → middleware passes → requireAdminAuth accepts the session state
//
// No DB is used: staff identity resolution uses injected fake ports.
//
// Run: npx tsx tests/admin-session-integration.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

import { middleware } from "../middleware";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
} from "../lib/auth/admin-session";
import { requireAdminAuth, type StaffIdentity } from "../lib/auth/admin-guard";

process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASS = "admin-secret-pass";

const VALID_BASIC = `Basic ${Buffer.from("admin:admin-secret-pass").toString("base64")}`;

const ACTIVE_ADMIN: StaffIdentity = {
  id: "staff-1",
  email: "admin@anu.in",
  name: "Admin",
  role: "ADMIN",
  active: true,
};

const FAKE_PORTS = {
  findByEmail: async () => null as StaffIdentity | null,
  findActiveAdmin: async () => ACTIVE_ADMIN as StaffIdentity | null,
};

function cookieFrom(res: Response): string {
  const setCookie = res.headers.get("set-cookie") ?? "";
  const match = setCookie.match(
    new RegExp(`(?:^|;)\\s*${ADMIN_SESSION_COOKIE}=([^;]+)`),
  );
  assert.ok(match, "middleware must issue the session cookie on Basic login");
  return match[1]!;
}

function apiRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/conversations?limit=50&offset=0", {
    headers: cookie ? { cookie: `${ADMIN_SESSION_COOKIE}=${cookie}` } : {},
  });
}

test("full flow: Basic page login → session cookie → authorized /api/admin/conversations", async () => {
  // 1. Authenticated page request via HTTP Basic.
  const pageRes = await middleware(
    new NextRequest("http://localhost:3000/admin/conversations", {
      headers: { authorization: VALID_BASIC },
    }),
  );
  assert.equal(pageRes.status, 200);
  const token = cookieFrom(pageRes);

  // The issued token must verify on its own (server-verifiable).
  assert.equal(await verifyAdminSession(token), "admin");

  // 2. Same-origin API call carrying ONLY the session cookie (no Basic).
  const apiRes = await middleware(apiRequest(token));
  assert.equal(apiRes.status, 200, "cookie-authenticated API must pass middleware");

  // 3. The API-handler guard accepts the session state and resolves staff.
  const identity = await requireAdminAuth(apiRequest(token), { db: FAKE_PORTS });
  assert.equal(identity.email, "admin@anu.in");
  assert.equal(identity.role, "ADMIN");
  assert.equal(identity.active, true);
});

test("no credentials and no session → 401 at middleware and at the guard", async () => {
  const midRes = await middleware(apiRequest());
  assert.equal(midRes.status, 401);
  assert.ok(midRes.headers.get("WWW-Authenticate")?.includes("Basic"));

  await assert.rejects(
    requireAdminAuth(apiRequest(), { db: FAKE_PORTS }),
    (err: unknown) =>
      err instanceof Error &&
      err.message === "Authentication required." &&
      (err as { status?: number }).status === 401,
  );
});

test("session cookie is not accepted on unauthenticated paths outside the bridge", async () => {
  const token = cookieFrom(
    await middleware(
      new NextRequest("http://localhost:3000/admin/conversations", {
        headers: { authorization: VALID_BASIC },
      }),
    ),
  );

  // Public routes stay open regardless of cookies.
  const publicRes = await middleware(
    new NextRequest("http://localhost:3000/api/chat", {
      headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
    }),
  );
  assert.equal(publicRes.status, 200);
});