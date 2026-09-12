// FILE: tests/admin-guard.test.ts
//
// Shared admin authentication/authorization gate (WP-B1). Verifies:
//   missing/invalid Basic credentials → 401 (fail closed)
//   valid credentials + active matching staff → allowed
//   inactive staff → 403
//   staff role required (portal provisioning / staff management) → 403
//   non-email admin username resolves to the active ADMIN role staff
//   unconfigured env credentials → 500 (fail closed)
// Uses injected fake identity ports (no DB).
//
// Run: npx tsx tests/admin-guard.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.ADMIN_USER = "admin";
process.env.ADMIN_PASS = "admin-secret-pass";

import {
  requireAdminAuth,
  AdminAuthError,
  adminAuthErrorResponse,
  parseBasicCredentials,
  verifyBasicCredentials,
  resolveAdminIdentity,
  type StaffIdentity,
  type AdminIdentityPorts,
} from "../lib/auth/admin-guard";
import {
  ADMIN_SESSION_COOKIE,
  issueAdminSession,
  signSessionToken,
} from "../lib/auth/admin-session";

// ── helpers ────────────────────────────────────────────────────────

function basicHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

function apiRequest(header?: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/staff", {
    headers: header ? { authorization: header } : {},
  });
}

function apiRequestWithSession(token: string): NextRequest {
  return new NextRequest("http://localhost:3000/api/admin/staff", {
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
  });
}

function identityPorts(staff: StaffIdentity | null): AdminIdentityPorts {
  return {
    findByEmail: async (email) =>
      staff && staff.email === email ? staff : null,
    findActiveAdmin: async () =>
      staff && staff.role === "ADMIN" && staff.active ? staff : null,
  };
}

const ACTIVE_ADMIN: StaffIdentity = {
  id: "staff-1",
  email: "admin@anu.in",
  name: "Admin",
  role: "ADMIN",
  active: true,
};

// ── credential parsing ─────────────────────────────────────────────

test("parseBasicCredentials: missing header → null", () => {
  assert.equal(parseBasicCredentials(apiRequest()), null);
});

test("parseBasicCredentials: non-Basic scheme → null", () => {
  assert.equal(
    parseBasicCredentials(apiRequest("Bearer sometoken")),
    null,
  );
});

test("parseBasicCredentials: valid header → username/password", () => {
  const creds = parseBasicCredentials(apiRequest(basicHeader("user", "pass")));
  assert.deepEqual(creds, { username: "user", password: "pass" });
});

test("verifyBasicCredentials: correct creds → true; wrong pass → false", () => {
  assert.equal(
    verifyBasicCredentials({ username: "admin", password: "admin-secret-pass" }),
    true,
  );
  assert.equal(
    verifyBasicCredentials({ username: "admin", password: "wrong" }),
    false,
  );
  assert.equal(
    verifyBasicCredentials({ username: "nobody", password: "admin-secret-pass" }),
    false,
  );
});

// ── requireAdminAuth behavior ──────────────────────────────────────

test("401 when the Authorization header is missing", async () => {
  await assert.rejects(
    requireAdminAuth(apiRequest(), { db: identityPorts(ACTIVE_ADMIN) }),
    (err: unknown) => err instanceof AdminAuthError && err.status === 401,
  );
});

test("401 on invalid credentials", async () => {
  await assert.rejects(
    requireAdminAuth(
      apiRequest(basicHeader("admin", "wrong-pass")),
      { db: identityPorts(ACTIVE_ADMIN) },
    ),
    (err: unknown) => err instanceof AdminAuthError && err.status === 401,
  );
});

test(
  "valid credentials + active staff (email match) → returns staff identity",
  withAdminUser("admin@anu.in", async () => {
    const adminByEmail: StaffIdentity = {
      ...ACTIVE_ADMIN,
      email: "admin@anu.in",
    };
    const identity = await requireAdminAuth(
      apiRequest(basicHeader("admin@anu.in", "admin-secret-pass")),
      { db: identityPorts(adminByEmail) },
    );
    assert.equal(identity.email, "admin@anu.in");
    assert.equal(identity.role, "ADMIN");
    assert.equal(identity.active, true);
  }),
);

test(
  "inactive staff → 403",
  withAdminUser("inactive@anu.in", async () => {
    const inactive: StaffIdentity = {
      ...ACTIVE_ADMIN,
      email: "inactive@anu.in",
      active: false,
    };
    await assert.rejects(
      requireAdminAuth(
        apiRequest(basicHeader("inactive@anu.in", "admin-secret-pass")),
        { db: identityPorts(inactive) },
      ),
      (err: unknown) => err instanceof AdminAuthError && err.status === 403,
    );
  }),
);

test(
  "staff missing entirely → 401 (fail closed)",
  withAdminUser("admin@anu.in", async () => {
    await assert.rejects(
      requireAdminAuth(
        apiRequest(basicHeader("admin@anu.in", "admin-secret-pass")),
        { db: identityPorts(null) },
      ),
      (err: unknown) => err instanceof AdminAuthError && err.status === 401,
    );
  }),
);

test("non-email admin username resolves via the active ADMIN staff", async () => {
  const identity = await requireAdminAuth(
    apiRequest(basicHeader("admin", "admin-secret-pass")),
    { db: identityPorts(ACTIVE_ADMIN) },
  );
  assert.equal(identity.email, "admin@anu.in");
});

// ── secure session cookie authentication (CRM-UI-AUTH-FIX-01) ──────

test("valid session cookie (no Basic header) → allowed, resolves staff identity", async () => {
  const { token } = await issueAdminSession("admin");
  const identity = await requireAdminAuth(
    apiRequestWithSession(token),
    { db: identityPorts(ACTIVE_ADMIN) },
  );
  assert.equal(identity.email, "admin@anu.in");
  assert.equal(identity.role, "ADMIN");
  assert.equal(identity.active, true);
});

test("valid session cookie with an email username → email staff match", async () => {
  const adminByEmail: StaffIdentity = {
    ...ACTIVE_ADMIN,
    email: "admin@anu.in",
  };
  const { token } = await issueAdminSession("admin@anu.in");
  const identity = await requireAdminAuth(
    apiRequestWithSession(token),
    { db: identityPorts(adminByEmail) },
  );
  assert.equal(identity.email, "admin@anu.in");
});

test("inactive staff with a valid session → 403 (fail closed on identity)", async () => {
  const inactive: StaffIdentity = {
    ...ACTIVE_ADMIN,
    email: "admin@anu.in",
    active: false,
  };
  const { token } = await issueAdminSession("admin@anu.in");
  await assert.rejects(
    requireAdminAuth(apiRequestWithSession(token), {
      db: identityPorts(inactive),
    }),
    (err: unknown) => err instanceof AdminAuthError && err.status === 403,
  );
});

test("wrong staff role with a valid session + role requirement → 403", async () => {
  const counsellor: StaffIdentity = {
    ...ACTIVE_ADMIN,
    id: "staff-2",
    email: "counsellor@anu.in",
    role: "COUNSELLOR",
  };
  const { token } = await issueAdminSession("counsellor@anu.in");
  await assert.rejects(
    requireAdminAuth(apiRequestWithSession(token), {
      db: identityPorts(counsellor),
      role: "ADMIN",
    }),
    (err: unknown) => err instanceof AdminAuthError && err.status === 403,
  );
});

test("expired session cookie → 401", async () => {
  const expired = await signSessionToken({
    v: "v1",
    u: "admin",
    e: Date.now() - 1000,
  });
  await assert.rejects(
    requireAdminAuth(apiRequestWithSession(expired), {
      db: identityPorts(ACTIVE_ADMIN),
    }),
    (err: unknown) => err instanceof AdminAuthError && err.status === 401,
  );
});

test("tampered session cookie → 401", async () => {
  const { token } = await issueAdminSession("admin");
  const tampered = `${token.slice(0, -2)}AA`;
  await assert.rejects(
    requireAdminAuth(apiRequestWithSession(tampered), {
      db: identityPorts(ACTIVE_ADMIN),
    }),
    (err: unknown) => err instanceof AdminAuthError && err.status === 401,
  );
});

test("no credentials and no session → 401 'Authentication required.'", async () => {
  await assert.rejects(
    requireAdminAuth(apiRequest(), { db: identityPorts(ACTIVE_ADMIN) }),
    (err: unknown) =>
      err instanceof AdminAuthError &&
      err.status === 401 &&
      err.message === "Authentication required.",
  );
});

test("non-email admin username with no active ADMIN staff → 401", async () => {
  const counsellorOnly: StaffIdentity = {
    ...ACTIVE_ADMIN,
    id: "staff-2",
    role: "COUNSELLOR",
  };
  await assert.rejects(
    requireAdminAuth(
      apiRequest(basicHeader("admin", "admin-secret-pass")),
      { db: identityPorts(counsellorOnly) },
    ),
    (err: unknown) => err instanceof AdminAuthError && err.status === 401,
  );
});

// ── role authorization ─────────────────────────────────────────────

function withAdminUser(email: string, fn: () => Promise<void>) {
  return async () => {
    const saved = process.env.ADMIN_USER;
    try {
      process.env.ADMIN_USER = email;
      await fn();
    } finally {
      if (saved !== undefined) process.env.ADMIN_USER = saved;
    }
  };
}

test(
  "COUNSELLOR staff performing an ADMIN-role action → 403",
  withAdminUser("counsellor@anu.in", async () => {
    const counsellor: StaffIdentity = {
      ...ACTIVE_ADMIN,
      id: "staff-2",
      email: "counsellor@anu.in",
      role: "COUNSELLOR",
    };
    await assert.rejects(
      requireAdminAuth(
        apiRequest(basicHeader("counsellor@anu.in", "admin-secret-pass")),
        { db: identityPorts(counsellor), role: "ADMIN" },
      ),
      (err: unknown) => err instanceof AdminAuthError && err.status === 403,
    );
  }),
);

test(
  "ADMIN staff passing an ADMIN-role requirement → allowed",
  withAdminUser("admin@anu.in", async () => {
    const adminByEmail: StaffIdentity = {
      ...ACTIVE_ADMIN,
      email: "admin@anu.in",
    };
    const identity = await requireAdminAuth(
      apiRequest(basicHeader("admin@anu.in", "admin-secret-pass")),
      { db: identityPorts(adminByEmail), role: "ADMIN" },
    );
    assert.equal(identity.role, "ADMIN");
  }),
);

test(
  "OPERATOR is not granted the ADMIN-only portal role",
  withAdminUser("operator@anu.in", async () => {
    const operator: StaffIdentity = {
      ...ACTIVE_ADMIN,
      id: "staff-3",
      email: "operator@anu.in",
      role: "OPERATOR",
    };
    await assert.rejects(
      requireAdminAuth(
        apiRequest(basicHeader("operator@anu.in", "admin-secret-pass")),
        { db: identityPorts(operator), role: "ADMIN" },
      ),
      (err: unknown) => err instanceof AdminAuthError && err.status === 403,
    );
  }),
);

// ── fail closed on unconfigured env ────────────────────────────────

test("ADMIN_USER / ADMIN_PASS unset → 500 (fail closed)", async () => {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    delete process.env.ADMIN_USER;
    delete process.env.ADMIN_PASS;
    await assert.rejects(
      requireAdminAuth(
        apiRequest(basicHeader("admin", "admin-secret-pass")),
        { db: identityPorts(ACTIVE_ADMIN) },
      ),
      (err: unknown) => err instanceof AdminAuthError && err.status === 500,
    );
  } finally {
    if (savedUser !== undefined) process.env.ADMIN_USER = savedUser;
    if (savedPass !== undefined) process.env.ADMIN_PASS = savedPass;
  }
});

// ── response mapping ───────────────────────────────────────────────

test("adminAuthErrorResponse maps status + message into JSON", () => {
  const res = adminAuthErrorResponse(new AdminAuthError(403, "nope"));
  assert.equal(res.status, 403);
});

// ── identity resolution pure function ──────────────────────────────

test("resolveAdminIdentity: email match wins, non-email falls back to active admin", async () => {
  const db = identityPorts(ACTIVE_ADMIN);

  const byEmail = await resolveAdminIdentity("Admin@anu.in", db);
  assert.equal(byEmail?.email, "admin@anu.in");

  const viaFallback = await resolveAdminIdentity("admin", db);
  assert.equal(viaFallback?.email, "admin@anu.in");

  const emailWithNoStaff = await resolveAdminIdentity(
    "nobody@anu.in",
    db,
  );
  assert.equal(emailWithNoStaff, null);
});