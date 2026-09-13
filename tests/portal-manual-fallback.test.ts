// FILE: tests/portal-manual-fallback.test.ts
//
// CRM-PORTAL-MANUAL-FALLBACK-01 — RELIABLE MANUAL PORTAL PROVISIONING
// FALLBACK IN THE CRM (DB-BACKED + ROUTE-LEVEL)
//
// Verifies the manual fallback for student portal provisioning when the
// automatic Playwright/Chromium flow is unavailable or has failed:
//   A   the manual setup action is admin-authorized (401/403 fail closed)
//   B   the registration URL is correct / centrally sourced
//   C   student details come from the existing PortalAccessRequest
//   D   the portal password is NEVER returned by any response
//   E   opening/manual setup does NOT mark the request COMPLETED
//   F   completion happens ONLY via the explicit manual COMPLETE action
//   G   repeating the manual completion is idempotent
//   H   an existing FAILED request can enter the manual workflow
//   I   existing PROCESS/COMPLETE/FAIL/RETRY behavior stays intact
//
// Run (existing convention, scratch Postgres REQUIRED):
//   npx tsx tests/portal-manual-fallback.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest, NextResponse } from "next/server";
import { PortalAccessStatus } from "@prisma/client";

import prisma from "../lib/prisma";
import {
  createPortalAccessRequest,
  getPortalAccessRequest,
  markPortalAccessFailed,
  buildManualPortalSetupPayload,
} from "../lib/portal/portal.access.service";
import { getPortalRegistrationUrl } from "../lib/portal/portal.config";
import { POST as portalActionPOST } from "../app/api/admin/portal-access/[id]/action/route";
import { GET as listPortalAccessGET } from "../app/api/admin/portal-access/route";

// ── UNIQUE TEST HARNESS ───────────────────────────────────────────
let seq = 0;
const uid = () => `mfall-${Date.now()}-${++seq}`;

const requestIds: string[] = [];
const leadIds: string[] = [];
const staffIds: string[] = [];

async function cleanup() {
  await prisma.portalAccessRequest
    .deleteMany({ where: { id: { in: requestIds } } })
    .catch(() => {});
  for (const id of leadIds) {
    await prisma.lead.deleteMany({ where: { id } }).catch(() => {});
  }
  for (const id of staffIds) {
    await prisma.staff.deleteMany({ where: { id } }).catch(() => {});
  }
  requestIds.length = 0;
  leadIds.length = 0;
  staffIds.length = 0;
}

test.afterEach(cleanup);
test.after(() => prisma.$disconnect());

async function createRequest(input: {
  studentName?: string;
  email?: string;
  phone?: string;
  course?: string;
}) {
  const request = await createPortalAccessRequest({
    studentName: input.studentName ?? "Manual Fallback Student",
    email: input.email ?? `${uid()}@dev.test`,
    phone: input.phone ?? "+15550009988",
    course: input.course ?? "IELTS",
  });
  requestIds.push(request.id);
  return request;
}

async function seedStaff(role: "ADMIN" | "COUNSELLOR") {
  const staff = await prisma.staff.create({
    data: {
      name: `Test ${role}`,
      email: `${role.toLowerCase()}-${uid()}@dev.test`,
      phone: `+1800000${Math.floor(Math.random() * 10000)}`,
      role,
      active: true,
    },
  });
  staffIds.push(staff.id);
  return staff;
}

function basicHeader(user: string, pass: string): string {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

const ADMIN_PASS = "admin-secret-pass";

/** Call the admin portal-action route with the given staff identity. */
async function callAction(params: {
  id: string;
  action: "PROCESS" | "COMPLETE" | "FAIL" | "RETRY" | "MANUAL_SETUP";
  staffEmail: string;
  body?: Record<string, unknown>;
}): Promise<NextResponse> {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    process.env.ADMIN_USER = params.staffEmail;
    process.env.ADMIN_PASS = ADMIN_PASS;

    const req = new NextRequest(
      "http://localhost:3000/api/admin/portal-access/test/action",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: basicHeader(params.staffEmail, ADMIN_PASS),
        },
        body: JSON.stringify({
          action: params.action,
          ...(params.body ?? {}),
        }),
      },
    );

    return (await portalActionPOST(req, {
      params: Promise.resolve({ id: params.id }),
    })) as NextResponse;
  } finally {
    if (savedUser === undefined) delete process.env.ADMIN_USER;
    else process.env.ADMIN_USER = savedUser;
    if (savedPass === undefined) delete process.env.ADMIN_PASS;
    else process.env.ADMIN_PASS = savedPass;
  }
}

/** Call the admin portal-action route WITHOUT any credentials. */
async function callActionAnonymous(
  id: string,
  action: string,
): Promise<NextResponse> {
  const req = new NextRequest(
    "http://localhost:3000/api/admin/portal-access/test/action",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    },
  );

  return (await portalActionPOST(req, {
    params: Promise.resolve({ id }),
  })) as NextResponse;
}

async function callList(
  staffEmail: string,
  status?: string,
): Promise<NextResponse> {
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    process.env.ADMIN_USER = staffEmail;
    process.env.ADMIN_PASS = ADMIN_PASS;

    const url = `http://localhost:3000/api/admin/portal-access${
      status ? `?status=${status}` : ""
    }`;
    const req = new NextRequest(url, {
      headers: {
        authorization: basicHeader(staffEmail, ADMIN_PASS),
      },
    });

    return (await listPortalAccessGET(req)) as NextResponse;
  } finally {
    if (savedUser === undefined) delete process.env.ADMIN_USER;
    else process.env.ADMIN_USER = savedUser;
    if (savedPass === undefined) delete process.env.ADMIN_PASS;
    else process.env.ADMIN_PASS = savedPass;
  }
}

// ── A. AUTHORIZATION ──────────────────────────────────────────────
test("A1. MANUAL_SETUP without credentials → 401 (fail closed)", async () => {
  const request = await createRequest({});
  const res = await callActionAnonymous(request.id, "MANUAL_SETUP");

  assert.equal(res.status, 401);
  const body = (await res.json()) as { success: boolean };
  assert.equal(body.success, false);
});

test("A2. MANUAL_SETUP with an active ADMIN staff → 200 + setup", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });

  assert.equal(res.status, 200);
  const body = (await res.json()) as {
    success: boolean;
    setup: { studentName: string };
  };
  assert.equal(body.success, true);
  assert.equal(body.setup.studentName, request.studentName);
});

test("A3. COUNSELLOR staff calling MANUAL_SETUP → 403 (role ADMIN required)", async () => {
  const counsellor = await seedStaff("COUNSELLOR");
  const request = await createRequest({});
  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: counsellor.email,
  });

  assert.equal(res.status, 403);
  const body = (await res.json()) as { success: boolean };
  assert.equal(body.success, false);
});

test("A4. email-form credentials with NO matching staff → 401 (fail closed)", async () => {
  const request = await createRequest({});

  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    process.env.ADMIN_USER = "ghost-manager@dev.test";
    process.env.ADMIN_PASS = ADMIN_PASS;

    const req = new NextRequest(
      "http://localhost:3000/api/admin/portal-access/test/action",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: basicHeader("ghost-manager@dev.test", ADMIN_PASS),
        },
        body: JSON.stringify({ action: "MANUAL_SETUP" }),
      },
    );

    const res = (await portalActionPOST(req, {
      params: Promise.resolve({ id: request.id }),
    })) as NextResponse;

    assert.equal(res.status, 401);
  } finally {
    if (savedUser === undefined) delete process.env.ADMIN_USER;
    else process.env.ADMIN_USER = savedUser;
    if (savedPass === undefined) delete process.env.ADMIN_PASS;
    else process.env.ADMIN_PASS = savedPass;
  }
});

// ── B. REGISTRATION URL ───────────────────────────────────────────
test("B1. registration URL is correct and centrally sourced", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});

  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 200);

  const body = (await res.json()) as {
    setup: { registrationUrl: string };
  };
  const expected = getPortalRegistrationUrl();
  assert.equal(expected, "https://study.anuedu.in/register");
  assert.equal(body.setup.registrationUrl, expected);
});

test("B2. env override PORTAL_REGISTRATION_URL is honored end to end", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});

  const previous = process.env.PORTAL_REGISTRATION_URL;
  try {
    process.env.PORTAL_REGISTRATION_URL =
      "https://portal.example.test/signup";

    const res = await callAction({
      id: request.id,
      action: "MANUAL_SETUP",
      staffEmail: staff.email,
    });
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      setup: { registrationUrl: string };
    };
    assert.equal(
      body.setup.registrationUrl,
      "https://portal.example.test/signup",
    );
    assert.equal(
      getPortalRegistrationUrl(),
      "https://portal.example.test/signup",
    );
  } finally {
    if (previous === undefined) delete process.env.PORTAL_REGISTRATION_URL;
    else process.env.PORTAL_REGISTRATION_URL = previous;
  }
});

// ── C. STUDENT DETAILS FROM THE EXISTING REQUEST ──────────────────
test("C1. student details (name/email/phone/course) come from the row", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({
    studentName: "Priya Sharma",
    email: `${uid()}@dev.test`,
    phone: "+919811122233",
    course: "PTE Academic",
  });

  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 200);

  const body = (await res.json()) as {
    setup: {
      studentName: string;
      email: string;
      phone: string;
      course: string;
    };
  };

  assert.equal(body.setup.studentName, "Priya Sharma");
  assert.equal(body.setup.email, request.email);
  assert.equal(body.setup.phone, "+919811122233");
  assert.equal(body.setup.course, "PTE Academic");
});

test("C2. pure builder derives the payload from the row only", async () => {
  const row = await createRequest({
    studentName: "Rahul Verma",
    email: `${uid()}@dev.test`,
    phone: "+14155550123",
    course: "IELTS",
  });

  const payload = buildManualPortalSetupPayload({
    studentName: row.studentName,
    email: row.email,
    phone: row.phone,
    course: row.course,
  });

  assert.deepEqual(payload, {
    registrationUrl: getPortalRegistrationUrl(),
    studentName: row.studentName,
    email: row.email,
    phone: row.phone,
    course: row.course,
  });
});

// ── D. THE PORTAL PASSWORD IS NEVER RETURNED ──────────────────────
test("D1. MANUAL_SETUP response contains NOTHING about the password", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});

  const previous = process.env.PORTAL_PASSWORD;
  try {
    process.env.PORTAL_PASSWORD = "super-secret-portal-pass-xyz";

    const res = await callAction({
      id: request.id,
      action: "MANUAL_SETUP",
      staffEmail: staff.email,
    });
    assert.equal(res.status, 200);

    const raw = await res.text();
    assert.doesNotMatch(raw, /super-secret-portal-pass-xyz/i);
    assert.doesNotMatch(raw, /portalPassword|portal_password|password/i);

    const parsed = JSON.parse(raw) as {
      setup: Record<string, unknown>;
    };

    // The setup payload is structurally limited to safe fields.
    assert.deepEqual(
      Object.keys(parsed.setup).sort(),
      ["course", "email", "phone", "registrationUrl", "studentName"].sort(),
    );
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }
});

test("D2. admin list response contains NOTHING about the password either", async () => {
  const staff = await seedStaff("ADMIN");
  await createRequest({});

  const previous = process.env.PORTAL_PASSWORD;
  try {
    process.env.PORTAL_PASSWORD = "super-secret-portal-pass-xyz";

    const res = await callList(staff.email, "PENDING");
    assert.equal(res.status, 200);

    const raw = await res.text();
    assert.doesNotMatch(raw, /super-secret-portal-pass-xyz/i);
    assert.doesNotMatch(raw, /portalPassword|portal_password|password/i);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }
});

test("D3. the payload has the exact shape even for a FAILED request", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  await markPortalAccessFailed(request.id, "automatic provisioning failed");

  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 200);

  const body = (await res.json()) as {
    setup: { registrationUrl: string; course: string | null };
  };
  assert.equal(typeof body.setup.registrationUrl, "string");
  assert.equal(body.setup.registrationUrl, getPortalRegistrationUrl());
});

// ── E. MANUAL SETUP DOES NOT MODIFY STATUS ────────────────────────
test("E1. opening manual setup does NOT mark the request COMPLETED", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  await markPortalAccessFailed(request.id, "previous automatic failure");

  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 200);

  const body = (await res.json()) as { request: { status: string } };
  assert.equal(body.request.status, "FAILED");
  assert.notEqual(body.request.status, "COMPLETED");

  const reloaded = await getPortalAccessRequest(request.id);
  assert.equal(reloaded?.status, PortalAccessStatus.FAILED);
  assert.equal(reloaded?.completedAt, null, "completedAt stays unset");
  assert.equal(reloaded?.attemptCount, 0, "no attempt counter increment");
});

// ── F. COMPLETION ONLY VIA EXPLICIT MANUAL COMPLETE ───────────────
test("F1. manual completion moves FAILED → COMPLETED and records the actor", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  await markPortalAccessFailed(request.id, "automatic provisioning failed");

  const setupRes = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(setupRes.status, 200);

  const completeRes = await callAction({
    id: request.id,
    action: "COMPLETE",
    staffEmail: staff.email,
    body: {
      portalStudentId: "STU-9876",
      portalLogin: request.email,
      notes: "Created manually via the registration page.",
    },
  });
  assert.equal(completeRes.status, 200);

  const completeBody = (await completeRes.json()) as {
    success: boolean;
    request: {
      status: string;
      processedBy: string | null;
      portalStudentId: string | null;
      errorMessage: string | null;
      failedAt: Date | null;
    };
  };
  assert.equal(completeBody.success, true);
  assert.equal(completeBody.request.status, "COMPLETED");
  assert.equal(completeBody.request.processedBy, staff.email);
  assert.equal(completeBody.request.portalStudentId, "STU-9876");
  assert.equal(completeBody.request.errorMessage, null);
  assert.equal(completeBody.request.failedAt, null);

  const reloaded = await getPortalAccessRequest(request.id);
  assert.equal(reloaded?.status, PortalAccessStatus.COMPLETED);
  assert.equal(reloaded?.processedBy, staff.email);
  assert.ok(reloaded?.completedAt, "completedAt recorded");
});

// ── G. IDEMPOTENT REPETITION ──────────────────────────────────────
test("G1. completing an already-completed request is idempotent", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});

  const first = await callAction({
    id: request.id,
    action: "COMPLETE",
    staffEmail: staff.email,
    body: { portalLogin: request.email },
  });
  assert.equal(first.status, 200);

  const second = await callAction({
    id: request.id,
    action: "COMPLETE",
    staffEmail: staff.email,
    body: { portalLogin: request.email },
  });
  assert.equal(second.status, 200);

  const body = (await second.json()) as {
    success: boolean;
    request: { status: string };
  };
  assert.equal(body.success, true);
  assert.equal(body.request.status, "COMPLETED");

  const reloaded = await getPortalAccessRequest(request.id);
  assert.equal(reloaded?.status, PortalAccessStatus.COMPLETED);
});

// ── H. FAILED REQUEST ENTERS THE MANUAL WORKFLOW ──────────────────
test("H1. a FAILED request flows cleanly through setup → complete", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({ course: "IELTS" });
  await markPortalAccessFailed(request.id, "automatic provisioning failed");

  const reloaded = await getPortalAccessRequest(request.id);
  assert.equal(reloaded?.status, PortalAccessStatus.FAILED);

  const setupRes = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(setupRes.status, 200);

  const setupBody = (await setupRes.json()) as {
    success: boolean;
    setup: { studentName: string; email: string; registrationUrl: string };
  };
  assert.equal(setupBody.success, true);
  assert.equal(setupBody.setup.studentName, request.studentName);
  assert.equal(setupBody.setup.email, request.email);

  const completeRes = await callAction({
    id: request.id,
    action: "COMPLETE",
    staffEmail: staff.email,
    body: { portalLogin: request.email },
  });
  assert.equal(completeRes.status, 200);

  const completeBody = (await completeRes.json()) as {
    request: { status: string };
  };
  assert.equal(completeBody.request.status, "COMPLETED");
});

test("H2. MANUAL_SETUP on an unknown id → 404, no state change anywhere", async () => {
  const staff = await seedStaff("ADMIN");
  const res = await callAction({
    id: uid(),
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 404);
});

// ── I. EXISTING BEHAVIOR / SECURITY STAYS INTACT ─────────────────
test("I1. PROCESS without a configured portal password → CONFIGURATION (unchanged)", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});

  const previous = process.env.PORTAL_PASSWORD;
  try {
    delete process.env.PORTAL_PASSWORD;

    const res = await callAction({
      id: request.id,
      action: "PROCESS",
      staffEmail: staff.email,
    });

    const body = (await res.json()) as {
      success: boolean;
      errorCode?: string;
      message?: string;
    };
    assert.equal(body.success, false);
    assert.equal(body.errorCode, "CONFIGURATION");
    assert.match(body.message ?? "", /not configured/i);

    const reloaded = await getPortalAccessRequest(request.id);
    assert.equal(reloaded?.status, PortalAccessStatus.FAILED);
  } finally {
    if (previous === undefined) delete process.env.PORTAL_PASSWORD;
    else process.env.PORTAL_PASSWORD = previous;
  }
});

test("I2. unknown action string → 400", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  const res = await callAction({
    id: request.id,
    action: "MANUAL_SETUP",
    staffEmail: staff.email,
    // Override the action with an invalid one via a raw call.
    body: { action: "NOT_A_REAL_ACTION" },
  } as never);

  // callAction hardcodes action, so issue the raw unauthorized-route call with a real header instead.
  const savedUser = process.env.ADMIN_USER;
  const savedPass = process.env.ADMIN_PASS;
  try {
    process.env.ADMIN_USER = staff.email;
    process.env.ADMIN_PASS = ADMIN_PASS;

    const req = new NextRequest(
      "http://localhost:3000/api/admin/portal-access/test/action",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: basicHeader(staff.email, ADMIN_PASS),
        },
        body: JSON.stringify({ action: "NOT_A_REAL_ACTION" }),
      },
    );

    const invalid = (await portalActionPOST(req, {
      params: Promise.resolve({ id: request.id }),
    })) as NextResponse;
    assert.equal(invalid.status, 400);

    const invalidBody = (await invalid.json()) as { success: boolean };
    assert.equal(invalidBody.success, false);
  } finally {
    if (savedUser === undefined) delete process.env.ADMIN_USER;
    else process.env.ADMIN_USER = savedUser;
    if (savedPass === undefined) delete process.env.ADMIN_PASS;
    else process.env.ADMIN_PASS = savedPass;
  }
});

test("I3. COMPLETE also works for a PROCESSING-era request (preserved)", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  await prisma.portalAccessRequest.update({
    where: { id: request.id },
    data: { status: PortalAccessStatus.PROCESSING, attemptCount: 1 },
  });

  const res = await callAction({
    id: request.id,
    action: "COMPLETE",
    staffEmail: staff.email,
    body: { portalLogin: request.email },
  });
  assert.equal(res.status, 200);

  const body = (await res.json()) as {
    request: { status: string; processedBy: string | null };
  };
  assert.equal(body.request.status, "COMPLETED");
  assert.equal(body.request.processedBy, staff.email);
});

test("I4. FAIL action still requires an errorMessage", async () => {
  const staff = await seedStaff("ADMIN");
  const request = await createRequest({});
  await prisma.portalAccessRequest.update({
    where: { id: request.id },
    data: { status: PortalAccessStatus.PROCESSING },
  });

  const res = await callAction({
    id: request.id,
    action: "FAIL",
    staffEmail: staff.email,
  });
  assert.equal(res.status, 400);
});