// FILE: tests/lead.qualification.test.ts
//
// ═════════════════════════════════════════════════════════════════
// LEAD-QUALIFICATION-AGENT-02 — PURE TEST SUITE
//
// 16-case matrix for the deterministic, DB-free lead qualification
// module. Pure tests — no Prisma calls, no AI, no network.
//
// Run: DATABASE_URL="postgresql://test:test@127.0.0.1:5432/test" \
//      npx tsx tests/lead.qualification.test.ts
// ═════════════════════════════════════════════════════════════════

import { test } from "node:test";
import assert from "node:assert/strict";
import "./env.setup";

import {
  qualifyLead,
  validateLeadQualification,
  deriveLeadStage,
  MAX_MISSING_INFO,
  MAX_COUNSELLOR_SUMMARY,
  QUALIFICATION_FACT_CONFIDENCE,
  QUALIFICATION_INFERENCE_CONFIDENCE,
  LEAD_STAGE_LABELS,
  type LeadQualificationInput,
  type LeadQualification,
  type LeadStage,
} from "../lib/lead/lead.qualification";

// ── Helpers ─────────────────────────────────────────────────────

function base(overrides: Partial<LeadQualificationInput> = {}): LeadQualificationInput {
  return {
    conversation: { id: "conv_test_1", name: null, status: "ACTIVE" },
    lead: null,
    leadContext: null,
    demoBookings: null,
    admissions: null,
    latestAction: null,
    transcript: null,
    ...overrides,
  };
}

function userMsg(content: string): LeadQualificationInput["transcript"] {
  return [{ role: "USER", content }];
}

function cleanResult(q: LeadQualification): void {
  // Structural invariants that MUST hold for every valid qualification.
  assert.ok(
    typeof q.counsellorSummary === "string" && q.counsellorSummary.length > 0,
    "counsellorSummary must be a non-empty string",
  );
  assert.ok(
    q.counsellorSummary.length <= MAX_COUNSELLOR_SUMMARY,
    `counsellorSummary must be ≤${MAX_COUNSELLOR_SUMMARY} chars (got ${q.counsellorSummary.length})`,
  );
  assert.ok(
    typeof q.reason === "string" && q.reason.length > 0,
    "reason must be a non-empty string",
  );
  assert.ok(
    typeof q.nextAction === "string" && q.nextAction.length > 0,
    "nextAction must be a non-empty string",
  );
  assert.ok(
    Array.isArray(q.missingInfo) && q.missingInfo.length <= MAX_MISSING_INFO,
    `missingInfo must be an array of ≤${MAX_MISSING_INFO} entries`,
  );
  // Confidence: null OR 0..1
  assert.ok(
    q.confidence === null || (typeof q.confidence === "number" && q.confidence >= 0 && q.confidence <= 1),
    `confidence must be null or 0..1, got ${q.confidence}`,
  );
  // leadStage must be a canonical value.
  assert.ok(
    typeof q.leadStage.value === "string" && q.leadStage.value.length > 0,
    "leadStage must have a non-empty string value",
  );
  // Basis must be FACT | INFERENCE | UNKNOWN.
  for (const key of [
    "intent", "course", "exam", "destination", "studentType",
    "intake", "timeline", "budget", "urgency", "leadStage",
  ] as const) {
    const f = q[key];
    assert.ok(
      f && typeof f === "object",
      `${key} must be an object`,
    );
    assert.ok(
      f.basis === "FACT" || f.basis === "INFERENCE" || f.basis === "UNKNOWN",
      `${key}.basis must be FACT/INFERENCE/UNKNOWN, got ${f.basis}`,
    );
  }
}

// ═════════════════════════════════════════════════════════════════
// 16-CASE MATRIX
// ═════════════════════════════════════════════════════════════════

test("case 1 — general empty context → NEW, all UNKNOWN, informational next action", () => {
  const q = qualifyLead(base());
  cleanResult(q);
  assert.equal(q.leadStage.value, "NEW");
  assert.equal(q.course.basis, "UNKNOWN");
  assert.equal(q.exam.basis, "UNKNOWN");
  assert.equal(q.destination.basis, "UNKNOWN");
  assert.equal(q.studentType.basis, "UNKNOWN");
  assert.equal(q.confidence, null, "no FACT fields → confidence must be null");
  assert.ok(q.missingInfo.length > 0, "missingInfo should list gaps");
  // Coaching missing-info action precedes the generic "Information only."
  // fallback (design priority 2 > 4).
  assert.equal(q.nextAction, "Ask for the student's course.");
});

test("case 2 — Canada destination → QUALIFIED, course FACT, destination FACT, exam FACT", () => {
  const q = qualifyLead(base({
    leadContext: {
      targetCountry: "Canada",
      targetCourse: "IELTS Academic",
      englishLevel: "IELTS Academic — beginner",
    },
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "QUALIFIED");
  assert.equal(q.course.value, "IELTS Academic");
  assert.equal(q.course.basis, "FACT");
  assert.equal(q.destination.value, "Canada");
  assert.equal(q.destination.basis, "FACT");
  // Exam extracted from englishLevel acronym.
  assert.equal(q.exam.value, "IELTS");
  assert.equal(q.exam.basis, "FACT");
  assert.equal(q.confidence, 1, "all FACT fields → confidence = 1");
});

test("case 3 — explicit budget → budget is FACT, confidence stays 1", () => {
  const q = qualifyLead(base({
    leadContext: {
      targetCountry: "Australia",
      targetCourse: "IELTS General",
      budgetRange: "₹80,000",
      englishLevel: "IELTS Academic",
    },
  }));
  cleanResult(q);
  assert.equal(q.budget.value, "₹80,000");
  assert.equal(q.budget.basis, "FACT");
  assert.equal(q.confidence, 1);
});

test("case 4 — partial context → QUALIFYING, some FACT, some UNKNOWN", () => {
  const q = qualifyLead(base({
    leadContext: {
      targetCourse: "PTE",
      targetCountry: "UK",
      // no englishLevel, budget, intake, timeline, goal
    },
  }));
  cleanResult(q);
  // course + destination present → QUALIFIED (course + at least one qualifier)
  assert.equal(q.leadStage.value, "QUALIFIED");
  assert.equal(q.course.value, "PTE");
  assert.equal(q.course.basis, "FACT");
  assert.equal(q.destination.value, "UK");
  assert.equal(q.destination.basis, "FACT");
  assert.equal(q.budget.basis, "UNKNOWN");
  assert.equal(q.intake.basis, "UNKNOWN");
});

test("case 5 — 'I want to join' → HIGH intent, HIGH_INTENT stage", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I want to join the IELTS batch"),
    leadContext: {
      targetCourse: "IELTS",
      targetCountry: "Canada",
      englishLevel: "IELTS",
    },
  }));
  cleanResult(q);
  assert.equal(q.intent.value, "HIGH");
  assert.equal(q.intent.basis, "INFERENCE");
  // Admission states present + HIGH intent → HIGH_INTENT
  assert.equal(q.leadStage.value, "HIGH_INTENT");
});

test("case 6 — 'I want to pay / register me' → URGENT intent", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I want to pay now, register me"),
  }));
  cleanResult(q);
  assert.equal(q.intent.value, "URGENT");
  assert.equal(q.intent.basis, "INFERENCE");
  // No qualifying signals yet but URGENT intent alone → HIGH_INTENT stage
  assert.equal(q.leadStage.value, "HIGH_INTENT");
  // Coaching missing-info action precedes the generic fallback.
  assert.equal(q.nextAction, "Ask for the student's course.");
});

test("case 7 — 'What is IELTS?' → informational NONE, ENGAGED stage", () => {
  const q = qualifyLead(base({
    transcript: userMsg("What is IELTS?"),
  }));
  cleanResult(q);
  assert.equal(q.intent.value, "NONE");
  assert.equal(q.intent.basis, "INFERENCE");
  assert.equal(q.leadStage.value, "ENGAGED");
  // Coaching missing-info action precedes the generic fallback.
  assert.equal(q.nextAction, "Ask for the student's course.");
});

test("case 8 — post-demo attended → stage reflects demo signal", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I attended the demo, it was great, I want to join"),
    leadContext: {
      targetCourse: "IELTS",
      englishLevel: "IELTS",
    },
    demoBookings: [{ course: "IELTS", status: "ATTENDED", preferredBatch: "Morning" }],
  }));
  cleanResult(q);
  // "want to join" + attended demo → HIGH intent
  assert.equal(q.intent.value, "HIGH");
  // Stage: admitted demo booking + HIGH intent → HIGH_INTENT
  assert.equal(q.leadStage.value, "HIGH_INTENT");
});

test("case 9 — post-demo declined → LOST", () => {
  const q = qualifyLead(base({
    transcript: userMsg("Sorry I am not interested anymore"),
    demoBookings: [{ course: "IELTS", status: "ATTENDED", preferredBatch: "Morning" }],
    leadContext: { targetCourse: "IELTS", englishLevel: "IELTS" },
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "LOST");
});

test("case 10 — phone in message does NOT overwrite identity", () => {
  const q = qualifyLead(base({
    conversation: { id: "c1", name: "Priya Sharma", status: "ACTIVE", phone: "+911122223333", email: "priya@test.com" },
    lead: { name: "Priya Sharma", phone: "+911122223333", email: "priya@test.com" },
    transcript: userMsg("My number is +919988776655 call me at that number"),
  }));
  cleanResult(q);
  // The student's identity is from CRM lead/conversation, not from the transcript.
  assert.equal(q.missingInfo.includes("name"), false, "should not flag name as missing");
  assert.equal(q.missingInfo.includes("contact details"), false, "should not flag contact details as missing");
});

test("case 11 — sensitive-trait message → no invented sensitive fields", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I am Muslim and from Pakistan, I have diabetes"),
  }));
  cleanResult(q);
  // The module never invents nationality, religion, health fields.
  // All such fields remain UNKNOWN.
  assert.equal(q.destination.basis, "UNKNOWN", "nationality must not become a destination FACT");
  assert.equal(q.studentType.basis, "UNKNOWN", "health/politics must not become studentType FACT");
  assert.equal(q.intent.value, "NONE");
});

test("case 12 — confidence bounds null-or-0..1 on every case", () => {
  for (const overrides of [
    {},
    { leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" } },
    { transcript: userMsg("I want to pay now") },
    { transcript: userMsg("What is PTE?") },
    { leadContext: { budgetRange: "₹50,000" } },
  ]) {
    const q = qualifyLead(base(overrides));
    assert.ok(
      q.confidence === null || (typeof q.confidence === "number" && q.confidence >= 0 && q.confidence <= 1),
      `confidence out of bounds: ${q.confidence}`,
    );
  }
});

test("case 13 — empty/whitespace/non-string message handled gracefully", () => {
  // null transcript
  const q1 = qualifyLead(base({ transcript: null }));
  cleanResult(q1);
  assert.equal(q1.intent.value, "NONE");

  // empty array
  const q2 = qualifyLead(base({ transcript: [] }));
  cleanResult(q2);
  assert.equal(q2.intent.value, "NONE");

  // whitespace-only message
  const q3 = qualifyLead(base({ transcript: [{ role: "USER", content: "   " }] }));
  cleanResult(q3);
  assert.equal(q3.intent.value, "NONE");
  assert.equal(q3.leadStage.value, "NEW");
});

test("case 14 — idempotent recomputation yields same result", () => {
  const input = base({
    conversation: { id: "c1", name: "Rahul", status: "ACTIVE", assignedCounsellorId: "staff_1" },
    lead: { name: "Rahul", phone: "+911111111111" },
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS", budgetRange: "₹70,000" },
    transcript: userMsg("I want to join the IELTS batch, how do I pay?"),
    admissions: [{ course: "IELTS", state: "COUNSELLOR_CONTACTED" }],
  });
  const q1 = qualifyLead(input);
  const q2 = qualifyLead(input);
  assert.deepStrictEqual(q1, q2, "qualifyLead must be idempotent — same input, same output");
});

test("case 15 — assigned/handed-off/group suppression → neutral next action", () => {
  // Assigned counsellor → neutral action, never claims "counsellor contacted"
  const qAssigned = qualifyLead(base({
    conversation: { id: "c1", name: null, status: "ACTIVE", assignedCounsellorId: "staff_1" },
    transcript: userMsg("I want to pay"),
    leadContext: { targetCourse: "IELTS", englishLevel: "IELTS" },
  }));
  cleanResult(qAssigned);
  assert.ok(
    !qAssigned.nextAction.toLowerCase().includes("counsellor contacted"),
    "must never claim counsellor contacted",
  );

  // HANDED_OFF → neutral action
  const qHandedOff = qualifyLead(base({
    conversation: { id: "c2", name: null, status: "HANDED_OFF", assignedCounsellorId: "staff_2" },
    transcript: userMsg("I want to join"),
    leadContext: { targetCourse: "IELTS", englishLevel: "IELTS" },
  }));
  cleanResult(qHandedOff);
  assert.ok(
    !qHandedOff.nextAction.toLowerCase().includes("counsellor contacted"),
    "handed-off must never claim counsellor contacted",
  );

  // Group conversation → neutral
  const qGroup = qualifyLead(base({
    conversation: { id: "c3", name: "Rahul (group)", status: "ACTIVE" },
    transcript: userMsg("I want to join"),
    leadContext: { targetCourse: "IELTS", englishLevel: "IELTS" },
  }));
  cleanResult(qGroup);
  assert.ok(
    qGroup.nextAction.toLowerCase().includes("group"),
    "group conversation should mention 'group' in next action",
  );
});

test("case 16 — budget only from explicit budgetRange, never invented", () => {
  const qNoBudget = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" },
  }));
  assert.equal(qNoBudget.budget.value, null, "budget must be null without budgetRange");
  assert.equal(qNoBudget.budget.basis, "UNKNOWN");

  const qWithBudget = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS", budgetRange: "₹50,000 - ₹80,000" },
  }));
  assert.equal(qWithBudget.budget.value, "₹50,000 - ₹80,000");
  assert.equal(qWithBudget.budget.basis, "FACT");
});

// ═════════════════════════════════════════════════════════════════
// VALIDATION TESTS
// ═════════════════════════════════════════════════════════════════

test("validateLeadQualification accepts a clean qualification object", () => {
  const q = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" },
  }));
  const result = validateLeadQualification(q);
  assert.equal(result.valid, true, `expected valid, got errors: ${JSON.stringify(result.valid === false ? result.errors : [])}`);
});

test("validate rejects invalid basis", () => {
  const q = qualifyLead(base());
  const bad = { ...q, course: { ...q.course, basis: "INVALID" } };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("invalid basis")));
});

test("validate rejects confidence out of bounds", () => {
  const q = qualifyLead(base());
  const bad = { ...q, course: { value: "IELTS", basis: "FACT" as const, confidence: 1.5 } };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("out of 0..1")));
});

test("validate rejects non-null UNKNOWN value", () => {
  const bad = {
    intent: { value: "NONE", basis: "INFERENCE" as const, confidence: 0.8 },
    course: { value: "some value", basis: "UNKNOWN" as const, confidence: null },
    exam: { value: null, basis: "UNKNOWN" as const, confidence: null },
    destination: { value: null, basis: "UNKNOWN" as const, confidence: null },
    studentType: { value: null, basis: "UNKNOWN" as const, confidence: null },
    intake: { value: null, basis: "UNKNOWN" as const, confidence: null },
    timeline: { value: null, basis: "UNKNOWN" as const, confidence: null },
    budget: { value: null, basis: "UNKNOWN" as const, confidence: null },
    urgency: { value: "MEDIUM", basis: "INFERENCE" as const, confidence: 0.8 },
    leadStage: { value: "QUALIFYING", basis: "INFERENCE" as const, confidence: 0.8 },
    confidence: 0.8,
    missingInfo: [],
    nextAction: "Information only.",
    counsellorSummary: "Test summary",
    reason: "Test reason",
  };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("UNKNOWN") && e.includes("course")));
});

test("validate rejects empty reason when INFERENCE is used", () => {
  const q = qualifyLead(base());
  // All intent is INFERENCE, so reason must be non-empty.
  const bad = { ...q, reason: "" };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("reason")));
});

test("validate rejects missingInfo exceeding MAX_MISSING_INFO", () => {
  const q = qualifyLead(base());
  const bad = { ...q, missingInfo: ["a", "b", "c", "d", "e", "f"] };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("missingInfo")));
});

test("validate rejects counsellorSummary exceeding MAX_COUNSELLOR_SUMMARY", () => {
  const q = qualifyLead(base());
  const bad = { ...q, counsellorSummary: "x".repeat(MAX_COUNSELLOR_SUMMARY + 1) };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false);
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("counsellorSummary")));
});

test("validate rejects malformed qualification object", () => {
  assert.equal(validateLeadQualification(null).valid, false);
  assert.equal(validateLeadQualification({}).valid, false);
  assert.equal(validateLeadQualification("string").valid, false);
});

// ═════════════════════════════════════════════════════════════════
// DERIVE LEAD STAGE — isolated stage tests
// ═════════════════════════════════════════════════════════════════

test("deriveLeadStage — LOST when admission state is LOST", () => {
  const { stage } = deriveLeadStage({
    admissions: [{ course: "IELTS", state: "LOST" }],
  });
  assert.equal(stage, "LOST");
});

test("deriveLeadStage — ADMISSION_READY when documents pending", () => {
  const { stage } = deriveLeadStage({
    admissions: [{ course: "IELTS", state: "DOCUMENTS_PENDING" }],
  });
  assert.equal(stage, "ADMISSION_READY");
});

test("deriveLeadStage — ENGAGED when only transcript present", () => {
  const { stage } = deriveLeadStage({
    transcript: [{ role: "USER", content: "Hi there" }],
  });
  assert.equal(stage, "ENGAGED");
});

test("deriveLeadStage — NEW when no signals at all", () => {
  const { stage } = deriveLeadStage({});
  assert.equal(stage, "NEW");
});

// ═════════════════════════════════════════════════════════════════
// STAGE PRECEDENCE — LOST always wins over READY
// ═════════════════════════════════════════════════════════════════

test("stage precedence — LOST wins over ADMISSION_READY", () => {
  const { stage } = deriveLeadStage({
    admissions: [
      { course: "IELTS", state: "LOST" },
      { course: "PTE", state: "DOCUMENTS_PENDING" },
    ],
  });
  assert.equal(stage, "LOST");
});

test("stage precedence — ADMISSION_READY wins over HIGH_INTENT", () => {
  const { stage } = deriveLeadStage({
    admissions: [
      { course: "IELTS", state: "INTERESTED" },
      { course: "PTE", state: "PAYMENT_PENDING" },
    ],
  });
  assert.equal(stage, "ADMISSION_READY");
});

// ═════════════════════════════════════════════════════════════════
// FACT/INFERENCE INVARIANTS
// ═════════════════════════════════════════════════════════════════

test("intent is always INFERENCE (never FACT, never UNKNOWN value with non-null confidence)", () => {
  const cases = [
    {},
    { transcript: userMsg("I want to join") },
    { leadContext: { targetCourse: "IELTS" } },
    { transcript: userMsg("What is IELTS?") },
  ];
  for (const overrides of cases) {
    const q = qualifyLead(base(overrides));
    assert.equal(q.intent.basis, "INFERENCE", `intent.basis should be INFERENCE for input ${JSON.stringify(overrides)}`);
    assert.equal(typeof q.intent.confidence, "number", "intent.confidence must be a number when INFERENCE");
  }
});

test("UNKNOWN fields always have null value and null confidence", () => {
  const q = qualifyLead(base());
  for (const key of ["course", "exam", "destination", "studentType", "intake", "timeline", "budget"] as const) {
    const f = q[key];
    if (f.basis === "UNKNOWN") {
      assert.equal(f.value, null, `${key}.value must be null when UNKNOWN`);
      assert.equal(f.confidence, null, `${key}.confidence must be null when UNKNOWN`);
    }
  }
});

test("FACT fields always have a non-empty value and confidence = 1", () => {
  const q = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS", budgetRange: "₹60,000", intake: "September 2025" },
  }));
  for (const key of ["course", "exam", "destination", "budget", "intake"] as const) {
    const f = q[key];
    assert.equal(f.basis, "FACT", `${key}.basis should be FACT`);
    assert.ok(typeof f.value === "string" && f.value.length > 0, `${key}.value must be non-empty string for FACT`);
    assert.equal(f.confidence, QUALIFICATION_FACT_CONFIDENCE, `${key}.confidence should be ${QUALIFICATION_FACT_CONFIDENCE}`);
  }
});

test("INFERENCE fields always have confidence = 0.8", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I want to join"),
    leadContext: { goal: "study" },
  }));
  // intent and urgency are INFERENCE
  assert.equal(q.intent.basis, "INFERENCE");
  assert.equal(q.intent.confidence, QUALIFICATION_INFERENCE_CONFIDENCE);
  if (q.urgency.basis === "INFERENCE") {
    assert.equal(q.urgency.confidence, QUALIFICATION_INFERENCE_CONFIDENCE);
  }
});

// ═════════════════════════════════════════════════════════════════
// COUNSELLOR SUMMARY — never null, never empty, never "null"/"undefined"
// ═════════════════════════════════════════════════════════════════

test("counsellor summary never contains literal null/undefined", () => {
  for (const overrides of [
    {},
    { leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" } },
    { transcript: userMsg("I want to join") },
    { conversation: { id: "c1", name: "Ravi", status: "ACTIVE" } },
  ]) {
    const q = qualifyLead(base(overrides));
    assert.ok(
      !q.counsellorSummary.includes("null") && !q.counsellorSummary.includes("undefined"),
      `counsellorSummary contains literal null/undefined: "${q.counsellorSummary}"`,
    );
    assert.ok(
      q.counsellorSummary.length > 0 && q.counsellorSummary.length <= MAX_COUNSELLOR_SUMMARY,
      `counsellorSummary must be 1..${MAX_COUNSELLOR_SUMMARY} chars (got ${q.counsellorSummary.length})`,
    );
  }
});

test("counsellor summary includes student name when available", () => {
  const q = qualifyLead(base({
    conversation: { id: "c1", name: "Anita", status: "ACTIVE" },
    lead: { name: "Anita" },
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" },
  }));
  assert.ok(
    q.counsellorSummary.includes("Anita"),
    `counsellorSummary should include student name: "${q.counsellorSummary}"`,
  );
});

// ═════════════════════════════════════════════════════════════════
// REASON — deterministic, references stage, always present
// ═════════════════════════════════════════════════════════════════

test("reason references the correct stage label", () => {
  const q = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", englishLevel: "IELTS" },
  }));
  assert.ok(
    q.reason.includes(LEAD_STAGE_LABELS[q.leadStage.value as LeadStage]),
    `reason should include stage label "${LEAD_STAGE_LABELS[q.leadStage.value as LeadStage]}": "${q.reason}"`,
  );
});

// ═════════════════════════════════════════════════════════════════
// FACT COUNT → CONFIDENCE (minimum rule)
// ═════════════════════════════════════════════════════════════════

test("confidence = null when no FACT fields, 1 when all FACTs are 1", () => {
  // No FACT fields
  const qEmpty = qualifyLead(base());
  assert.equal(qEmpty.confidence, null);

  // Some FACT fields
  const qFact = qualifyLead(base({
    leadContext: { targetCourse: "IELTS" },
  }));
  assert.equal(qFact.confidence, 1, "confidence = min of FACT confidences = 1");

  // More FACT fields
  const qMore = qualifyLead(base({
    leadContext: { targetCourse: "IELTS", targetCountry: "Canada", budgetRange: "₹50,000" },
  }));
  assert.equal(qMore.confidence, 1);
});

// ═════════════════════════════════════════════════════════════════
// LEAD-QUALIFICATION-AGENT-03 — ADVERSARIAL REGRESSION TESTS
//
// Each defect found by the adversarial review has a dedicated regression
// test below, locking the FIXED behaviour in place.
// ═════════════════════════════════════════════════════════════════

test("ADV-01 — informational fee/cost question must NOT be HIGH_INTENT without an eligible demo", () => {
  // Defect: classifyPostDemoResponse was applied to ANY message, and its
  // HIGH_INTENT_PATTERNS include fee/cost terms — so a purely informational
  // message promoted the stage to HIGH_INTENT with no demo at all.
  for (const content of [
    "What is the cost of living in Canada?",
    "how much do IELTS fees cost?",
    "what is the price of IELTS coaching?",
    "What is the fee structure?",
    "what does the IELTS course cost?",
  ]) {
    const q = qualifyLead(base({ transcript: userMsg(content) }));
    cleanResult(q);
    assert.equal(q.intent.value, "MEDIUM", `intent for "${content}" should be MEDIUM`);
    assert.ok(
      q.leadStage.value !== "HIGH_INTENT",
      `stage for informational "${content}" must not be HIGH_INTENT (got ${q.leadStage.value})`,
    );
    assert.ok(
      q.urgency.value !== "HIGH",
      `urgency for informational "${content}" must not be HIGH (got ${q.urgency.value})`,
    );
  }
});

test("ADV-02 — post-demo HIGH_INTENT still applies for an ELIGIBLE attended demo (canonical preserved)", () => {
  const q = qualifyLead(base({
    transcript: userMsg("how much do the IELTS fees cost?"),
    demoBookings: [{ course: "IELTS", status: "ATTENDED" }],
  }));
  cleanResult(q);
  // A fee question right after attending the same course's demo IS a strong
  // conversion signal (canonical S5-B eligible-context behaviour).
  assert.equal(q.leadStage.value, "HIGH_INTENT");
});

test("ADV-03 — CANCELLED demo must NOT produce post-demo HIGH_INTENT", () => {
  const q = qualifyLead(base({
    transcript: userMsg("how much do the IELTS fees cost?"),
    demoBookings: [{ course: "IELTS", status: "CANCELLED" }],
  }));
  cleanResult(q);
  assert.ok(
    q.leadStage.value !== "HIGH_INTENT",
    `cancelled demo must not elevate stage (got ${q.leadStage.value})`,
  );
});

test("ADV-04 — old ATTENDED demo for a DIFFERENT course must not colour a new enquiry", () => {
  // An old German demo must never reply to a new IELTS enquiry (S5-B
  // stale-demo guard). Informational new-course question → not HIGH_INTENT.
  const qInfo = qualifyLead(base({
    transcript: userMsg("What is IELTS?"),
    demoBookings: [{ course: "German", status: "ATTENDED" }],
  }));
  cleanResult(qInfo);
  assert.ok(
    qInfo.leadStage.value !== "HIGH_INTENT",
    `unrelated-course demo must not elevate stage (got ${qInfo.leadStage.value})`,
  );

  // A genuine new-course enrolment signal is still HIGH via ADMISSION intent
  // (never via the stale demo).
  const qJoin = qualifyLead(base({
    transcript: userMsg("I want to join the IELTS batch"),
    demoBookings: [{ course: "German", status: "ATTENDED" }],
  }));
  cleanResult(qJoin);
  assert.equal(qJoin.intent.value, "HIGH", "genuine enrolment intent stays HIGH");
  assert.equal(qJoin.leadStage.value, "HIGH_INTENT", "genuine enrolment intent can be HIGH_INTENT");
});

test("ADV-05 — only the LATEST user message drives intent/stage", () => {
  // Old transcript shows strong joining intent, but the current message is
  // an informational question → intent and stage must come from the latest
  // message only (no stale escalation from older turns).
  const q = qualifyLead(base({
    transcript: [
      { role: "USER", content: "I want to join the IELTS batch right now!" },
      { role: "USER", content: "What is the fee for IELTS?" },
    ],
  }));
  cleanResult(q);
  assert.equal(q.intent.value, "MEDIUM", "intent must reflect the latest informational message");
  assert.ok(
    q.leadStage.value !== "HIGH_INTENT",
    `latest informational message must not be elevated by an older turn (got ${q.leadStage.value})`,
  );
});

test("ADV-06 — current declined beats stale HIGH admission state → LOST", () => {
  const q = qualifyLead(base({
    transcript: userMsg("Sorry I am not interested anymore"),
    admissions: [{ course: "IELTS", state: "INTERESTED" }],
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "LOST", "a live decline overrides a stale high-intent state");
});

test("ADV-07 — qualifyLead never throws for null/undefined/malformed input", () => {
  // Defect: qualifyLead(null) threw TypeError reading 'conversation'.
  for (const bad of [null, undefined, {}, { transcript: userMsg("x") }, { demoBookings: null }]) {
    const q = qualifyLead(bad as LeadQualificationInput);
    cleanResult(q);
    const stage: string | null = q.leadStage.value;
    assert.ok(["NEW", "ENGAGED"].includes(stage ?? ""), `no-throw default stage for ${JSON.stringify(bad)}`);
  }
  // A null booking entry in the array is tolerated too.
  const q = qualifyLead({
    ...base(),
    demoBookings: [{ course: "IELTS", status: "ATTENDED" }, null as never],
    transcript: userMsg("how much do the fees cost?"),
  });
  cleanResult(q);
  assert.equal(q.leadStage.value, "HIGH_INTENT", "null booking entries are ignored, eligible one counts");
});

test("ADV-08 — course isolation: admission/demo course never overwrites leadContext course", () => {
  const q = qualifyLead(base({
    leadContext: { targetCourse: "German", targetCountry: "Canada" },
    admissions: [{ course: "IELTS", state: "LOST" }],
    demoBookings: [{ course: "PTE", status: "ATTENDED" }],
  }));
  cleanResult(q);
  assert.equal(q.course.value, "German", "leadContext targetCourse is authoritative for the course field");
});

test("ADV-09 — course changed later → latest leadContext targetCourse wins", () => {
  const q = qualifyLead(base({
    leadContext: { targetCourse: "PTE", targetCountry: "Canada" },
    admissions: [{ course: "IELTS", state: "INTERESTED" }],
  }));
  cleanResult(q);
  assert.equal(q.course.value, "PTE", "latest targetCourse wins over admission course");
});

test("ADV-10 — budget-adjacent QUESTION never invents a budget", () => {
  for (const content of [
    "How much does the IELTS course cost?",
    "what is the price of coaching in Canada?",
    "cost of living in Canada?",
  ]) {
    const q = qualifyLead(base({ transcript: userMsg(content) }));
    cleanResult(q);
    assert.equal(q.budget.value, null, `budget must stay null for "${content}"`);
    assert.equal(q.budget.basis, "UNKNOWN", `budget basis must stay UNKNOWN for "${content}"`);
  }
});

test("ADV-11 — currency without an explicit budget never invents a budget", () => {
  const q = qualifyLead(base({
    transcript: userMsg("IELTS is ₹15000 right?"),
  }));
  cleanResult(q);
  assert.equal(q.budget.value, null, "currency mention must not create a budget FACT");
  assert.equal(q.budget.basis, "UNKNOWN");
});

test("ADV-12 — sensitive-trait message plus legit enquiry: no invented sensitive fields, legit signal kept", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I am from Pakistan and want to join the PTE batch"),
  }));
  cleanResult(q);
  assert.equal(q.destination.basis, "UNKNOWN", "nationality must not become a destination FACT");
  assert.equal(q.studentType.basis, "UNKNOWN", "no sensitive student-type FACT invented");
  assert.equal(q.intent.value, "HIGH", "legitimate enrolment intent still detected");
  assert.equal(q.leadStage.value, "HIGH_INTENT", "legitimate enrolment stage still detected");
});

test("ADV-13 — missing name → Anonymous fallback, never literal null/undefined", () => {
  const q = qualifyLead(base({
    conversation: { id: "c9", name: null, status: "ACTIVE" },
    lead: null,
  }));
  cleanResult(q);
  assert.ok(q.counsellorSummary.startsWith("Anonymous student"), `anonymous fallback: "${q.counsellorSummary}"`);
  assert.ok(!q.counsellorSummary.includes("null") && !q.counsellorSummary.includes("undefined"));
});

test("ADV-14 — completely empty conversation → NEW, all UNKNOWN, never throws", () => {
  const q = qualifyLead(base({
    conversation: { id: "c10", name: null, status: "ACTIVE" },
    transcript: [],
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "NEW");
  assert.equal(q.intent.value, "NONE");
  for (const key of ["course", "exam", "destination", "studentType", "intake", "timeline", "budget"] as const) {
    assert.equal(q[key].basis, "UNKNOWN", `${key} should be UNKNOWN for empty conversation`);
  }
});

test("ADV-15 — conflicting admission states → LOST precedence wins over HIGH/READY", () => {
  const q = qualifyLead(base({
    admissions: [
      { course: "IELTS", state: "LOST" },
      { course: "PTE", state: "INTERESTED" },
      { course: "German", state: "PAYMENT_PENDING" },
    ],
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "LOST", "any LOST state wins the stage");
});

test("ADV-16 — admission-ready plus sent decline signal → LOST wins", () => {
  const q = qualifyLead(base({
    transcript: userMsg("I am not interested anymore"),
    admissions: [{ course: "IELTS", state: "PAYMENT_VERIFIED" }],
  }));
  cleanResult(q);
  assert.equal(q.leadStage.value, "LOST", "sent decline signal beats a happy admission state");
});

test("ADV-17 — counsellor handoff / assigned → neutral next action, never claims contact", () => {
  for (const conversation of [
    { id: "c17a", name: null, status: "ACTIVE", assignedCounsellorId: "staff_9" },
    { id: "c17b", name: null, status: "HANDED_OFF", assignedCounsellorId: "staff_9" },
  ]) {
    const q = qualifyLead(base({ conversation, transcript: userMsg("I want to join") }));
    cleanResult(q);
    assert.ok(
      !q.nextAction.toLowerCase().includes("counsellor contacted"),
      `must never claim counsellor contacted for ${conversation.status}`,
    );
  }
});

test("ADV-18 — group conversation → group-aware next action", () => {
  const q = qualifyLead(base({
    conversation: { id: "c18", name: "Rahul (group)", status: "ACTIVE" },
    transcript: userMsg("I want to join"),
  }));
  cleanResult(q);
  assert.ok(q.nextAction.toLowerCase().includes("group"), `group-aware next action, got: "${q.nextAction}"`);
});

test("ADV-19 — long hostile input stays bounded and never throws", () => {
  const content = "SHUT UP ".repeat(500);
  const q = qualifyLead(base({ transcript: userMsg(content) }));
  cleanResult(q);
  assert.ok(q.counsellorSummary.length <= MAX_COUNSELLOR_SUMMARY, `summary bounded (${q.counsellorSummary.length})`);
  assert.ok(typeof q.reason === "string" && q.reason.length > 0, "reason still present");
});

test("ADV-20 — invalid admission enum and invalid confidence are handled gracefully", () => {
  // Unknown admission state must not throw, must not be treated as LOST/READY/HIGH.
  const q = qualifyLead(base({
    admissions: [{ course: "IELTS", state: "BOGUS_STATE" }],
  }));
  cleanResult(q);
  const stage: string | null = q.leadStage.value;
  assert.ok(!["LOST", "ADMISSION_READY", "HIGH_INTENT"].includes(stage ?? ""),
    `unknown state must not map to a real stage (got ${stage})`);

  // Validation must reject out-of-range confidence.
  const clean = qualifyLead(base());
  const bad = { ...clean, confidence: 1.5 };
  const result = validateLeadQualification(bad);
  assert.equal(result.valid, false, "confidence 1.5 must be rejected");
  assert.ok(result.valid === false && result.errors.some((e) => e.includes("0..1")));
});
