// FILE: lib/admission/admission.wiring.ts
//
// ═════════════════════════════════════════════════════════════════
// PHASE S6-C — AI ADMISSION RECORD WIRING (WHATSAPP)
//
// Connects the existing S5-C admission-intent pipeline to the S6-B1
// canonical AdmissionEnrollment record so the S6-B2 counsellor
// workspace becomes operational from real WhatsApp enquiries.
//
// This module is ORCHESTRATION ONLY. It never writes AdmissionEvent,
// never mutates AdmissionEnrollment.state directly, and never
// re-implements admission-intent classification. Every state change is
// delegated to the S6-B1 authority:
//
//   · getOrCreateAdmissionEnrollment()  (creation/reuse, Lead×course)
//   · recordAdmissionTransition()       (INTERESTED → CONTACT_PENDING)
//
// AI is only ever allowed to reach COUNSELLOR_CONTACT_PENDING (the
// S6-B1 lifecycle forbids every other state for the AI actor), and
// "I paid / payment done" is NEVER a verification — the lifecycle
// rejects any non-human move toward PAYMENT_VERIFIED / ADMISSION_*
// regardless of what this module does.
// ═════════════════════════════════════════════════════════════════

import { AdmissionActor, AdmissionState } from "@prisma/client";
import type { Conversation } from "@prisma/client";
import {
  getOrCreateAdmissionEnrollment,
  recordAdmissionTransition,
} from "./admission.service";
import { normalizeAdmissionCourse } from "./admission.lifecycle";

/** The S5-C admission-intent levels (source of truth — never
 *  re-classified here). Only MEDIUM / HIGH / URGENT constitute real
 *  admission intent; NONE / LOW are informational and create nothing. */
export type WiringAdmissionIntent =
  | "NONE"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type AiAdmissionWiringInput = {
  conversation: Pick<
    Conversation,
    "id" | "leadId" | "status" | "assignedCounsellorId" | "name"
  >;
  /** The S5-C classified intent for THIS message. */
  admissionIntent: WiringAdmissionIntent;
  /** The S5-C resolved course (current-message course, else booking
   *  course) — normalized to canonical before use. */
  course: string | null;
  /** Deterministic admission-intent reason (from the S5-C pipeline). */
  reason: string;
  humanHandoffRequested: boolean;
  groupConversation: boolean;
};

export type AiAdmissionWiringResult = {
  /** The canonical AdmissionEnrollment id, when one exists / was made. */
  enrollmentId: string | null;
  /** Whether a NEW record was created on this call. */
  created: boolean;
  /** Whether an EXISTING record was reused (Lead×course). */
  reused: boolean;
  /** Whether the AI advanced a newly-created INTERESTED record to
   *  COUNSELLOR_CONTACT_PENDING. */
  advancedToContactPending: boolean;
  /** Whether this call was skipped (a safety gate did not open). */
  skipped: boolean;
  skipReason: string | null;
};

/**
 * applyAiAdmissionWiring
 * ────────────────────────
 * Create/reuse the canonical (Lead × course) admission record for a
 * genuine S5-C admission intent, and let AI surface it to the
 * counsellor queue by advancing a NEW record to
 * COUNSELLOR_CONTACT_PENDING.
 *
 * SAFETY GATES (fail-closed, mirror the S2/S5 guards):
 *   • group                              → skip (never run for groups)
 *   • human handoff requested            → skip (handoff is authoritative)
 *   • HANDED_OFF conversation            → skip (no AI mutation)
 *   • ASSIGNED conversation              → skip (counsellor owns it)
 *   • no canonical Lead                  → skip (nothing to tie a journey to)
 *   • admission intent NONE / LOW        → skip (informational — no record)
 *   • course not a canonical coaching    → skip (getOrCreate would reject)
 *
 * IDEMPOTENCY: creation reuse is guaranteed by the @@unique([leadId,
 * course]) constraint; the INTERESTED → CONTACT_PENDING transition is
 * guaranteed at-most-once by its deterministic eventKey. Repeated
 * student messages therefore never duplicate a row or a logical event.
 */
export async function applyAiAdmissionWiring(
  input: AiAdmissionWiringInput,
): Promise<AiAdmissionWiringResult> {
  const { conversation, admissionIntent, course, reason } = input;

  if (input.groupConversation) {
    return skip("Group conversations are never wired to the admission record");
  }
  if (input.humanHandoffRequested) {
    return skip("Human handoff is authoritative — no AI admission mutation");
  }
  if (conversation.status === "HANDED_OFF") {
    return skip("Handed-off conversation — no AI admission mutation");
  }
  if (conversation.assignedCounsellorId !== null) {
    return skip("Assigned conversation — counsellor owns it, no AI mutation");
  }
  if (!conversation.leadId) {
    return skip("No canonical Lead on this conversation");
  }
  if (admissionIntent !== "MEDIUM" && admissionIntent !== "HIGH" && admissionIntent !== "URGENT") {
    return skip(`Admission intent ${admissionIntent} is not genuine joining intent`);
  }

  const canonicalCourse = normalizeAdmissionCourse(course);
  if (!canonicalCourse) {
    return skip(`Course "${String(course)}" is not a canonical coaching course`);
  }

  // Create/reuse the canonical record (Lead × canonical course).
  const { enrollment, created } = await getOrCreateAdmissionEnrollment({
    leadId: conversation.leadId,
    course: canonicalCourse,
    actor: AdmissionActor.AI,
    reason,
  });

  let advancedToContactPending = false;
  // The S6-B1 contract: AI may ONLY advance a newly-created INTERESTED
  // record to COUNSELLOR_CONTACT_PENDING. A reused record is left
  // untouched — it may already be past the AI boundary (assigned to a
  // counsellor, contacted, etc.) and the AI must not force it anywhere.
  if (created && enrollment.state === AdmissionState.INTERESTED) {
    await recordAdmissionTransition({
      enrollmentId: enrollment.id,
      toState: AdmissionState.COUNSELLOR_CONTACT_PENDING,
      actor: AdmissionActor.AI,
      reason,
    });
    advancedToContactPending = true;
  }

  return {
    enrollmentId: enrollment.id,
    created,
    reused: !created,
    advancedToContactPending,
    skipped: false,
    skipReason: null,
  };
}

function skip(skipReason: string): AiAdmissionWiringResult {
  return {
    enrollmentId: null,
    created: false,
    reused: false,
    advancedToContactPending: false,
    skipped: true,
    skipReason,
  };
}
