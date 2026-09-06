// FILE: lib/auth/admin-guard.ts
//
// ─────────────────────────────────────────────────────────────────
// SHARED ADMIN AUTHENTICATION + AUTHORIZATION HELPER
//
// Used by every /api/admin/* route handler. The root middleware.ts
// provides the fast path (env Basic-auth check + HTTP 401 before the
// handler runs); this module is the defense-in-depth layer that runs
// inside each handler and adds the STAFF identity checks:
//
//   1. Basic credentials must match ADMIN_USER / ADMIN_PASS
//      (fail closed: missing header / bad base64 / no ":" → 401).
//   2. The authenticated user must resolve to a Staff record:
//        a. by Staff.email == Basic username (case-insensitive); or
//        b. if the username is not an email address (e.g. "admin"),
//           the active ADMIN-role staff account is used as the
//           admin identity (see resolveAdminIdentity for the reason).
//   3. The Staff record must exist and be `active` (else 401/403).
//   4. When `requireRole` is passed, Staff.role must equal it (403).
//
// Role usage (existing schema roles only): COUNSELLOR | ADMIN |
// OPERATOR. No new roles are invented here.
//
// No credentials are ever logged. Only the resolved staff email/role
// may be surfaced to callers, never the Basic password.
// ─────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ── Typed error carrying an HTTP status ────────────────────────────

export class AdminAuthError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}

export function isAdminAuthError(error: unknown): error is AdminAuthError {
  return error instanceof AdminAuthError;
}

export function adminAuthErrorResponse(error: AdminAuthError): NextResponse {
  return NextResponse.json(
    { success: false, error: error.message },
    { status: error.status },
  );
}

// ── Staff identity shape ───────────────────────────────────────────

export type StaffIdentity = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
};

// ── Basic credential parsing / verification (pure) ─────────────────

export type BasicCredentials = {
  username: string;
  password: string;
};

export function parseBasicCredentials(
  req: NextRequest,
): BasicCredentials | null {
  const header = req.headers.get("authorization");

  if (!header || !header.startsWith("Basic ")) {
    return null;
  }

  try {
    const encoded = header.slice(6).trim();
    if (!encoded) return null;

    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return null;

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

/**
 * Checks the credentials against ADMIN_USER / ADMIN_PASS.
 * Throws AdminAuthError(500) when the env credentials are unset so
 * requests fail closed instead of silently matching "undefined".
 */
export function verifyBasicCredentials(
  credentials: BasicCredentials,
): boolean {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (expectedUser === undefined || expectedPass === undefined) {
    throw new AdminAuthError(
      500,
      "Admin authentication is not configured.",
    );
  }

  return (
    credentials.username === expectedUser &&
    credentials.password === expectedPass
  );
}

// ── Staff identity resolution (injectable for tests) ───────────────

export type AdminIdentityPorts = {
  findByEmail(email: string): Promise<StaffIdentity | null>;
  findActiveAdmin(): Promise<StaffIdentity | null>;
};

export function defaultAdminIdentityPorts(): AdminIdentityPorts {
  const select = {
    id: true,
    email: true,
    name: true,
    role: true,
    active: true,
  } as const;

  return {
    findByEmail: (email) =>
      prisma.staff.findUnique({
        where: { email },
        select,
      }),
    findActiveAdmin: () =>
      prisma.staff.findFirst({
        where: { role: "ADMIN", active: true },
        orderBy: { updatedAt: "desc" },
        select,
      }),
  };
}

/**
 * Resolve the authenticated user to a Staff record.
 *
 * 1. Staff.email == Basic username is the canonical match (so a
 *    staff member whose email is itself the admin login maps to
 *    exactly that staff record and is subject to active/role checks).
 *
 * 2. Because the current deployments use a NON-email ADMIN_USER
 *    (e.g. "admin"), a username that is not an email maps to the
 *    active ADMIN-role Staff account. This preserves existing
 *    admin-page behavior while still making every admin API call
 *    resolve to a real, active Staff row.
 *
 * 3. An email-shaped username with no matching staff record returns
 *    null (no admin-account fallback for email logins).
 */
export async function resolveAdminIdentity(
  username: string,
  db: AdminIdentityPorts,
): Promise<StaffIdentity | null> {
  const byEmail = await db.findByEmail(username.toLowerCase());
  if (byEmail) return byEmail;

  if (!username.includes("@")) {
    return db.findActiveAdmin();
  }

  return null;
}

// ── The gate every admin handler calls ─────────────────────────────

export type RequireAdminAuthOptions = {
  role?: string;
  db?: AdminIdentityPorts;
};

/**
 * requireAdminAuth
 * ────────────────
 * Full authn + authz gate for /api/admin/* handlers. Resolves the
 * staff identity, rejects missing/invalid credentials (401), missing
 * staff mapping (401), inactive staff (403) and — when `role` is
 * given — staff whose role does not match (403). Returns the Staff
 * identity so handlers can attribute actions (e.g. portal
 * provisioning) to a real staff member.
 */
export async function requireAdminAuth(
  req: NextRequest,
  options: RequireAdminAuthOptions = {},
): Promise<StaffIdentity> {
  const credentials = parseBasicCredentials(req);
  if (!credentials) {
    throw new AdminAuthError(401, "Authentication required.");
  }

  const valid = verifyBasicCredentials(credentials);
  if (!valid) {
    throw new AdminAuthError(401, "Invalid credentials.");
  }

  const db = options.db ?? defaultAdminIdentityPorts();

  const staff = await resolveAdminIdentity(credentials.username, db);
  if (!staff) {
    throw new AdminAuthError(
      401,
      "No staff account maps to the authenticated admin user.",
    );
  }

  if (!staff.active) {
    throw new AdminAuthError(403, "This staff account is inactive.");
  }

  if (options.role && staff.role !== options.role) {
    throw new AdminAuthError(
      403,
      `This action requires the ${options.role} role.`,
    );
  }

  return staff;
}