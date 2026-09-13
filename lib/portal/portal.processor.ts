// FILE: lib/portal/portal.processor.ts
// ─────────────────────────────────────────────────────────────────
// SHARED PORTAL PROVISIONING SERVICE (CRM-PORTAL-AUTO-02)
//
// The single implementation of "process this portal access request"
// used by BOTH entry points:
//   · the admin /admin/portal-access manual flow  → the API action
//     route PROCESS branch (app/api/admin/portal-access/[id]/action),
//   · the automatic admission-to-portal workflow  → fired from
//     performAdminAdmissionAction when an authorized admission
//     transition APPLIES into the terminal ADMISSION_COMPLETED state.
//
// A caller-facing HTTP layer is deliberately NOT used from server
// code: the business logic lives here, so both paths share the exact
// same claim → password-gate → course-map → register → mark flow.
//
// CONCURRENCY (no schema change):
//   Two racing PROCESS calls both read PENDING and would previously
//   both launch the portal browser. Here the PENDING → PROCESSING
//   claim is an ATOMIC conditional UPDATE (updateMany … state: PENDING)
//   so exactly ONE caller wins; the loser observes the winner's state
//   (COMPLETED / PROCESSING) and returns without touching the portal.
//
// SECURITY INVARIANTS:
//   · PORTAL_PASSWORD is only ever checked for PRESENCE via
//     hasPortalPassword(); its value is never read back, logged,
//     stored, or returned.
//   · The auto-trigger is safe because the S6-B1 lifecycle guarantees
//     ADMISSION_COMPLETED is human-verification-only (COUNSELLOR |
//     ADMIN); STUDENT / AI / SYSTEM can never reach it.
//   · A FAILED request is never silently auto-retried — the existing
//     manual queue keeps retry control.
// ─────────────────────────────────────────────────────────────────

import prisma from "@/lib/prisma";
import { PortalAccessStatus } from "@prisma/client";
import type { PortalAccessRequest } from "@prisma/client";
import type {
  PortalCourseKey,
  PortalErrorCode,
  PortalRegistrationInput,
  PortalRegistrationResult,
} from "./portal.types";
import {
  createPortalAccessRequest,
  getPortalAccessRequest,
  markPortalAccessCompleted,
  markPortalAccessFailed,
} from "./portal.access.service";
import { hasPortalPassword } from "./portal.config";
import { normalizePortalCourse } from "./portal.course-map";
import { registerStudentOnPortal } from "@/lib/demo/portal/portal.registration";

// ── TYPES ──────────────────────────────────────────────────────

/** Injectable registration function — tests substitute this to avoid
 *  launching a real browser while keeping the processor path real. */
export type PortalRegistrationFn = (
  input: PortalRegistrationInput,
) => Promise<PortalRegistrationResult>;

export type ProcessPortalAccessStatus =
  | "NOT_FOUND"
  | "ALREADY_COMPLETED"
  | "ALREADY_PROCESSING"
  | "NOT_PROCESSABLE"
  | "CONFIGURATION"
  | "FAILED"
  | "COMPLETED";

export type ProcessPortalAccessResult = {
  status: ProcessPortalAccessStatus;
  /** Present for every status except NOT_FOUND. */
  request?: PortalAccessRequest;
  message: string;
  errorCode?: PortalErrorCode;
};

export type ProcessPortalAccessOptions = {
  /** Who ran the process (staff email / actor id); surfaced on the row. */
  processedBy?: string;
  registration?: PortalRegistrationFn;
};

export type AutoProvisionAdmissionStatus =
  | "NO_ENROLLMENT"
  | "SKIPPED_MISSING_CONTACT_DETAILS"
  | "ALREADY_COMPLETED"
  | "REQUEST_IN_FLIGHT"
  | "REQUEST_FAILED_LEFT_RETRYABLE"
  | "REQUEST_PROCESSED_COMPLETED"
  | "REQUEST_PROCESSED_FAILED"
  | "REQUEST_PROCESSED_CONFIGURATION";

export type AutoProvisionAdmissionResult = {
  status: AutoProvisionAdmissionStatus;
  portalRequest?: PortalAccessRequest;
  message: string;
};

// ── CORE: PROCESS A REQUEST ─────────────────────────────────────

/**
 * processPortalAccessRequest
 * ───────────────────────────
 * The canonical single attempt to provision a student on the portal.
 * Atomic claim (PENDING|FAILED → PROCESSING), password gate, course
 * normalization, registration, and the COMPLETED / FAILED terminal
 * marking — all here, shared by the manual and automatic paths.
 */
export async function processPortalAccessRequest(
  requestId: string,
  options?: ProcessPortalAccessOptions,
): Promise<ProcessPortalAccessResult> {
  const registration = options?.registration ?? registerStudentOnPortal;

  const portalRequest = await getPortalAccessRequest(requestId);
  if (!portalRequest) {
    return {
      status: "NOT_FOUND",
      message: "Portal access request not found.",
    };
  }
  if (portalRequest.status === PortalAccessStatus.COMPLETED) {
    return {
      status: "ALREADY_COMPLETED",
      request: portalRequest,
      message: "Portal access is already completed.",
    };
  }
  if (portalRequest.status === PortalAccessStatus.PROCESSING) {
    return {
      status: "ALREADY_PROCESSING",
      request: portalRequest,
      message: "This portal request is already being processed.",
    };
  }

  // ── ATOMIC CLAIM ────────────────────────────────────────────
  // One conditional UPDATE owns the row. A FAILED request may be
  // re-processed directly (equivalent to a manual retry), exactly as
  // the original form did — but only ONE caller can ever claim it.
  const claimed = await prisma.portalAccessRequest.updateMany({
    where: {
      id: requestId,
      status: {
        in: [PortalAccessStatus.PENDING, PortalAccessStatus.FAILED],
      },
    },
    data: {
      status: PortalAccessStatus.PROCESSING,
      attemptCount: { increment: 1 },
      lastAttemptAt: new Date(),
      processedBy: options?.processedBy ?? null,
      errorMessage: null,
      failedAt: null,
    },
  });

  if (claimed.count === 0) {
    // Lost the claim race (or the row moved after the pre-checks).
    const current = await getPortalAccessRequest(requestId);
    if (!current) {
      return { status: "NOT_FOUND", message: "Portal access request not found." };
    }
    if (current.status === PortalAccessStatus.COMPLETED) {
      return {
        status: "ALREADY_COMPLETED",
        request: current,
        message: "Portal access is already completed.",
      };
    }
    if (current.status === PortalAccessStatus.PROCESSING) {
      return {
        status: "ALREADY_PROCESSING",
        request: current,
        message: "This portal request is already being processed.",
      };
    }
    return {
      status: "NOT_PROCESSABLE",
      request: current,
      message: "This portal request is not in a processable state.",
    };
  }

  // ── SAFE-FAIL GATE ──────────────────────────────────────────
  // Refuse to run before launching a browser when the shared password
  // is not configured. The password VALUE is never read, logged or
  // returned here.
  if (!hasPortalPassword()) {
    const failedRequest = await markPortalAccessFailed(
      requestId,
      "Portal registration is not configured (missing password).",
    );
    return {
      status: "CONFIGURATION",
      request: failedRequest,
      message: "Portal registration is not configured.",
      errorCode: "CONFIGURATION",
    };
  }

  // ── COURSE NORMALIZATION ────────────────────────────────────
  let courseKey: PortalCourseKey;
  try {
    courseKey = normalizePortalCourse(portalRequest.course);
  } catch (error) {
    const reason =
      error instanceof Error
        ? error.message
        : `No portal course mapping found for "${portalRequest.course ?? ""}".`;
    const failedRequest = await markPortalAccessFailed(requestId, reason);
    return { status: "FAILED", request: failedRequest, message: reason };
  }

  // ── REGISTRATION ────────────────────────────────────────────
  try {
    const result = await registration({
      name: portalRequest.studentName,
      email: portalRequest.email,
      phone: portalRequest.phone,
      course: courseKey,
    });

    if (!result.success) {
      const failedRequest = await markPortalAccessFailed(
        requestId,
        result.errorMessage ||
          result.message ||
          "Portal registration failed.",
      );
      return {
        status: "FAILED",
        request: failedRequest,
        message: result.message,
        errorCode: result.errorCode,
      };
    }

    const notes = [
      result.message,
      result.selectedCourse ? `Course: ${result.selectedCourse}` : null,
      result.portalStatus ? `Portal status: ${result.portalStatus}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const completedRequest = await markPortalAccessCompleted(requestId, {
      portalStudentId: result.portalStudentId,
      portalLogin: result.portalLogin,
      notes,
    });

    return {
      status: "COMPLETED",
      request: completedRequest,
      message: "Portal registration completed successfully.",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown portal registration error.";
    const failedRequest = await markPortalAccessFailed(requestId, message);
    return { status: "FAILED", request: failedRequest, message };
  }
}

// ── ADMISSION → PORTAL AUTOMATION ──────────────────────────────

/**
 * autoProvisionPortalForAdmission
 * ────────────────────────────────
 * Fired when an authorized admission action APPLIES the terminal
 * ADMISSION_COMPLETED transition. Ensures a PortalAccessRequest exists
 * for the enrollment's lead and processes it ONCE:
 *   · missing contact details → SKIPPED (never a malformed request),
 *   · existing COMPLETED/ PENDING/ PROCESSING/ FAILED request → the
 *     dedupe in createPortalAccessRequest returns it unchanged; a PENDING
 *     request is processed, a FAILED request is left to the manual queue,
 *   · successful registration → COMPLETED; otherwise FAILED (the
 *     admission itself stays ADMISSION_COMPLETED — it never falsely
 *     reports "portal created", and FAILED rows stay retryable).
 */
export async function autoProvisionPortalForAdmission(
  admissionEnrollmentId: string,
  options?: ProcessPortalAccessOptions,
): Promise<AutoProvisionAdmissionResult> {
  const enrollment = await prisma.admissionEnrollment.findUnique({
    where: { id: admissionEnrollmentId },
    include: { lead: true },
  });
  if (!enrollment) {
    return {
      status: "NO_ENROLLMENT",
      message: `Admission enrollment ${admissionEnrollmentId} not found.`,
    };
  }

  const studentName = enrollment.lead.name?.trim();
  const email = enrollment.lead.email?.trim();
  const phone = enrollment.lead.phone?.trim();

  if (!studentName || !email || !phone) {
    console.warn(
      `[ADMISSION PORTAL AUTO] enrollment ${admissionEnrollmentId} skipped — lead contact details are incomplete (name/email/phone).`,
    );
    return {
      status: "SKIPPED_MISSING_CONTACT_DETAILS",
      message:
        "Portal access automation skipped: lead contact details are incomplete.",
    };
  }

  // Dedupe FIRST (authoritative for the admission path): reusing the
  // createPortalAccessRequest email-dedupe alone would miss FAILED rows,
  // silently auto-retrying them as a fresh duplicate. One request per
  // email is picked (latest first) and reacted to below:
  //   · COMPLETED → done; PROCESSING → in flight; FAILED → left to the
  //     existing manual retry queue — NEVER silently auto-retried.
  //   · PENDING   → reused and processed (already queued by another
  //     flow, e.g. a demo booking).
  //   · none      → createPortalAccessRequest mints a fresh PENDING row.
  const existing = await prisma.portalAccessRequest.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const portalRequest =
    existing ??
    (await createPortalAccessRequest({
      leadId: enrollment.lead.id,
      studentName,
      email,
      phone,
      course: enrollment.course,
    }));

  switch (portalRequest.status) {
    case PortalAccessStatus.COMPLETED:
      return {
        status: "ALREADY_COMPLETED",
        portalRequest,
        message: "Portal access is already completed.",
      };
    case PortalAccessStatus.PROCESSING:
      return {
        status: "REQUEST_IN_FLIGHT",
        portalRequest,
        message: "Portal access request is already being processed.",
      };
    case PortalAccessStatus.FAILED:
      // Never silently auto-retried: the manual queue keeps control.
      return {
        status: "REQUEST_FAILED_LEFT_RETRYABLE",
        portalRequest,
        message:
          "Portal access request previously failed and is left retryable through the manual flow.",
      };
    case PortalAccessStatus.PENDING:
      break;
  }

  try {
    const processed = await processPortalAccessRequest(portalRequest.id, {
      processedBy: options?.processedBy ?? "admission-system",
      registration: options?.registration,
    });

    const statusByProcessed: Record<
      ProcessPortalAccessStatus,
      AutoProvisionAdmissionStatus
    > = {
      COMPLETED: "REQUEST_PROCESSED_COMPLETED",
      FAILED: "REQUEST_PROCESSED_FAILED",
      CONFIGURATION: "REQUEST_PROCESSED_CONFIGURATION",
      ALREADY_COMPLETED: "ALREADY_COMPLETED",
      ALREADY_PROCESSING: "REQUEST_IN_FLIGHT",
      NOT_FOUND: "REQUEST_FAILED_LEFT_RETRYABLE",
      NOT_PROCESSABLE: "REQUEST_FAILED_LEFT_RETRYABLE",
    };

    return {
      status: statusByProcessed[processed.status],
      portalRequest: processed.request ?? portalRequest,
      message: processed.message,
    };
  } catch (error) {
    // Last-resort safety net: an unexpected error must never leave the
    // request stuck in PROCESSING or fail silently. Best-effort mark a
    // visible, retryable FAILED state.
    console.error("[ADMISSION PORTAL AUTO] processing error:", error);
    try {
      await markPortalAccessFailed(
        portalRequest.id,
        error instanceof Error
          ? error.message
          : "Admission portal automation failed.",
      );
    } catch {
      // Best-effort only — never mask the original failure.
    }
    return {
      status: "REQUEST_PROCESSED_FAILED",
      message:
        "Admission portal automation failed; the request is marked failed.",
    };
  }
}