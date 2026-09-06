// FILE: tests/counsellor-priority.test.ts
//
// PHASE S5-C — ADMISSION INTENT + COUNSELLOR PRIORITY FOUNDATION
//
// lib/lead/counsellor.priority.ts is a PURE, deterministic, DB-free
// classifier that turns a student message + demo state into:
//
//   admission intent (NONE/LOW/MEDIUM/HIGH/URGENT)
//   counsellor priority (NONE/NORMAL/HIGH/URGENT)
//   a deterministic action recommendation
//   a small AI context block (no internal labels leaked)
//
// No DB, no AI, no network. Covers the 18 required objective cases plus
// the full classifier/priority table.
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

// Must run FIRST — dry Prisma client + GROQ_API_KEY prerequisites.
import "./env.setup";

import {
  classifyAdmissionIntent,
  evaluateCounsellorPriority,
  evaluateVerifiedAttendancePriority,
  buildCounsellorContextString,
  type CounsellorPriorityInput,
} from "../lib/lead/counsellor.priority";
import { classifyPostDemoResponse } from "../lib/demo/demo.followup";
import { evaluateDemoOpportunity } from "../lib/demo/demo.offer";
import { routeIntent } from "../lib/chat/intent-router";

type Booking = { id: string; course: string | null; status?: string | null };

function booking(course: string, status = "CONFIRMED"): Booking {
  return { id: "bok_1", course, status };
}

function decide(input: Partial<CounsellorPriorityInput> & { message: string }) {
  return evaluateCounsellorPriority({
    course: null,
    booking: null,
    postDemo: null,
    humanHandoffRequested: false,
    groupConversation: false,
    ...input,
  });
}

// ═════════════════════════════════════════════════════════════════
// OBJECTIVE 1 — admission-intent classifier
// ═════════════════════════════════════════════════════════════════

test("S5C: generic course information → admission NONE", () => {
  assert.equal(classifyAdmissionIntent("What is IELTS?").intent, "NONE");
  assert.equal(classifyAdmissionIntent("What is PTE?").intent, "NONE");
  assert.equal(classifyAdmissionIntent("Tell me about PTE please").intent, "NONE");
  assert.equal(classifyAdmissionIntent("Which country is good for Germany?").intent, "NONE");
});

test("S5C: fee question → MEDIUM admission intent", () => {
  const r = classifyAdmissionIntent("What are the fees for German coaching?");
  assert.equal(r.intent, "MEDIUM");
  assert.equal(r.signal, "fees");
});

test("S5C: batch-timing question → MEDIUM", () => {
  assert.equal(classifyAdmissionIntent("What is the batch timing for PTE?").intent, "MEDIUM");
});

test("S5C: 'when can I start' → MEDIUM", () => {
  assert.equal(classifyAdmissionIntent("When can I start the IELTS course?").intent, "MEDIUM");
});

test("S5C: documents question → MEDIUM", () => {
  assert.equal(classifyAdmissionIntent("What documents are required for German?").intent, "MEDIUM");
});

test("S5C: 'I want to join' → HIGH admission intent", () => {
  const r = classifyAdmissionIntent("I want to join the German batch");
  assert.equal(r.intent, "HIGH");
  assert.equal(r.signal, "want to join");
});

test("S5C: 'how can I enroll' → HIGH", () => {
  assert.equal(classifyAdmissionIntent("How can I enroll in PTE?").intent, "HIGH");
});

test("S5C: 'I want admission' → HIGH", () => {
  assert.equal(classifyAdmissionIntent("I want admission to IELTS").intent, "HIGH");
});

test("S5C: 'I want to pay' → URGENT, never downgraded to fee=MEDIUM", () => {
  const r = classifyAdmissionIntent("I want to pay the fees and join");
  assert.equal(r.intent, "URGENT");
});

test("S5C: 'send registration link' → URGENT", () => {
  assert.equal(classifyAdmissionIntent("Please send the registration link").intent, "URGENT");
});

test("S5C: 'register me' → URGENT", () => {
  assert.equal(classifyAdmissionIntent("Register me for the course").intent, "URGENT");
});

test("S5C: 'fees and payment' → URGENT", () => {
  assert.equal(classifyAdmissionIntent("I want to know fees and payment").intent, "URGENT");
});

test("S5C: 'book my admission' → URGENT", () => {
  assert.equal(classifyAdmissionIntent("Book my admission for IELTS").intent, "URGENT");
});

test("S5C: need time → LOW", () => {
  const r = classifyAdmissionIntent("I need some time to decide");
  assert.equal(r.intent, "LOW");
});

test("S5C: just checking → LOW", () => {
  assert.equal(classifyAdmissionIntent("Just checking").intent, "LOW");
});

test("S5C: send information → LOW", () => {
  assert.equal(classifyAdmissionIntent("Please send information about German").intent, "LOW");
});

// ═════════════════════════════════════════════════════════════════
// OBJECTIVE 3 — counsellor priority table
// ═════════════════════════════════════════════════════════════════

test("S5C#1: generic information → priority NONE", () => {
  const r = decide({ message: "What is IELTS?" });
  assert.equal(r.priority, "NONE");
  assert.equal(r.admissionIntent, "NONE");
});

test("S5C#2: cold fee question → MEDIUM intent + NORMAL priority", () => {
  const r = decide({ message: "What are the fees for German?", course: "German" });
  assert.equal(r.admissionIntent, "MEDIUM");
  assert.equal(r.priority, "NORMAL");
  assert.equal(r.action, "Follow up regarding course fees.");
  assert.equal(r.demoEligible, false);
});

test("S5C#3: 'I want to join' → HIGH priority (cold)", () => {
  const r = decide({ message: "I want to join the German batch", course: "German" });
  assert.equal(r.admissionIntent, "HIGH");
  assert.equal(r.priority, "HIGH");
  assert.equal(r.action, "Contact student to complete admission interest.");
});

test("S5C#4: 'I want to pay' → URGENT priority", () => {
  const r = decide({ message: "I want to pay", course: "German" });
  assert.equal(r.priority, "URGENT");
  assert.equal(r.action, "Contact student for admission/payment assistance.");
});

test("S5C#5: need time → LOW + NONE (no immediate action)", () => {
  const r = decide({ message: "I need some time to decide", course: "German" });
  assert.equal(r.admissionIntent, "LOW");
  assert.equal(r.priority, "NONE");
  assert.match(r.action, /no immediate sales action/i);
});

test("S5C#6: not interested → no sales escalation", () => {
  const postDemo = classifyPostDemoResponse("Actually I am not interested");
  const r = decide({
    message: "Actually I am not interested",
    course: "German",
    booking: booking("German"),
    postDemo,
  });
  assert.equal(r.priority, "NONE");
  assert.equal(r.action, "Student declined — no sales action.");
});

test("S5C#7: demo attended + join → URGENT", () => {
  const postDemo = classifyPostDemoResponse("The demo was great, I want to join");
  const r = decide({
    message: "The demo was great, I want to join",
    course: "German",
    booking: booking("German"),
    postDemo,
  });
  assert.equal(postDemo.attendance, "ATTENDED");
  assert.equal(r.priority, "URGENT");
});

test("S5C#8: demo booked + fee question → HIGH (boost over cold NORMAL)", () => {
  const cold = decide({ message: "What are the fees for German?", course: "German" });
  const booked = decide({
    message: "What are the fees for German?",
    course: "German",
    booking: booking("German"),
  });
  assert.equal(cold.priority, "NORMAL");
  assert.equal(booked.priority, "HIGH");
  assert.equal(booked.demoEligible, true);
  assert.equal(booked.action, "Follow up regarding course fees.");
});

test("S5C#9: old German demo + new IELTS question → only IELTS context, no German boost", () => {
  const opportunity = evaluateDemoOpportunity("I want admission to IELTS");
  assert.equal(opportunity.course, "IELTS");

  const r = decide({
    message: "I want admission to IELTS",
    course: opportunity.course,
    booking: booking("German", "PENDING"),
  });
  assert.equal(r.course, "IELTS");
  assert.equal(r.demoEligible, false);
  assert.equal(r.admissionIntent, "HIGH");

  const block = buildCounsellorContextString({
    priority: r.priority,
    admissionIntent: r.admissionIntent,
    course: r.course,
    demoEligible: r.demoEligible,
  });
  assert.ok(block);
  assert.match(block, /IELTS/);
  assert.doesNotMatch(block, /German/);
});

test("S5C#10: human handoff → existing behavior unchanged (NONE here, authoritative there)", () => {
  const r = decide({
    message: "I want to join",
    course: "German",
    humanHandoffRequested: true,
  });
  assert.equal(r.priority, "NONE");
  assert.match(r.action, /existing handoff flow remains authoritative/i);

  const routed = routeIntent({ message: "I need to talk to a human", awaitingDemoConfirmation: false });
  assert.equal(routed.intent, "HUMAN_HANDOFF");
});

test("S5C#11: group messages → completely excluded", () => {
  const r = decide({ message: "I want to pay", groupConversation: true });
  assert.equal(r.priority, "NONE");
  assert.equal(r.action, "Group message — no counsellor action.");
});

test("S5C: interested after demo but no direct admission ask → NORMAL", () => {
  const postDemo = classifyPostDemoResponse("I liked the demo");
  const r = decide({
    message: "I liked the demo",
    course: "German",
    booking: booking("German"),
    postDemo,
  });
  assert.equal(r.admissionIntent, "NONE");
  assert.equal(r.priority, "NORMAL");
  assert.equal(r.action, "Follow up after demo.");
});

test("S5C: demo attended but no admission request → NORMAL (interested, no direct ask)", () => {
  const postDemo = classifyPostDemoResponse("The demo was nice, tell me more");
  const r = decide({
    message: "The demo was nice, tell me more",
    course: "German",
    booking: booking("German"),
    postDemo,
  });
  assert.equal(postDemo.attendance, "ATTENDED");
  assert.equal(r.priority, "NORMAL");
});

test("S5C: no course mentioned + booking exists → signal course falls back to booking course", () => {
  const r = decide({
    message: "I want to join",
    course: null,
    booking: booking("German"),
  });
  assert.equal(r.course, "German");
  assert.equal(r.demoEligible, true);
  assert.equal(r.priority, "HIGH");
});

// ═════════════════════════════════════════════════════════════════
// OBJECTIVE 5 — AI context block (no label/score leakage)
// ═════════════════════════════════════════════════════════════════

test("S5C: context block is null when priority is NONE", () => {
  const r = decide({ message: "What is IELTS?" });
  assert.equal(r.priority, "NONE");
  assert.equal(
    buildCounsellorContextString({
      priority: r.priority,
      admissionIntent: r.admissionIntent,
      course: r.course,
    }),
    null
  );
});

test("S5C: context block never leaks internal priority labels or scores", () => {
  const block = buildCounsellorContextString({
    priority: "URGENT",
    admissionIntent: "URGENT",
    course: "German",
    demoEligible: true,
    attended: true,
  })!;
  assert.match(block, /German/);
  assert.doesNotMatch(block, /URGENT/i);
  assert.doesNotMatch(block, /HIGH|NORMAL/i);
  assert.doesNotMatch(block, /lead score|score/i);
  assert.doesNotMatch(block, /counsellor (?:has|will) (?:already )?contact/i);
  assert.match(block, /never pressure/i);
  assert.match(block, /counsellor/i);
});

test("S5C: context block claims a completed demo only when travel was attended", () => {
  const attended = buildCounsellorContextString({
    priority: "HIGH",
    admissionIntent: "HIGH",
    course: "PTE",
    demoEligible: true,
    attended: true,
  })!;
  assert.match(attended, /completed a free PTE demo/);

  const bookedOnly = buildCounsellorContextString({
    priority: "HIGH",
    admissionIntent: "MEDIUM",
    course: "PTE",
    demoEligible: true,
    attended: false,
  })!;
  assert.match(bookedOnly, /booked or in progress/);
  assert.doesNotMatch(bookedOnly, /completed a free PTE demo/);
});

// ═════════════════════════════════════════════════════════════════
// OBJECTIVE 7 — stale-demo safety preserved (extra)
// ═════════════════════════════════════════════════════════════════

test("S5C: PTE/PTE Academic normalisation still matches (tolerant guard)", () => {
  const r = decide({
    message: "What are the fees for PTE?",
    course: "PTE",
    booking: booking("PTE Academic"),
  });
  assert.equal(r.demoEligible, true);
  assert.equal(r.priority, "HIGH");

  const r2 = decide({
    message: "What are the fees for PTE?",
    course: "PTE",
    booking: booking("German"),
  });
  assert.equal(r2.demoEligible, false);
});

// ═════════════════════════════════════════════════════════════════
// OBJECTIVE 4 — action recommendations
// ═════════════════════════════════════════════════════════════════

test("S5C: action never claims a counsellor contacted the student", () => {
  const r = decide({ message: "I want to pay" });
  assert.doesNotMatch(r.action, /counsellor (has|has already) contacted/i);
  assert.equal(r.priority, "URGENT");
  assert.equal(r.action, "Contact student for admission/payment assistance.");
});

// ═════════════════════════════════════════════════════════════════
// S6-D3 — VERIFIED ATTENDANCE CONVERSION SIGNAL
// The HUMAN-VERIFIED DemoBooking.status === "ATTENDED" (S6-D2-B) is a
// distinct, authoritative input (verifiedAttendance) that only escalates
// the counsellor queue. It never auto-verifies payment, never confirms
// admission, never marks the student contacted, and is course-isolated.
// ═════════════════════════════════════════════════════════════════

test("S6D3: verified ATTENDED + join → URGENT (ADMISSION_ASSISTANCE)", () => {
  const r = decide({
    message: "I want to join the German batch",
    course: "German",
    booking: booking("German", "ATTENDED"),
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  assert.equal(r.priority, "URGENT");
});

test("S6D3: verified ATTENDED + fees/payment → HIGH (PRIORITY_FOLLOW_UP)", () => {
  const r = decide({
    message: "What are the fees for German?",
    course: "German",
    booking: booking("German", "ATTENDED"),
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  assert.equal(r.priority, "HIGH");
});

test("S6D3: verified ATTENDED + general interest → HIGH (PRIORITY_FOLLOW_UP)", () => {
  const r = decide({
    message: "I liked the demo",
    course: "German",
    booking: booking("German", "ATTENDED"),
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  // Baseline S5-C is NONE (no post-demo signal); verified ATTENDED floor-raises to HIGH.
  assert.equal(r.priority, "HIGH");
  assert.match(r.action, /verified demo attendance/i);
});

test("S6D3: verified ATTENDED + declined → no escalation (stays NONE)", () => {
  const postDemo = classifyPostDemoResponse("Actually I am not interested");
  const r = decide({
    message: "Actually I am not interested",
    course: "German",
    booking: booking("German", "ATTENDED"),
    postDemo,
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  assert.equal(r.priority, "NONE");
  assert.equal(r.action, "Student declined — no sales action.");
});

test("S6D3: NO_SHOW booking → no escalation (S5-C baseline only)", () => {
  const r = decide({
    message: "What are the fees for German?",
    course: "German",
    booking: booking("German", "NO_SHOW"),
    verifiedAttendance: { course: "German", status: "NO_SHOW" },
  });
  // No verified boost; cold-booked MEDIUM fee → HIGH from demo eligibility only.
  assert.equal(r.priority, "HIGH");
  assert.doesNotMatch(r.action, /verified demo attendance/i);
});

test("S6D3: NO_SHOW on a low-signal message → NONE (no escalation)", () => {
  const r = decide({
    message: "I liked the demo",
    course: "German",
    booking: booking("German", "NO_SHOW"),
    verifiedAttendance: { course: "German", status: "NO_SHOW" },
  });
  assert.equal(r.priority, "NONE");
});

test("S6D3: CANCELLED booking → no verified signal", () => {
  const r = decide({
    message: "I want to join",
    course: "German",
    booking: booking("German", "CANCELLED"),
    verifiedAttendance: { course: "German", status: "CANCELLED" },
  });
  assert.notEqual(r.priority, "URGENT");
  assert.doesNotMatch(r.action, /verified demo attendance/i);
});

test("S6D3: PENDING/CONFIRMED (not yet attended) → no verified boost", () => {
  const pending = decide({
    message: "I want to join the German batch",
    course: "German",
    booking: booking("German", "PENDING"),
    verifiedAttendance: { course: "German", status: "PENDING" },
  });
  assert.equal(pending.priority, "HIGH"); // S5-C HIGH baseline, no verified URGENT

  const confirmed = decide({
    message: "I want to join the German batch",
    course: "German",
    booking: booking("German", "CONFIRMED"),
    verifiedAttendance: { course: "German", status: "CONFIRMED" },
  });
  assert.equal(confirmed.priority, "HIGH");
});

test("S6D3: no booking row → verified signal never fires (existing S5-C)", () => {
  const r = decide({
    message: "I want to join the German batch",
    course: "German",
    booking: null,
    verifiedAttendance: null,
  });
  assert.equal(r.priority, "HIGH");
});

test("S6D3: wrong course → no cross-course signal (course isolation)", () => {
  const r = decide({
    message: "I want to join IELTS",
    course: "IELTS",
    booking: booking("German", "ATTENDED"),
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  // German demo must never escalate an IELTS conversation.
  assert.notEqual(r.priority, "URGENT");
  assert.doesNotMatch(r.action, /verified demo attendance/i);
});

test("S6D3: PTE/PTE Academic tolerant guard still applies to verified signal", () => {
  const r = decide({
    message: "I want to join the PTE batch",
    course: "PTE",
    booking: booking("PTE Academic", "ATTENDED"),
    verifiedAttendance: { course: "PTE Academic", status: "ATTENDED" },
  });
  assert.equal(r.priority, "URGENT");
});

test("S6D3: verified signal never auto-verifies payment/admission or marks contacted", () => {
  const r = decide({
    message: "I want to join",
    course: "German",
    booking: booking("German", "ATTENDED"),
    verifiedAttendance: { course: "German", status: "ATTENDED" },
  });
  assert.match(r.action, /admission|assistance/i);
  assert.doesNotMatch(r.action, /payment (?:confirmed|received)|admission (?:confirmed|approved)/i);
  assert.doesNotMatch(r.action, /counsellor (?:has|has already) contacted/i);
});

test("S6D3: evaluateVerifiedAttendancePriority pure mapping (declined → no boost)", () => {
  const admission = classifyAdmissionIntent("Actually I am not interested");
  const postDemo = classifyPostDemoResponse("Actually I am not interested");
  const res = evaluateVerifiedAttendancePriority({
    admission,
    message: "Actually I am not interested",
    postDemo,
    verifiedAttendance: { course: "German", status: "ATTENDED" },
    demoEligible: true,
    signalCourse: "German",
  });
  assert.equal(res.applied, false);
});

test("S6D3: evaluateVerifiedAttendancePriority course isolation (no boost off-course)", () => {
  const admission = classifyAdmissionIntent("I want to join");
  const res = evaluateVerifiedAttendancePriority({
    admission,
    message: "I want to join",
    postDemo: null,
    verifiedAttendance: { course: "German", status: "ATTENDED" },
    demoEligible: false,
    signalCourse: "IELTS",
  });
  assert.equal(res.applied, false);
});

test("S6D3: evaluateVerifiedAttendancePriority only fires on ATTENDED status", () => {
  const admission = classifyAdmissionIntent("I want to join");
  for (const status of ["PENDING", "CONFIRMED", "NO_SHOW", "CANCELLED", null]) {
    const res = evaluateVerifiedAttendancePriority({
      admission,
      message: "I want to join",
      postDemo: null,
      verifiedAttendance: { course: "German", status },
      demoEligible: true,
      signalCourse: "German",
    });
    assert.equal(res.applied, false, `status ${status} must not apply a verified boost`);
  }
});