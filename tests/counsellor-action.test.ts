// FILE: tests/counsellor-action.test.ts
//
// Phase S5-D — COUNSELLOR ACTION QUEUE FOUNDATION
//
// Covers the pure action-state mapping (lib/lead/counsellor.action.ts):
// the S5-C priority → action queue state, the ownership/group/handoff
// exclusions, the audit event payload, and the idempotent transition
// rule (NONE→FOLLOW_UP→PRIORITY_FOLLOW_UP→ADMISSION_ASSISTANCE).
//
// The module is DB-free and AI-free, matching the repo convention of
// dependency-injected pure tests. The student-facing / payment safety
// invariants (never "notified", never "payment completed", SYSTEM rows
// invisible to the AI + the student) are asserted directly on the
// event payload strings.
//
// Regression parity (unchanged behaviour, run alongside this file):
//   phase1-whatsapp-safety, demo-offer, demo-followup, counsellor-priority,
//   ai-adapter.demo-guard, demo booking, lead.identity, chatwoot.phase7,
//   chatwoot.webhook, ai-client-retry, rate-limiter, ownership.gate,
//   whatsapp-group-guard, webhook.integration.
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

// Must run FIRST — some transitively imported modules construct prisma
// clients at load.
import "./env.setup";

import {
  evaluateCounsellorPriority,
  buildCounsellorContextString,
  type CounsellorPriorityResult,
} from "../lib/lead/counsellor.priority";
import {
  mapCounsellorPriorityToAction,
  shouldTrackCounsellorAction,
  shouldEmitActionEvent,
  parseActionEventContent,
  buildActionEventContent,
  buildActionReason,
  actionStateRank,
  isCounsellorActionState,
  COUNSELLOR_ACTION_STATES,
  COUNSELLOR_ACTION_PREFIX,
  COUNSELLOR_ACTION_NO_COURSE,
  ACTION_QUEUE_ORDER,
  actionQueuePosition,
  compareActionQueueItems,
  matchesActionFilter,
  type CounsellorActionState,
} from "../lib/lead/counsellor.action";

// ── shared fixtures ───────────────────────────────────────────────

const IELTS_BOOKING = {
  id: "booking-1",
  course: "IELTS",
  preferredBatch: "Morning Batch",
  preferredDate: new Date("2026-09-01"),
  status: "CONFIRMED",
};

const GERMAN_BOOKING = {
  id: "booking-g1",
  course: "German",
  preferredBatch: "Evening",
  preferredDate: new Date("2026-03-01"),
  status: "CONFIRMED",
};

const ATTENDED_POST_DEMO = { attendance: "ATTENDED" as const, intent: "HIGH_INTENT" as const };

function priorityFor(input: {
  message: string;
  course?: string | null;
  booking?: unknown;
  postDemo?: unknown;
  humanHandoffRequested?: boolean;
  groupConversation?: boolean;
}): CounsellorPriorityResult {
  return evaluateCounsellorPriority({
    message: input.message,
    course: input.course ?? null,
    booking: (input.booking ?? null) as never,
    postDemo: (input.postDemo ?? null) as never,
    humanHandoffRequested: input.humanHandoffRequested ?? false,
    groupConversation: input.groupConversation ?? false,
  });
}

// ═════════════════════════════════════════════════════════════════
// 1–5. NO ACTION / FOLLOW_UP / PRIORITY_FOLLOW_UP / ADMISSION_ASSISTANCE
// map (priority table → action queue state)
// ═════════════════════════════════════════════════════════════════

test("NONE priority → action NONE + nothing is ever emitted", () => {
  const result = priorityFor({
    message: "What is IELTS exactly?",
    course: "IELTS",
  });
  assert.equal(result.priority, "NONE");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "NONE");
  assert.equal(
    shouldEmitActionEvent(null, "NONE"),
    false,
    "NONE state is never written as an event"
  );
  assert.equal(
    shouldTrackCounsellorAction({
      priority: "NONE",
      assignedCounsellorId: null,
      status: "ACTIVE",
    }),
    false,
    "NONE priority never opens the gate"
  );
});

test("LOW commitment message → no action (priority NONE)", () => {
  const result = priorityFor({
    message: "Just checking for now, I will talk to my family first.",
    course: "IELTS",
  });
  assert.equal(result.priority, "NONE");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "NONE");
  assert.equal(shouldEmitActionEvent(null, "NONE"), false);
});

test("NORMAL priority → FOLLOW_UP", () => {
  const result = priorityFor({
    message: "What are the fees for IELTS coaching?",
    course: "IELTS",
  });
  assert.equal(result.priority, "NORMAL");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "FOLLOW_UP");
  assert.equal(
    shouldTrackCounsellorAction({
      priority: result.priority,
      assignedCounsellorId: null,
      status: "ACTIVE",
    }),
    true
  );
  assert.equal(shouldEmitActionEvent(null, "FOLLOW_UP"), true);
});

test("HIGH priority → PRIORITY_FOLLOW_UP", () => {
  const result = priorityFor({
    message: "I want to join the IELTS coaching.",
    course: "IELTS",
  });
  assert.equal(result.priority, "HIGH");
  assert.equal(
    mapCounsellorPriorityToAction(result.priority),
    "PRIORITY_FOLLOW_UP"
  );
  assert.equal(shouldEmitActionEvent(null, "PRIORITY_FOLLOW_UP"), true);
});

test("URGENT priority → ADMISSION_ASSISTANCE", () => {
  const result = priorityFor({
    message: "I want to pay the fees now for IELTS.",
    course: "IELTS",
  });
  assert.equal(result.priority, "URGENT");
  assert.equal(
    mapCounsellorPriorityToAction(result.priority),
    "ADMISSION_ASSISTANCE"
  );
  assert.equal(shouldEmitActionEvent(null, "ADMISSION_ASSISTANCE"), true);
});

// ═════════════════════════════════════════════════════════════════
// 6–9. Demo/funnel scenarios
// ═════════════════════════════════════════════════════════════════

test("fees after an eligible demo → PRIORITY_FOLLOW_UP", () => {
  const result = priorityFor({
    message: "What are the fees after the demo?",
    course: "IELTS",
    booking: IELTS_BOOKING,
  });
  assert.equal(result.priority, "HIGH");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "PRIORITY_FOLLOW_UP");
});

test("join message after an attended demo → ADMISSION_ASSISTANCE", () => {
  const result = priorityFor({
    message: "I want to join now.",
    course: "IELTS",
    booking: IELTS_BOOKING,
    postDemo: ATTENDED_POST_DEMO,
  });
  assert.equal(result.priority, "URGENT");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "ADMISSION_ASSISTANCE");
});

test("payment request → ADMISSION_ASSISTANCE (never 'payment completed')", () => {
  const result = priorityFor({
    message: "How can I make the payment for IELTS?",
    course: "IELTS",
  });
  assert.equal(result.priority, "URGENT");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "ADMISSION_ASSISTANCE");

  const event = buildActionEventContent({
    state: mapCounsellorPriorityToAction(result.priority),
    reason: buildActionReason(result),
    course: result.course,
  });
  assert.equal(result.priority === "URGENT", true);
  assert.equal(event.includes("payment completed"), false);
  assert.equal(event.includes("paid"), false);
  assert.equal(event.includes("admission confirmed"), false);
  assert.equal(event.includes("notified"), false);
});

test("not interested → no action", () => {
  const result = priorityFor({
    message: "Thanks but I am not interested in coaching right now.",
    course: "IELTS",
  });
  assert.equal(result.priority, "NONE");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "NONE");
  assert.equal(shouldEmitActionEvent(null, "NONE"), false);
});

// ═════════════════════════════════════════════════════════════════
// 10–13. Exclusions: handoff authoritative, ASSIGNED, HANDED_OFF, group
// ═════════════════════════════════════════════════════════════════

test("human handoff requested → existing handoff flow is authoritative (NONE)", () => {
  const result = priorityFor({
    message: "I want to join now.",
    course: "IELTS",
    booking: IELTS_BOOKING,
    humanHandoffRequested: true,
  });
  assert.equal(result.priority, "NONE");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "NONE");
  assert.equal(
    result.action.includes("handoff"),
    true,
    "reason points at the existing handoff flow"
  );
});

test("ASSIGNED conversation → no action event, no duplicate handoff", () => {
  // The webhook ownership gate skips the whole adapter for ASSIGNED; this
  // is the defence-in-depth guard that must refuse to open the queue.
  assert.equal(
    shouldTrackCounsellorAction({
      priority: "URGENT",
      assignedCounsellorId: "staff-1",
      status: "ACTIVE",
    }),
    false,
    "a human counsellor already owns the thread"
  );
});

test("HANDED_OFF conversation → no action event, no duplicate handoff", () => {
  assert.equal(
    shouldTrackCounsellorAction({
      priority: "URGENT",
      assignedCounsellorId: null,
      status: "HANDED_OFF",
    }),
    false,
    "the existing handoff is authoritative"
  );
});

test("group message → no action (never a group conversation action)", () => {
  const result = priorityFor({
    message: "I want to pay",
    course: "IELTS",
    groupConversation: true,
  });
  assert.equal(result.priority, "NONE");
  assert.equal(mapCounsellorPriorityToAction(result.priority), "NONE");
  assert.equal(shouldEmitActionEvent(null, "NONE"), false);
});

// ═════════════════════════════════════════════════════════════════
// 14. Stale-demo guard: an old German demo NEVER colours a new IELTS
// enquiry — the action is scoped to the CURRENT message course
// ═════════════════════════════════════════════════════════════════

test("old German demo + new IELTS enquiry → action/signal course is IELTS only", () => {
  const result = priorityFor({
    message: "What are the fees?",
    course: "IELTS",
    booking: GERMAN_BOOKING,
  });
  assert.equal(result.course, "IELTS", "message course wins over the stale booking");
  assert.equal(result.priority, "NORMAL", "stale German demo does NOT boost IELTS");
  assert.equal(result.demoEligible, false);

  const event = buildActionEventContent({
    state: mapCounsellorPriorityToAction(result.priority),
    reason: buildActionReason(result),
    course: result.course,
  });
  const parsed = parseActionEventContent(event);
  assert.equal(parsed?.course, "IELTS");
  assert.equal(event.includes("German"), false, "German never leaks into the IELTS action");
});

// ═════════════════════════════════════════════════════════════════
// 15. Idempotency — repeated fee questions produce exactly ONE event
// ═════════════════════════════════════════════════════════════════

test("repeated fee questions → no uncontrolled duplicate action events", () => {
  const turns = [
    "What are the fees?",
    "What are the fees again?",
    "and the fees, please?",
  ];

  const events: string[] = [];
  let previous: CounsellorActionState | null = null;

  for (const turn of turns) {
    const result = priorityFor({ message: turn, course: "IELTS" });
    const state = mapCounsellorPriorityToAction(result.priority);
    if (shouldEmitActionEvent(previous, state)) {
      events.push(
        buildActionEventContent({
          state,
          reason: buildActionReason(result),
          course: result.course,
        })
      );
      previous = parseActionEventContent(events[events.length - 1])?.state ?? null;
    }
  }

  assert.equal(events.length, 1, "identical priority level → one event only");
  assert.equal(parseActionEventContent(events[0])?.state, "FOLLOW_UP");
});

test("a full escalation turn-sequence emits exactly one event per level", () => {
  const sequence: { message: string; moment: string }[] = [
    { message: "What are the fees?", moment: "fees" },
    { message: "What are the fees again?", moment: "fees again" },
    { message: "I want to join.", moment: "join" },
    { message: "I want to join really now.", moment: "join again" },
    { message: "I want to pay the fees.", moment: "pay" },
    { message: "I want to pay the fees please.", moment: "pay again" },
  ];

  const events: string[] = [];
  let previous: CounsellorActionState | null = null;

  for (const turn of sequence) {
    const result = priorityFor({ message: turn.message, course: "IELTS" });
    const state = mapCounsellorPriorityToAction(result.priority);
    if (shouldEmitActionEvent(previous, state)) {
      events.push(
        buildActionEventContent({
          state,
          reason: buildActionReason(result),
          course: result.course,
        })
      );
      previous = parseActionEventContent(events[events.length - 1])?.state ?? null;
    }
  }

  const states = events.map((e) => parseActionEventContent(e)?.state);
  assert.deepEqual(states, ["FOLLOW_UP", "PRIORITY_FOLLOW_UP", "ADMISSION_ASSISTANCE"]);
});

// ═════════════════════════════════════════════════════════════════
// Transition rule edge cases
// ═════════════════════════════════════════════════════════════════

test("escalation emits at every level boundary (incl. first event skipping levels)", () => {
  assert.equal(shouldEmitActionEvent(null, "FOLLOW_UP"), true);
  assert.equal(shouldEmitActionEvent(null, "PRIORITY_FOLLOW_UP"), true);
  assert.equal(shouldEmitActionEvent(null, "ADMISSION_ASSISTANCE"), true);
  assert.equal(shouldEmitActionEvent("FOLLOW_UP", "PRIORITY_FOLLOW_UP"), true);
  assert.equal(shouldEmitActionEvent("PRIORITY_FOLLOW_UP", "ADMISSION_ASSISTANCE"), true);
});

test("same-state repeats never emit", () => {
  assert.equal(shouldEmitActionEvent("FOLLOW_UP", "FOLLOW_UP"), false);
  assert.equal(
    shouldEmitActionEvent("PRIORITY_FOLLOW_UP", "PRIORITY_FOLLOW_UP"),
    false
  );
  assert.equal(
    shouldEmitActionEvent("ADMISSION_ASSISTANCE", "ADMISSION_ASSISTANCE"),
    false
  );
  assert.equal(shouldEmitActionEvent("NONE", "NONE"), false);
});

test("downgrades never emit", () => {
  assert.equal(shouldEmitActionEvent("ADMISSION_ASSISTANCE", "FOLLOW_UP"), false);
  assert.equal(
    shouldEmitActionEvent("ADMISSION_ASSISTANCE", "PRIORITY_FOLLOW_UP"),
    false
  );
  assert.equal(shouldEmitActionEvent("PRIORITY_FOLLOW_UP", "FOLLOW_UP"), false);
});

test("NONE is never written even when a previous state exists", () => {
  assert.equal(shouldEmitActionEvent("FOLLOW_UP", "NONE"), false);
  assert.equal(shouldEmitActionEvent("PRIORITY_FOLLOW_UP", "NONE"), false);
  assert.equal(shouldEmitActionEvent("ADMISSION_ASSISTANCE", "NONE"), false);
  assert.equal(shouldEmitActionEvent(null, "NONE"), false);
});

// ═════════════════════════════════════════════════════════════════
// Event payload integrity (audit row, Objective 4)
// ═════════════════════════════════════════════════════════════════

test("event content round-trips state/reason/course for every action state", () => {
  for (const state of ["FOLLOW_UP", "PRIORITY_FOLLOW_UP", "ADMISSION_ASSISTANCE"] as const) {
    const content = buildActionEventContent({
      state,
      reason: "Follow up regarding course fees",
      course: "IELTS",
    });
    assert.equal(content.startsWith(COUNSELLOR_ACTION_PREFIX), true);
    const parsed = parseActionEventContent(content);
    assert.deepEqual(parsed, { state, reason: "Follow up regarding course fees", course: "IELTS" });
  }
});

test("parse rejects non-action, malformed, and non-string content", () => {
  assert.equal(parseActionEventContent("USER hello") === null, true);
  assert.equal(parseActionEventContent("DEMO_FOLLOWUP [ATTENDED/HIGH/IELTS]") === null, true);
  assert.equal(parseActionEventContent("COUNSELLOR_PRIORITY [HIGH/URGENT/IELTS] x :: y") === null, true);
  assert.equal(parseActionEventContent("COUNSELLOR_ACTION [NOT_A_STATE/why/IELTS]") === null, true);
  assert.equal(parseActionEventContent("COUNSELLOR_ACTION [FOLLOW_UP/why/IELTS") === null, true);
  assert.equal(parseActionEventContent(null) === null, true);
  assert.equal(parseActionEventContent(undefined) === null, true);
  assert.equal(parseActionEventContent(42) === null, true);
});

test("missing course parses as null; multi-word courses survive", () => {
  const noCourse = buildActionEventContent({
    state: "FOLLOW_UP",
    reason: "Follow up with course details",
    course: null,
  });
  assert.equal(noCourse.includes(`${COUNSELLOR_ACTION_NO_COURSE}]`), true);
  assert.equal(parseActionEventContent(noCourse)?.course, null);

  const multiWord = buildActionEventContent({
    state: "PRIORITY_FOLLOW_UP",
    reason: "Follow up after demo",
    course: "Spoken English",
  });
  assert.equal(parseActionEventContent(multiWord)?.course, "Spoken English");
});

test("reason is stripped of the '/' delimiter so parsing stays exact", () => {
  const content = buildActionEventContent({
    state: "ADMISSION_ASSISTANCE",
    reason: "Contact student for admission/payment assistance",
    course: "IELTS",
  });
  assert.equal(content.includes("admission/payment"), false);
  assert.equal(content.includes("admission payment assistance"), true);
  assert.equal(parseActionEventContent(content)?.reason, "Contact student for admission payment assistance");
});

test("buildActionReason is deterministic and never claims contact/notification/completion", () => {
  const result = priorityFor({
    message: "I want to pay the fees now for IELTS.",
    course: "IELTS",
  });
  assert.equal(result.priority, "URGENT");

  const reason1 = buildActionReason(result);
  const reason2 = buildActionReason(result);
  assert.equal(reason1, reason2, "same input → same reason");

  assert.equal(reason1.includes("/"), false, "stay parse-safe");
  assert.equal(/notified/i.test(reason1), false);
  assert.equal(/has been contacted/i.test(reason1), false);
  assert.equal(/already contacted/i.test(reason1), false);
  assert.equal(/payment completed/i.test(reason1), false);
  assert.equal(/\bpaid\b/i.test(reason1), false);
  assert.equal(/enrolled|enrolment|enrollment/i.test(reason1), false);
  assert.equal(/admission confirmed/i.test(reason1), false);
});

// ═════════════════════════════════════════════════════════════════
// Ordering / validation helpers
// ═════════════════════════════════════════════════════════════════

test("actionStateRank is monotonic across the queue", () => {
  const ranked = COUNSELLOR_ACTION_STATES.map((s) => actionStateRank(s));
  assert.deepEqual(ranked, [0, 1, 2, 3]);
  assert.equal(actionStateRank("FOLLOW_UP") < actionStateRank("PRIORITY_FOLLOW_UP"), true);
  assert.equal(
    actionStateRank("PRIORITY_FOLLOW_UP") < actionStateRank("ADMISSION_ASSISTANCE"),
    true
  );
});

test("isCounsellorActionState rejects injected labels (never a raw score/leak path)", () => {
  assert.equal(isCounsellorActionState("FOLLOW_UP"), true);
  assert.equal(isCounsellorActionState("HOT_LEAD"), false);
  assert.equal(isCounsellorActionState("URGENT"), false, "the S5-C priority label is not an action state");
  assert.equal(isCounsellorActionState(7), false);
  assert.equal(isCounsellorActionState(null), false);
});

// ═════════════════════════════════════════════════════════════════
// Adapter-grade wiring fixture: exhaustive mapping table
// ═════════════════════════════════════════════════════════════════

test("priority → action mapping is exhaustive and one-to-one", () => {
  const table: Record<string, CounsellorActionState> = {
    NORMAL: "FOLLOW_UP",
    HIGH: "PRIORITY_FOLLOW_UP",
    URGENT: "ADMISSION_ASSISTANCE",
  };
  for (const [priority, expected] of Object.entries(table)) {
    assert.equal(
      mapCounsellorPriorityToAction(priority as "NORMAL" | "HIGH" | "URGENT"),
      expected,
      `${priority} must map to ${expected}`
    );
  }
  assert.equal(mapCounsellorPriorityToAction("NONE"), "NONE");
});

// ═════════════════════════════════════════════════════════════════
// PHASE S5-E — QUEUE ORDERING + FILTERING (Objective 2/3, Test 1–4)
// ═════════════════════════════════════════════════════════════════

test("queue order: Admission Assistance appears before Priority Follow-up", () => {
  const admission = {
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    derivedAction: { state: "ADMISSION_ASSISTANCE" as const },
  };
  const priority = {
    updatedAt: new Date("2026-08-02T00:00:00Z"),
    derivedAction: { state: "PRIORITY_FOLLOW_UP" as const },
  };
  assert.ok(
    compareActionQueueItems(admission, priority) < 0,
    "Admission Assistance first even though Priority Follow-up is newer"
  );
});

test("queue order: Priority Follow-up appears before Follow-up", () => {
  const priority = {
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    derivedAction: { state: "PRIORITY_FOLLOW_UP" as const },
  };
  const followUp = {
    updatedAt: new Date("2026-08-02T00:00:00Z"),
    derivedAction: { state: "FOLLOW_UP" as const },
  };
  assert.ok(
    compareActionQueueItems(priority, followUp) < 0,
    "Priority Follow-up beats a more recent plain Follow-up"
  );
});

test("recent activity breaks same-priority ties", () => {
  const older = {
    updatedAt: new Date("2026-08-01T10:00:00Z"),
    derivedAction: { state: "FOLLOW_UP" as const },
  };
  const newer = {
    updatedAt: new Date("2026-08-01T11:00:00Z"),
    derivedAction: { state: "FOLLOW_UP" as const },
  };
  assert.ok(
    compareActionQueueItems(newer, older) < 0,
    "newer within the same state sorts first"
  );
  assert.ok(compareActionQueueItems(older, newer) > 0);
});

test("NONE / no-derivation sorts last and never creates an actionable item", () => {
  const none = {
    updatedAt: new Date("2026-08-01T12:00:00Z"),
    derivedAction: null,
  };
  const followUp = {
    updatedAt: new Date("2026-08-01T09:00:00Z"),
    derivedAction: { state: "FOLLOW_UP" as const },
  };
  assert.ok(
    compareActionQueueItems(followUp, none) < 0,
    "an actionable item always precedes a NONE/no-action conversation"
  );
  assert.ok(compareActionQueueItems(none, followUp) > 0);

  const priorityResult = priorityFor({
    message: "What is IELTS exactly?",
    course: "IELTS",
  });
  assert.equal(priorityResult.priority, "NONE");
  const derived =
    mapCounsellorPriorityToAction(priorityResult.priority) === "NONE"
      ? null
      : { state: mapCounsellorPriorityToAction(priorityResult.priority) };
  assert.equal(derived, null);
  assert.equal(matchesActionFilter("NONE", derived), true);
  assert.equal(matchesActionFilter("FOLLOW_UP", derived), false);
});

test("a mixed list sorts Assistance → Priority Follow-up → Follow-up → None, newest-first within a state", () => {
  const items = [
    { updatedAt: new Date("2026-08-01T06:00:00Z"), derivedAction: null },
    { updatedAt: new Date("2026-08-01T08:00:00Z"), derivedAction: { state: "PRIORITY_FOLLOW_UP" as const } },
    { updatedAt: new Date("2026-08-01T07:00:00Z"), derivedAction: { state: "FOLLOW_UP" as const } },
    { updatedAt: new Date("2026-08-01T09:00:00Z"), derivedAction: { state: "ADMISSION_ASSISTANCE" as const } },
    { updatedAt: new Date("2026-08-01T07:30:00Z"), derivedAction: { state: "FOLLOW_UP" as const } },
  ];

  const sorted = [...items].sort(compareActionQueueItems);
  assert.deepEqual(
    sorted.map((i) => i.derivedAction?.state ?? null),
    ["ADMISSION_ASSISTANCE", "PRIORITY_FOLLOW_UP", "FOLLOW_UP", "FOLLOW_UP", null]
  );
  assert.equal(
    sorted[2].updatedAt.getTime() > sorted[3].updatedAt.getTime(),
    true,
    "the 07:30 Follow-up (newer) precedes the 07:00 Follow-up"
  );
});

test("admin action filter values map 1:1 to the queue filter contract", () => {
  const ASSIST = { state: "ADMISSION_ASSISTANCE" as const };
  const PRIORITY = { state: "PRIORITY_FOLLOW_UP" as const };
  const FOLLOW = { state: "FOLLOW_UP" as const };

  assert.equal(matchesActionFilter(undefined, FOLLOW), true);
  assert.equal(matchesActionFilter(null, FOLLOW), true);
  assert.equal(matchesActionFilter("ALL", FOLLOW), true);
  assert.equal(matchesActionFilter("ALL", null), true);

  assert.equal(matchesActionFilter("ADMISSION_ASSISTANCE", ASSIST), true);
  assert.equal(matchesActionFilter("ADMISSION_ASSISTANCE", PRIORITY), false);
  assert.equal(matchesActionFilter("ADMISSION_ASSISTANCE", null), false);

  assert.equal(matchesActionFilter("PRIORITY_FOLLOW_UP", PRIORITY), true);
  assert.equal(matchesActionFilter("PRIORITY_FOLLOW_UP", FOLLOW), false);

  assert.equal(matchesActionFilter("FOLLOW_UP", FOLLOW), true);
  assert.equal(matchesActionFilter("FOLLOW_UP", PRIORITY), false);

  assert.equal(matchesActionFilter("NONE", null), true);
  assert.equal(matchesActionFilter("NONE", FOLLOW), false);
  assert.equal(matchesActionFilter("NONE", ASSIST), false);

  // Junk values (never sent by the page) must match nothing.
  assert.equal(matchesActionFilter("HOT_LEAD", FOLLOW), false);
  assert.equal(typeof matchesActionFilter("FOLLOW_UP", null), "boolean");
});

test("ACTION_QUEUE_ORDER is exactly the display order (assistance first, none last)", () => {
  assert.deepEqual([...ACTION_QUEUE_ORDER], [
    "ADMISSION_ASSISTANCE",
    "PRIORITY_FOLLOW_UP",
    "FOLLOW_UP",
    "NONE",
  ]);
  assert.equal(
    actionQueuePosition("ADMISSION_ASSISTANCE") < actionQueuePosition("FOLLOW_UP"),
    true
  );
});

// ═════════════════════════════════════════════════════════════════
// PHASE S5-E — CONCURRENCY / IDEMPOTENCY DOCUMENTATION (Objective 1,
// Test 6–7). Real atomicity needs a constraint; zero-schema = best-effort.
// ═════════════════════════════════════════════════════════════════

test("concurrent escalation is explicitly best-effort (no zero-schema atomicity)", () => {
  // Model the read-then-write the adapter performs. With no uniqueness
  // constraint in the current schema there is nothing to serialize on:
  // two handlers can both READ "no event yet" before either WRITES.
  let stored: string[] = [];
  const readPrevious = (): CounsellorActionState | null => {
    const last = stored[stored.length - 1] ?? null;
    return last ? (parseActionEventContent(last)?.state ?? null) : null;
  };

  // Two concurrent "what are the fees?" turns interleave AT THE READ
  // (both reads happen before either write):
  const prevA = readPrevious(); // null
  const prevB = readPrevious(); // null — still null, no write happened yet
  const state = mapCounsellorPriorityToAction("NORMAL"); // FOLLOW_UP

  const emitA = shouldEmitActionEvent(prevA, state);
  const emitB = shouldEmitActionEvent(prevB, state);

  assert.equal(emitA, true);
  assert.equal(
    emitB,
    true,
    "BEST-EFFORT: BOTH can emit because the schema has no constraint to make emission atomic"
  );

  // The documented, honest consequence — not a silent stronger claim.
  const pending = [
    buildActionEventContent({ state, reason: "fees", course: "IELTS" }),
    buildActionEventContent({ state, reason: "fees", course: "IELTS" }),
  ];
  for (const content of pending) {
    stored.push(content);
  }
  assert.equal(stored.length, 2, "duplicate first-level events are possible under a true race");
});

test("sequential repeated same-state turns still emit exactly once (unchanged from S5-D)", () => {
  const events: string[] = [];
  let previous: CounsellorActionState | null = null;
  for (let i = 0; i < 4; i++) {
    const result = priorityFor({ message: "What are the fees?", course: "IELTS" });
    const state = mapCounsellorPriorityToAction(result.priority);
    if (shouldEmitActionEvent(previous, state)) {
      events.push(buildActionEventContent({ state, reason: buildActionReason(result), course: result.course }));
      previous = parseActionEventContent(events[events.length - 1])?.state ?? null;
    }
  }
  assert.equal(events.length, 1, "sequential repeats → exactly one event");
});

// ═════════════════════════════════════════════════════════════════
// PHASE S5-E — STUDENT EXPERIENCE (Objective 13): no internal queue
// vocabulary in the AI-facing conversion context
// ═════════════════════════════════════════════════════════════════

test("student-facing context never contains internal queue vocabulary", () => {
  const context = buildCounsellorContextString({
    priority: "URGENT",
    admissionIntent: "URGENT",
    course: "IELTS",
    demoEligible: true,
    attended: true,
  });
  assert.ok(context, "context is produced for an actionable state");

  const upper = context!.toUpperCase();
  for (const forbidden of [
    "ADMISSION_ASSISTANCE",
    "PRIORITY_FOLLOW_UP",
    "COUNSELLOR_ACTION",
    "COUNSELLOR_PRIORITY",
    "HOT LEAD",
    "URGENT LEAD",
    "LEAD SCORE",
    "QUEUE",
    "NOTIFIED",
  ]) {
    assert.equal(upper.includes(forbidden), false, `${forbidden} must never appear`);
  }
  // The S5-C block already hard-codes the running rule: never claim a
  // counsellor contacted the student.
  assert.equal(upper.includes("NEVER CLAIM A COUNSELLOR HAS ALREADY"), true);
});