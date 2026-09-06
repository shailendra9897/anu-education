"use client";

// ═════════════════════════════════════════════════════════════════
// PHASE S6-E — UNIFIED COUNSELLOR STUDENT WORKSPACE (READ WORKFLOW)
//
// A single read-workflow view for ONE conversation's student journey:
//
//    Lead → related conversations → transcript → demo bookings (+
//    verified attendance) → Admissions (Lead × course) → counsellor
//    working actions → immutable event history → portal requests.
//
// This page is READ-ONLY for the conversation itself: opening it never
// mutates anything (no auto-confirm, no attendance change). The ONLY
// writes are the counsellor "working actions" on an AdmissionEnrollment,
// which are delegated to the existing /api/admin/admissions/[id]/actions
// endpoint — the server derives the actor and enforces authorization
// (canModifyAdmission). No authorization logic is duplicated here.
//
// Transcript is USER + ASSISTANT only (SYSTEM audit rows are excluded
// server-side). No AI reasoning, prompts, or hidden priority labels are
// rendered anywhere on this screen.
// ═════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminCrmNav } from "@/components/admin/AdminCrmNav";

// ── Types ─────────────────────────────────────────────────────────

type Counsellor = { id: string; name: string; email: string };

type TranscriptEntry = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

type Conv = {
  id: string;
  source: string;
  status: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  sourcePage: string | null;
  leadScore: number | null;
  leadTier: string | null;
  createdAt: string;
  updatedAt: string;
  assignedCounsellor: Counsellor | null;
};

type Lead = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  identitySource: string | null;
  createdAt: string;
} | null;

type LeadContext = {
  goal: string | null;
  targetCountry: string | null;
  targetCourse: string | null;
  englishLevel: string | null;
  budgetRange: string | null;
  timeline: string | null;
  intake: string | null;
  biggestChallenge: string | null;
} | null;

type DemoBooking = {
  id: string;
  course: string | null;
  preferredBatch: string | null;
  preferredDate: string | null;
  status: string;
  attendedAt: string | null;
  noShowAt: string | null;
  cancelledAt: string | null;
  attendanceNote: string | null;
  createdAt: string;
  verifiedBy: Counsellor | null;
  events: {
    id: string;
    action: string;
    previousStatus: string | null;
    nextStatus: string;
    staffName: string | null;
    note: string | null;
    createdAt: string;
  }[];
};

type AdmissionEvent = {
  id: string;
  action: string;
  previousState: string | null;
  nextState: string;
  actor: string;
  actorId: string | null;
  actorName: string | null;
  reason: string | null;
  createdAt: string;
};

type Admission = {
  id: string;
  course: string;
  state: string;
  contactedAt: string | null;
  nextFollowUpAt: string | null;
  followUp: {
    status: "NONE" | "OVERDUE" | "DUE_SOON" | "UPCOMING";
    label: string;
    isOverdue: boolean;
    isDueSoon: boolean;
  };
  createdAt: string;
  updatedAt: string;
  assignedCounsellor: Counsellor | null;
  events: AdmissionEvent[];
};

type PortalRequest = {
  id: string;
  course: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  failedAt: string | null;
  notes: string | null;
};

type LatestAction = {
  state: "NONE" | "FOLLOW_UP" | "PRIORITY_FOLLOW_UP" | "ADMISSION_ASSISTANCE";
  course: string | null;
  reason: string;
} | null;

type Workspace = {
  conversation: Conv;
  lead: Lead;
  relatedConversations: Conv[];
  transcript: TranscriptEntry[];
  leadContext: LeadContext;
  demoBookings: DemoBooking[];
  admissions: Admission[];
  portalAccessRequests: PortalRequest[];
  latestAction: LatestAction;
};

// ── Presentation helpers ──────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  ENROLLMENT_CREATED: "Enrollment created",
  INTEREST_DETECTED: "Interest detected",
  COUNSELLOR_CONTACTED: "Counsellor contacted",
  COUNSELLOR_ASSIGNED: "Counsellor assigned",
  FOLLOW_UP_REQUIRED: "Follow-up required",
  FOLLOW_UP_ATTEMPTED: "Follow-up attempted",
  DOCUMENTS_REQUESTED: "Documents requested",
  PAYMENT_CLAIMED: "Payment claimed",
  PAYMENT_VERIFICATION_STARTED: "Payment verification started",
  PAYMENT_VERIFIED: "Payment verified",
  ADMISSION_CONFIRMED: "Admission confirmed",
  ADMISSION_COMPLETED: "Admission completed",
  REACTIVATED: "Reactivated",
  NOT_INTERESTED: "Not interested",
  LOST: "Lost",
  NOTE_ADDED: "Note added",
  SYSTEM_NOTE: "System note",
};

const STATE_LABELS: Record<string, string> = {
  INTERESTED: "Interested",
  COUNSELLOR_CONTACT_PENDING: "Contact pending",
  COUNSELLOR_CONTACTED: "Contacted",
  FOLLOW_UP_REQUIRED: "Follow-up required",
  DOCUMENTS_PENDING: "Documents pending",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_VERIFICATION: "Payment verification",
  PAYMENT_VERIFIED: "Payment verified",
  ADMISSION_CONFIRMED: "Admission confirmed",
  ADMISSION_COMPLETED: "Admission completed",
  NOT_INTERESTED: "Not interested",
  LOST: "Lost",
};

const STATE_COLORS: Record<string, string> = {
  INTERESTED: "bg-blue-100 text-blue-800",
  COUNSELLOR_CONTACT_PENDING: "bg-indigo-100 text-indigo-800",
  COUNSELLOR_CONTACTED: "bg-violet-100 text-violet-800",
  FOLLOW_UP_REQUIRED: "bg-amber-100 text-amber-800",
  DOCUMENTS_PENDING: "bg-cyan-100 text-cyan-800",
  PAYMENT_PENDING: "bg-orange-100 text-orange-800",
  PAYMENT_VERIFICATION: "bg-red-100 text-red-800",
  PAYMENT_VERIFIED: "bg-lime-100 text-lime-800",
  ADMISSION_CONFIRMED: "bg-green-100 text-green-800",
  ADMISSION_COMPLETED: "bg-emerald-100 text-emerald-800",
  NOT_INTERESTED: "bg-slate-100 text-slate-600",
  LOST: "bg-gray-100 text-gray-700",
};

// Counsellor queue state — shown as a plain human label (NOT a hidden
// classifier priority). This is the same deterministic state surfaced on
// the conversations queue.
const ACTION_STATE_LABELS: Record<string, string> = {
  NONE: "No action",
  FOLLOW_UP: "Follow-up",
  PRIORITY_FOLLOW_UP: "Priority follow-up",
  ADMISSION_ASSISTANCE: "Admission assistance",
};

const ACTION_STATE_COLORS: Record<string, string> = {
  NONE: "bg-slate-100 text-slate-600",
  FOLLOW_UP: "bg-amber-100 text-amber-800",
  PRIORITY_FOLLOW_UP: "bg-orange-100 text-orange-800",
  ADMISSION_ASSISTANCE: "bg-red-100 text-red-800",
};

// Counsellor WORKING actions surfaced here (Phase 8). Deliberately
// EXCLUDED from this unified surface: PAYMENT_VERIFIED / ADMISSION_CONFIRMED
// / ADMISSION_COMPLETED — payment verification and admission conclusion
// remain on the dedicated Admissions workspace (Phase 15). The backend
// admission lifecycle is still the authority and rejects anything invalid.
const WORKING_ACTIONS: Array<{ key: string; label: string; tone: string; prompt?: string }> = [
  { key: "CONTACT_PENDING", label: "Awaiting contact", tone: "bg-indigo-500 text-white hover:bg-indigo-600" },
  { key: "MARK_CONTACTED", label: "Mark contacted", tone: "bg-blue-600 text-white hover:bg-blue-700" },
  { key: "FOLLOW_UP", label: "Set follow-up", tone: "bg-amber-500 text-white hover:bg-amber-600" },
  { key: "DOCUMENTS_PENDING", label: "Documents pending", tone: "bg-cyan-600 text-white hover:bg-cyan-700" },
  { key: "PAYMENT_PENDING", label: "Payment pending", tone: "bg-orange-600 text-white hover:bg-orange-700" },
  { key: "NOT_INTERESTED", label: "Not interested", tone: "bg-slate-500 text-white hover:bg-slate-600", prompt: "Reason (optional):" },
  { key: "LOST", label: "Mark lost", tone: "bg-gray-700 text-white hover:bg-gray-800", prompt: "Reason (optional):" },
  { key: "REACTIVATE", label: "Reactivate", tone: "bg-indigo-600 text-white hover:bg-indigo-700" },
];

const BOOKING_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  ATTENDED: "Attended",
  NO_SHOW: "No-show",
  CANCELLED: "Cancelled",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// S6-F2 — human-readable actor for an admission event. A staff actor
// (COUNSELLOR/ADMIN) renders its resolved display name + role; non-staff
// actors keep their existing semantics.
function actorLabel(ev: AdmissionEvent): string {
  if (ev.actor === "STUDENT") return "Student";
  if (ev.actor === "SYSTEM") return "System";
  if (ev.actor === "AI") return "AI (automated)";
  if (ev.actorName) {
    return `${ev.actorName} — ${ev.actor === "ADMIN" ? "Admin" : "Counsellor"}`;
  }
  return ev.actor === "ADMIN" ? "Admin" : "Counsellor";
}

function StateBadge({ state }: { state: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_COLORS[state] ?? "bg-slate-100 text-slate-700"}`}>
      {STATE_LABELS[state] ?? state}
    </span>
  );
}

function ActionStateBadge({ state }: { state: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_STATE_COLORS[state] ?? "bg-slate-100 text-slate-700"}`}>
      {ACTION_STATE_LABELS[state] ?? state}
    </span>
  );
}

// S6-F1 — derived counsellor follow-up due status (deterministic, shown
// as a plain label — never a hidden classifier). OVERDUE is the most
// visually urgent; NONE means no scheduled follow-up.
const FOLLOW_UP_STATUS_COLORS: Record<string, string> = {
  NONE: "bg-slate-100 text-slate-600",
  OVERDUE: "bg-red-100 text-red-800 ring-1 ring-red-300",
  DUE_SOON: "bg-amber-100 text-amber-800",
  UPCOMING: "bg-blue-100 text-blue-800",
};

function FollowUpBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${FOLLOW_UP_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}>
      {status === "NONE" ? "No follow-up" : status === "OVERDUE" ? "Overdue" : status === "DUE_SOON" ? "Due soon" : status === "UPCOMING" ? "Upcoming" : status}
    </span>
  );
}

// S6-F2 — deterministic conversion-journey steps. Purely a display map of
// the canonical admission state to a funnel position — it is NOT a hidden
// classifier or a second queue. Interest/contact → follow-up → documents →
// payment → admission, with a terminal state rendered separately.
const JOURNEY_STEPS: Array<{ key: string; label: string }> = [
  { key: "INTEREST", label: "Interest" },
  { key: "CONTACT", label: "Contact" },
  { key: "FOLLOW_UP", label: "Follow-up" },
  { key: "DOCUMENTS", label: "Documents" },
  { key: "PAYMENT", label: "Payment" },
  { key: "ADMISSION", label: "Admission" },
];

function journeyIndexForState(state: string | null | undefined): number {
  switch (state) {
    case "INTERESTED":
    case "COUNSELLOR_CONTACT_PENDING":
      return 0;
    case "COUNSELLOR_CONTACTED":
      return 1;
    case "FOLLOW_UP_REQUIRED":
      return 2;
    case "DOCUMENTS_PENDING":
      return 3;
    case "PAYMENT_PENDING":
    case "PAYMENT_VERIFICATION":
    case "PAYMENT_VERIFIED":
      return 4;
    case "ADMISSION_CONFIRMED":
    case "ADMISSION_COMPLETED":
      return 5;
    default:
      return -1; // NOT_INTERESTED / LOST → terminal, no active step
  }
}

function JourneyStrip({ admission }: { admission: Admission }) {
  const idx = journeyIndexForState(admission.state);
  const terminal = admission.state === "LOST" || admission.state === "NOT_INTERESTED";
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <div className="flex items-center gap-1 overflow-x-auto">
        {JOURNEY_STEPS.map((step, i) => {
          const reached = idx >= i;
          const active = idx === i && !terminal;
          return (
            <div key={step.key} className="flex shrink-0 items-center gap-1">
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  active
                    ? "bg-blue-600 text-white"
                    : reached
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {step.label}
              </span>
              {i < JOURNEY_STEPS.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          );
        })}
      </div>
      {terminal && (
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          Journey ended — {STATE_LABELS[admission.state] ?? admission.state}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function StudentWorkspacePage() {
  const params = useParams<{ id: string }>();
  const conversationId = String(params?.id ?? "");
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Counsellor list for the assign dropdown (loaded once, lightweight).
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);

  // Action-panel state scoped to the primary admission.
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    async (id: string) => {
      if (!id) return;
      setLoading(true);
      setError(null);
      setWorkspace(null);
      setSelectedAdmission(null);
      setNote("");
      setFollowUpDate("");
      try {
        const res = await fetch(`/api/admin/conversations/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Unable to load the student workspace.");
        setWorkspace(data.workspace);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load the student workspace.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(conversationId);
  }, [conversationId, load]);

  // Fetch the active counsellor list once, for the assign dropdown,
  // via the existing admissions list endpoint (which returns counsellors).
  useEffect(() => {
    fetch("/api/admin/admissions?limit=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.counsellors?.length) setCounsellors(d.counsellors);
      })
      .catch(() => {});
  }, []);

  const primaryAdmission = useMemo(() => {
    if (!workspace) return null;
    const admissions = workspace.admissions;
    if (admissions.length === 0) return null;
    const fromAction = workspace.latestAction?.course
      ? admissions.find((a) => a.course.toLowerCase() === workspace.latestAction!.course!.toLowerCase())
      : undefined;
    const fromDemo = workspace.demoBookings.find((b) => b.course)
      ? admissions.find(
          (a) => a.course.toLowerCase() === workspace.demoBookings.find((b) => b.course)!.course!.toLowerCase(),
        )
      : undefined;
    return fromAction ?? fromDemo ?? admissions[0];
  }, [workspace]);

  useEffect(() => {
    setSelectedAdmission(primaryAdmission ?? null);
  }, [primaryAdmission]);

  const runAction = useCallback(
    async (
      action: string,
      admissionId: string,
      extra: { reason?: string; staffId?: string | null; nextFollowUpAt?: Date | null } = {},
    ) => {
      const key = `${action}-${admissionId}`;
      setBusy(key);
      try {
        const res = await fetch(`/api/admin/admissions/${admissionId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            reason: extra.reason ?? null,
            staffId: extra.staffId ?? null,
            nextFollowUpAt:
              extra.nextFollowUpAt === undefined
                ? undefined
                : extra.nextFollowUpAt === null
                  ? null
                  : extra.nextFollowUpAt.toISOString(),
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.errorCode ? `${data.error} (${data.errorCode})` : data.error || "Action failed.");
        }
        window.alert(data.applied === false ? "No change (already in that state)." : "Action applied.");
        await load(conversationId);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Action failed.");
      } finally {
        setBusy(null);
      }
    },
    [conversationId, load],
  );

  const addNote = useCallback(async () => {
    if (!selectedAdmission || !note.trim()) return;
    setBusy(`NOTE-${selectedAdmission.id}`);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedAdmission.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NOTE", note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Note failed.");
      setNote("");
      await load(conversationId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Note failed.");
    } finally {
      setBusy(null);
    }
  }, [selectedAdmission, note, conversationId, load]);

  const confirmAction = useCallback(
    (a: (typeof WORKING_ACTIONS)[number], admissionId: string) => {
      if (a.prompt) {
        const reason = window.prompt(a.prompt);
        if (reason === null) return;
        void runAction(a.key, admissionId, { reason: reason.trim() || undefined });
      } else {
        void runAction(a.key, admissionId);
      }
    },
    [runAction],
  );

  // S6-F1 — schedule / reschedule / clear the follow-up date, and record
  // an attempt. Both are human actions that go through the existing
  // admissions actions endpoint (server-derived actor + canModifyAdmission).
  const scheduleFollowUp = useCallback(
    async (admissionId: string) => {
      let date: Date | null | undefined;
      const raw = followUpDate.trim();
      if (raw) {
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) {
          window.alert("Enter a valid follow-up date.");
          return;
        }
        date = parsed;
      } else {
        date = null; // clear the scheduled follow-up
      }
      await runAction("FOLLOW_UP", admissionId, { nextFollowUpAt: date });
      setFollowUpDate("");
    },
    [followUpDate, runAction],
  );

  const recordAttempt = useCallback(
    async (admissionId: string) => {
      const reason = window.prompt("Follow-up attempt note (optional):");
      if (reason === null) return;
      await runAction("FOLLOW_UP_ATTEMPTED", admissionId, { reason: reason.trim() || undefined });
    },
    [runAction],
  );

  const studentName = useMemo(
    () =>
      workspace?.conversation.name ||
      workspace?.lead?.name ||
      workspace?.conversation.phone ||
      workspace?.lead?.phone ||
      "Anonymous",
    [workspace],
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-slate-500">Loading student workspace…</p>
      </main>
    );
  }

  if (error || !workspace) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/admin/conversations" className="text-sm font-medium text-blue-600 hover:underline">
            ← Back to conversations
          </Link>
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error || "Student workspace not found."}
          </div>
        </div>
      </main>
    );
  }

  const conv = workspace.conversation;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminCrmNav current="/admin/conversations" />
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/admin/conversations" className="text-sm font-medium text-blue-600 hover:underline">
              ← Back to conversations
            </Link>
            <p className="mt-2 text-sm font-medium text-blue-600">ANU Education Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{studentName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-700">{conv.phone || "—"}</span>
              <span>·</span>
              <span>{conv.email || "—"}</span>
              <span>·</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase text-slate-600">{conv.source}</span>
              {conv.sourcePage && <span className="text-xs text-slate-400">({conv.sourcePage})</span>}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            {workspace.latestAction && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Counsellor state</span>
                <ActionStateBadge state={workspace.latestAction.state} />
              </div>
            )}
            <div className="text-xs text-slate-500">
              Conversation updated {formatDate(conv.updatedAt)}
            </div>
            <div className="text-xs text-slate-500">
              Assigned to{" "}
              {conv.assignedCounsellor ? conv.assignedCounsellor.name : <span className="text-slate-400">unassigned</span>}
            </div>
          </div>
        </div>

        {/* Related conversations (cross-channel visibility) */}
        {workspace.relatedConversations.length > 1 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Related conversations ({workspace.relatedConversations.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {workspace.relatedConversations.map((c) => {
                const current = c.id === conv.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={current}
                    onClick={() => router.push(`/admin/conversations/${c.id}`)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      current
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {c.source}
                    {c.name && ` · ${c.name}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: student context + transcript */}
          <div className="space-y-6 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Lead context</h2>
              {workspace.leadContext ? (
                <dl className="space-y-1.5 text-sm">
                  {[
                    ["Goal", workspace.leadContext.goal],
                    ["Target country", workspace.leadContext.targetCountry],
                    ["Target course", workspace.leadContext.targetCourse],
                    ["English level", workspace.leadContext.englishLevel],
                    ["Budget", workspace.leadContext.budgetRange],
                    ["Timeline", workspace.leadContext.timeline],
                    ["Intake", workspace.leadContext.intake],
                    ["Biggest challenge", workspace.leadContext.biggestChallenge],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-slate-500">{k}</dt>
                      <dd className="text-right text-slate-900">{v || "—"}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No structured lead context recorded.</p>
              )}
              {workspace.lead && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-sm">
                    <dt className="text-slate-500">Identity source</dt>
                    <dd className="text-slate-900">{workspace.lead.identitySource || "—"}</dd>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Transcript ({workspace.transcript.length})
              </h2>
              <div className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
                {workspace.transcript.length === 0 ? (
                  <p className="text-sm text-slate-400">No messages yet.</p>
                ) : (
                  workspace.transcript.map((m) => (
                    <div key={m.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            m.role === "ASSISTANT" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {m.role === "ASSISTANT" ? "ANU" : "Student"}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(m.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-slate-800">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* MIDDLE: demo bookings */ }
          <div className="space-y-6 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Demo bookings ({workspace.demoBookings.length})
              </h2>
              {workspace.demoBookings.length === 0 ? (
                <p className="text-sm text-slate-400">No demo bookings yet.</p>
              ) : (
                <div className="space-y-4">
                  {workspace.demoBookings.map((b) => (
                    <div key={b.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">{b.course || "Demo booking"}</span>
                        <span className="text-xs text-slate-500">{BOOKING_STATUS_LABELS[b.status] ?? b.status}</span>
                      </div>
                      <dl className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between"><dt>Preferred batch</dt><dd>{b.preferredBatch || "—"}</dd></div>
                        <div className="flex justify-between"><dt>Preferred date</dt><dd>{formatDate(b.preferredDate)}</dd></div>
                        <div className="flex justify-between"><dt>Attendance verified</dt><dd>{b.verifiedBy ? b.verifiedBy.name : "Not verified"}</dd></div>
                        <div className="flex justify-between"><dt>Created</dt><dd>{formatDate(b.createdAt)}</dd></div>
                      </dl>
                      {b.attendanceNote && (
                        <p className="mt-2 rounded bg-white p-2 text-xs text-slate-700">{b.attendanceNote}</p>
                      )}
                      {b.events.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-slate-200 pt-2">
                          {b.events.map((e) => (
                            <div key={e.id} className="text-xs text-slate-500">
                              <span className="font-medium text-slate-700">{e.action}</span> ·{" "}
                              {e.previousStatus ? `${e.previousStatus} → ` : ""}
                              {e.nextStatus}
                              {e.staffName && <span> · by {e.staffName}</span>}
                              <span className="ml-1 text-slate-400">{formatDate(e.createdAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Attendance is shown only from a counsellor&apos;s verification. Verify attendance on the Demo attendance screen.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Portal access requests ({workspace.portalAccessRequests.length})
              </h2>
              {workspace.portalAccessRequests.length === 0 ? (
                <p className="text-sm text-slate-400">No portal access requests.</p>
              ) : (
                <div className="space-y-2">
                  {workspace.portalAccessRequests.map((p) => (
                    <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{p.course || "Portal access"}</span>
                        <span className="text-xs text-slate-500">{p.status}</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(p.createdAt)}
                        {p.completedAt && <span> · completed {formatDate(p.completedAt)}</span>}
                        {p.failedAt && <span> · failed {formatDate(p.failedAt)}</span>}
                      </div>
                      {p.notes && <p className="mt-1 text-xs text-slate-600">{p.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: admissions + working actions */}
          <div className="space-y-6 lg:col-span-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Admissions ({workspace.admissions.length})
              </h2>
              {workspace.admissions.length === 0 ? (
                <p className="text-sm text-slate-400">No admission record linked to this student yet.</p>
              ) : (
                <div className="space-y-4">
                  {workspace.admissions.map((a) => {
                    const isPrimary = selectedAdmission?.id === a.id;
                    return (
                      <div key={a.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAdmission(a)}
                            className={`text-sm font-semibold ${isPrimary ? "text-blue-700" : "text-slate-900 hover:text-blue-700"}`}
                          >
                            {a.course}
                          </button>
                          <StateBadge state={a.state} />
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {a.assignedCounsellor ? `Assigned to ${a.assignedCounsellor.name}` : "Unassigned"} · updated {formatDate(a.updatedAt)}
                        </div>

                        {isPrimary && <JourneyStrip admission={a} />}

                        {isPrimary && (
                          <div className="mt-3 border-t border-slate-100 pt-3">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Counsellor</h3>
                            {a.assignedCounsellor ? (
                              <p className="text-sm text-slate-900">{a.assignedCounsellor.name}</p>
                            ) : (
                              <p className="text-sm text-slate-400">Unassigned</p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                              {!a.assignedCounsellor ? (
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) void runAction("ASSIGN", a.id, { staffId: e.target.value });
                                  }}
                                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                                >
                                  <option value="">Assign counsellor...</option>
                                  {counsellors.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void runAction("RELEASE", a.id)}
                                  disabled={busy !== null}
                                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                  Release
                                </button>
                              )}
                            </div>

                            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Follow-up</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <FollowUpBadge status={a.followUp?.status ?? "NONE"} />
                              {a.nextFollowUpAt && (
                                <span className="text-xs text-slate-500">{formatDate(a.nextFollowUpAt)}</span>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <input
                                type="datetime-local"
                                value={followUpDate}
                                onChange={(e) => setFollowUpDate(e.target.value)}
                                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void scheduleFollowUp(a.id)}
                                disabled={busy !== null}
                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                              >
                                {a.nextFollowUpAt ? "Reschedule" : "Schedule"}
                              </button>
                              {a.nextFollowUpAt && (
                                <button
                                  type="button"
                                  onClick={() => void runAction("FOLLOW_UP", a.id, { nextFollowUpAt: null })}
                                  disabled={busy !== null}
                                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                >
                                  Clear
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void recordAttempt(a.id)}
                                disabled={busy !== null}
                                className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                              >
                                Follow-up attempted
                              </button>
                            </div>
                            {(() => {
                              const attempts = a.events.filter((e) => e.action === "FOLLOW_UP_ATTEMPTED");
                              const last = a.events[a.events.length - 1];
                              const isAttempt = last?.action === "FOLLOW_UP_ATTEMPTED";
                              return (
                                <>
                                  {attempts.length > 0 && (
                                    <p className="mt-2 text-xs text-slate-500">
                                      Attempts: {attempts.length} · last {formatDate(attempts[attempts.length - 1].createdAt)}
                                    </p>
                                  )}
                                  {isAttempt && (
                                    <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-3">
                                      <p className="text-xs font-semibold text-violet-800">Follow-up recorded</p>
                                      <p className="mt-1 text-xs text-violet-700">
                                        Nothing advanced automatically — pick the next step below (re-schedule, move
                                        toward payment, mark not interested, or lost).
                                      </p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}

                            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Working actions</h3>
                            <div className="flex flex-wrap gap-2">
                              {WORKING_ACTIONS.map((wa) => (
                                <button
                                  key={wa.key}
                                  type="button"
                                  onClick={() => confirmAction(wa, a.id)}
                                  disabled={busy !== null}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${wa.tone}`}
                                >
                                  {wa.label}
                                </button>
                              ))}
                            </div>

                            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Counsellor note</h3>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Write an immutable note…"
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => void addNote()}
                                disabled={busy !== null || !note.trim()}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                              >
                                Add note
                              </button>
                            </div>

                            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Event history ({a.events.length})
                            </h3>
                            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                              {a.events.length === 0 ? (
                                <p className="text-sm text-slate-400">No events yet.</p>
                              ) : (
                                a.events.map((ev) => (
                                  <div key={ev.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold text-slate-900">{ACTION_LABELS[ev.action] ?? ev.action}</span>
                                      <span className="text-xs text-slate-400">{formatDate(ev.createdAt)}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500">
                                      {actorLabel(ev)} ·{" "}
                                      {ev.previousState ? `${STATE_LABELS[ev.previousState] ?? ev.previousState} → ` : ""}
                                      {STATE_LABELS[ev.nextState] ?? ev.nextState}
                                    </div>
                                    {ev.reason && <div className="mt-1.5 text-xs text-slate-600">{ev.reason}</div>}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-xs text-slate-400">
                Select an admission to work it. Payment verification and admission confirmation happen on the Admissions screen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
