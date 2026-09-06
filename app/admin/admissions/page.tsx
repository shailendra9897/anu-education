"use client";

// ═════════════════════════════════════════════════════════════════
// PHASE S6-B2 — COUNSELLOR ADMISSION WORKSPACE
//
// The minimal counselor workspace on the existing /admin surface —
// modeled on /admin/portal-access. It lists canonical
// AdmissionEnrollment records (urgent-first ordering), lets a
// counselor open a record and work it (assign, mark contacted,
// transitions, reactivation, notes), and shows the immutable event
// history. Every write is a call to /api/admin/admissions/[id]/actions,
// which derives the actor server-side and funnels through the S6-B1
// lifecycle. This page never writes to the DB directly.
//
// No AI chain-of-thought, model reasoning, or hidden classifier
// details are rendered — only canonical fields + admitted actions.
// ═════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState } from "react";
import { classifyFollowUpStatus } from "@/lib/admission/followUpStatus";
import { AdminCrmNav } from "@/components/admin/AdminCrmNav";

type Counsellor = { id: string; name: string; email: string };

type AdmissionRow = {
  id: string;
  course: string;
  state: string;
  assignedCounsellorId: string | null;
  assignedCounsellor: Counsellor | null;
  contactedAt: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead: { id: string; name: string | null; phone: string | null; email: string | null };
};

type EventRow = {
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

type AdmissionDetail = AdmissionRow & {
  events: EventRow[];
};

type ListResponse = {
  success: boolean;
  admissions: AdmissionRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  counsellors: Counsellor[];
  courses: string[];
  states: string[];
  error?: string;
};

const ACTION_LABELS: Record<string, string> = {
  ENROLLMENT_CREATED: "Enrollment created",
  INTEREST_DETECTED: "Interest detected",
  COUNSELLOR_CONTACTED: "Counsellor contacted",
  COUNSELLOR_ASSIGNED: "Counsellor assigned",
  FOLLOW_UP_REQUIRED: "Follow-up required",
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

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// S6-F2 — human-readable actor for an event. A staff actor (COUNSELLOR/
// ADMIN) renders its resolved display name + role ("Rahul — Counsellor");
// non-staff actors keep their existing semantics.
function actorLabel(ev: EventRow): string {
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
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STATE_COLORS[state] ?? "bg-slate-100 text-slate-700"}`}
    >
      {STATE_LABELS[state] ?? state}
    </span>
  );
}

// S6-F1 — derived counsellor follow-up due status (deterministic label,
// never a hidden classifier). OVERDUE is the most visually urgent.
const FOLLOW_UP_STATUS_COLORS: Record<string, string> = {
  NONE: "bg-slate-100 text-slate-600",
  OVERDUE: "bg-red-100 text-red-800 ring-1 ring-red-300",
  DUE_SOON: "bg-amber-100 text-amber-800",
  UPCOMING: "bg-blue-100 text-blue-800",
};

function FollowUpBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${FOLLOW_UP_STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {status === "NONE" ? "No follow-up" : status === "OVERDUE" ? "Overdue" : status === "DUE_SOON" ? "Due soon" : status === "UPCOMING" ? "Upcoming" : status}
    </span>
  );
}

// Which actions are offered per current state (simplest admissible set
// of the S6-B1 graph — the API remains the authority and still rejects
// anything the lifecycle forbids).
const TRANSITION_ACTIONS: Array<{ key: string; label: string; tone: string }> = [
  { key: "CONTACT_PENDING", label: "Awaiting contact", tone: "bg-indigo-500 text-white hover:bg-indigo-600" },
  { key: "MARK_CONTACTED", label: "Mark contacted", tone: "bg-blue-600 text-white hover:bg-blue-700" },
  { key: "FOLLOW_UP", label: "Set follow-up", tone: "bg-amber-500 text-white hover:bg-amber-600" },
  { key: "DOCUMENTS_PENDING", label: "Documents pending", tone: "bg-cyan-600 text-white hover:bg-cyan-700" },
  { key: "PAYMENT_PENDING", label: "Payment pending", tone: "bg-orange-600 text-white hover:bg-orange-700" },
  { key: "PAYMENT_VERIFICATION", label: "Start payment verification", tone: "bg-red-600 text-white hover:bg-red-700" },
  { key: "PAYMENT_VERIFIED", label: "Verify payment (human)", tone: "bg-lime-600 text-white hover:bg-lime-700" },
  { key: "ADMISSION_CONFIRMED", label: "Confirm admission (human)", tone: "bg-green-600 text-white hover:bg-green-700" },
  { key: "ADMISSION_COMPLETED", label: "Complete admission (human)", tone: "bg-emerald-700 text-white hover:bg-emerald-800" },
  { key: "NOT_INTERESTED", label: "Not interested", tone: "bg-slate-500 text-white hover:bg-slate-600" },
  { key: "LOST", label: "Mark lost", tone: "bg-gray-700 text-white hover:bg-gray-800" },
  { key: "REACTIVATE", label: "Reactivate (was not interested)", tone: "bg-indigo-600 text-white hover:bg-indigo-700" },
];

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<AdmissionRow[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCourse, setFilterCourse] = useState("ALL");
  const [filterState, setFilterState] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [filterFollowUp, setFilterFollowUp] = useState("ALL");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [note, setNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const limit = 50;

  const loadAdmissions = useCallback(
    async (resetOffset = true) => {
      try {
        setLoading(true);
        setError(null);
        const newOffset = resetOffset ? 0 : offset;
        const params = new URLSearchParams({ limit: `${limit}`, offset: `${newOffset}` });
        if (filterCourse !== "ALL") params.set("course", filterCourse);
        if (filterState !== "ALL") params.set("state", filterState);
        if (filterAssignee !== "ALL") params.set("assignee", filterAssignee);
        if (filterFollowUp !== "ALL") params.set("followUp", filterFollowUp);

        const res = await fetch(`/api/admin/admissions?${params}`, { cache: "no-store" });
        const data = (await res.json()) as ListResponse;
        if (!res.ok || !data.success) throw new Error(data.error || "Unable to load admissions.");

        setAdmissions((prev) => (resetOffset ? data.admissions : [...prev, ...data.admissions]));
        setOffset((prev) => (resetOffset ? 0 : prev));
        setTotal(data.total);
        setHasMore(data.hasMore);
        if (data.counsellors.length) setCounsellors(data.counsellors);
        if (data.courses.length) setCourses(data.courses);
        if (data.states.length) setStates(data.states);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load admissions.");
      } finally {
        setLoading(false);
      }
    },
    [filterCourse, filterState, filterAssignee, filterFollowUp, offset, limit],
  );

  useEffect(() => {
    loadAdmissions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourse, filterState, filterAssignee, filterFollowUp]);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/admissions/${id}`, { cache: "no-store" });
      const data = (await res.json()) as { success: boolean; admission: AdmissionDetail; error?: string };
      if (!res.ok || !data.success) throw new Error(data.error || "Unable to load detail.");
      setDetail(data.admission);
      setNote("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to load detail.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openRecord = useCallback(
    (id: string) => {
      const goto = id === selectedId ? null : id;
      setSelectedId(goto);
      setDetail(null);
      if (goto) loadDetail(goto);
    },
    [loadDetail, selectedId],
  );

  const runAction = useCallback(
    async (action: string, extra: { reason?: string; staffId?: string | null; nextFollowUpAt?: Date | null } = {}) => {
      if (!detail) return;
      const key = `${action}-${detail.id}`;
      setBusy(key);
      try {
        const res = await fetch(`/api/admin/admissions/${detail.id}/actions`, {
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
        await loadDetail(detail.id);
        await loadAdmissions(false);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Action failed.");
      } finally {
        setBusy(null);
      }
    },
    [detail, loadDetail, loadAdmissions],
  );

  // S6-F2 — schedule / reschedule / clear the follow-up date on the
  // canonical Admissions workspace (mirrors the unified workspace).
  const scheduleFollowUp = useCallback(async () => {
    if (!detail) return;
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
      date = null;
    }
    await runAction("FOLLOW_UP", { nextFollowUpAt: date });
    setFollowUpDate("");
  }, [detail, followUpDate, runAction]);

  const clearFollowUp = useCallback(() => {
    void runAction("FOLLOW_UP", { nextFollowUpAt: null });
  }, [runAction]);

  const recordAttempt = useCallback(async () => {
    const reason = window.prompt("Follow-up attempt note (optional):");
    if (reason === null) return;
    await runAction("FOLLOW_UP_ATTEMPTED", { reason: reason.trim() || undefined });
  }, [runAction]);

  const addNote = useCallback(async () => {
    if (!detail || !note.trim()) return;
    setBusy(`NOTE-${detail.id}`);
    try {
      const res = await fetch(`/api/admin/admissions/${detail.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "NOTE", note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Note failed.");
      setNote("");
      await loadDetail(detail.id);
      await loadAdmissions(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Note failed.");
    } finally {
      setBusy(null);
    }
  }, [detail, note, loadDetail, loadAdmissions]);

  const promptAndRun = useCallback(
    (action: string, promptText: string) => {
      if (!detail) return;
      const reason = window.prompt(promptText);
      if (reason === null) return;
      runAction(action, { reason: reason.trim() || undefined });
    },
    [detail, runAction],
  );

  const studentName = useMemo(
    () => detail?.lead.name || detail?.lead.phone || detail?.lead.email || "Anonymous",
    [detail],
  );

  // S6-F2 — latest FOLLOW_UP_ATTEMPTED event, for the detail panel.
  const lastFollowUpAttempt = useMemo(
    () => detail?.events.filter((e) => e.action === "FOLLOW_UP_ATTEMPTED").slice(-1)[0] ?? null,
    [detail],
  );

  // S6-F2 — is the most recent lifecycle action a recorded follow-up
  // attempt? Drives the "choose the next step" callout (no auto-advance).
  const lastEventIsAttempt = useMemo(() => {
    if (!detail || detail.events.length === 0) return false;
    const last = detail.events[detail.events.length - 1];
    return last.action === "FOLLOW_UP_ATTEMPTED";
  }, [detail]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminCrmNav current="/admin/admissions" />
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">ANU Education Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Admissions</h1>
            <p className="mt-1 text-sm text-slate-500">
              Work the canonical admission records — urgent states first. Every action is audited and gated by a human.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadAdmissions(true)}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Admission State</label>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {STATE_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Counsellor</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to me</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Follow-up</label>
            <select
              value={filterFollowUp}
              onChange={(e) => setFilterFollowUp(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="none">No follow-up</option>
              <option value="overdue">Overdue</option>
              <option value="due">Due soon</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-600">
          Showing {admissions.length} of {total} admissions
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && admissions.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading admissions...</div>
          ) : admissions.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">No admission records found.</div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Course</th>
                      <th className="px-4 py-3">State</th>
                      <th className="px-4 py-3">Assigned To</th>
                      <th className="px-4 py-3">Contacted</th>
                      <th className="px-4 py-3">Follow-up</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {adm.lead.name || adm.lead.phone || adm.lead.email || "Anonymous"}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {adm.lead.phone && <span>{adm.lead.phone}</span>}
                            {adm.lead.phone && adm.lead.email && <span> · </span>}
                            {adm.lead.email && <span>{adm.lead.email}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{adm.course}</td>
                        <td className="px-4 py-3"><StateBadge state={adm.state} /></td>
                        <td className="px-4 py-3 text-sm">
                          {adm.assignedCounsellor ? (
                            <span className="font-medium text-slate-900">{adm.assignedCounsellor.name}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {adm.contactedAt ? formatDate(adm.contactedAt) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <FollowUpBadge status={classifyFollowUpStatus(adm.nextFollowUpAt).status} />
                          {adm.nextFollowUpAt && (
                            <div className="mt-0.5 text-xs text-slate-400">{formatDate(adm.nextFollowUpAt)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(adm.updatedAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => openRecord(adm.id)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {selectedId === adm.id ? "Close" : "Open"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {admissions.map((adm) => (
                  <div key={adm.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {adm.lead.name || adm.lead.phone || adm.lead.email || "Anonymous"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {adm.course} · {adm.lead.phone || adm.lead.email || "no contact"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StateBadge state={adm.state} />
                        <FollowUpBadge status={classifyFollowUpStatus(adm.nextFollowUpAt).status} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openRecord(adm.id)}
                      className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {selectedId === adm.id ? "Close" : "Open"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setOffset(offset + limit);
                loadAdmissions(false);
              }}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* DETAIL PANEL */}
        {selectedId && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">{studentName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{detail?.course || "…"}</span>
                  <span>·</span>
                  <StateBadge state={detail?.state ?? "INTERESTED"} />
                  {detail?.contactedAt && (
                    <>
                      <span>·</span>
                      <span>Contacted {formatDate(detail.contactedAt)}</span>
                    </>
                  )}
                </div>
              </div>
              {detailLoading && <span className="text-xs text-slate-400">Loading…</span>}
              <button
                type="button"
                onClick={() => openRecord(selectedId)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {detail && (
              <div className="grid gap-6 p-5 lg:grid-cols-2">
                {/* LEFT: identity + counsellor actions */}
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Student</h3>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between"><dt className="text-slate-500">Phone</dt><dd className="text-slate-900">{detail.lead.phone || "—"}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="text-slate-900">{detail.lead.email || "—"}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Course</dt><dd className="text-slate-900">{detail.course}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="text-slate-900">{formatDate(detail.createdAt)}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd className="text-slate-900">{formatDate(detail.updatedAt)}</dd></div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Counsellor</h3>
                    {detail.assignedCounsellor ? (
                      <p className="text-sm text-slate-900">
                        {detail.assignedCounsellor.name} <span className="text-xs text-slate-400">({detail.assignedCounsellor.email})</span>
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">Unassigned</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {!detail.assignedCounsellor ? (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) runAction("ASSIGN", { staffId: e.target.value });
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
                          onClick={() => runAction("RELEASE")}
                          disabled={busy !== null}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </div>

                  {/* S6-F2 — follow-up schedule/attempt, shown on the
                      canonical Admissions workspace. Mirrors the unified
                      workspace: schedule/reschedule/clear the date, record
                      an attempt (clears the date, no auto state change). */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Follow-up</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <FollowUpBadge status={classifyFollowUpStatus(detail.nextFollowUpAt).status} />
                      {detail.nextFollowUpAt && (
                        <span className="text-xs text-slate-500">{formatDate(detail.nextFollowUpAt)}</span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        type="datetime-local"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        disabled={busy !== null}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => void scheduleFollowUp()}
                        disabled={busy !== null}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                      >
                        {detail.nextFollowUpAt ? "Reschedule" : "Schedule"}
                      </button>
                      {detail.nextFollowUpAt && (
                        <button
                          type="button"
                          onClick={clearFollowUp}
                          disabled={busy !== null}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void recordAttempt()}
                        disabled={busy !== null}
                        className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                      >
                        Follow-up attempted
                      </button>
                    </div>
                    {lastFollowUpAttempt && (
                      <p className="mt-2 text-xs text-slate-500">
                        Last attempt: {formatDate(lastFollowUpAttempt.createdAt)}
                      </p>
                    )}
                    {lastEventIsAttempt && (
                      <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-3">
                        <p className="text-xs font-semibold text-violet-800">Follow-up recorded</p>
                        <p className="mt-1 text-xs text-violet-700">
                          Nothing advanced automatically — pick the next step (re-schedule, move toward payment,
                          mark not interested, or lost).
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Lifecycle actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {TRANSITION_ACTIONS.map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={() =>
                            a.key === "NOT_INTERESTED" || a.key === "LOST"
                              ? promptAndRun(a.key, "Reason (optional):")
                              : a.key === "PAYMENT_VERIFICATION"
                                ? promptAndRun(a.key, "Evidence note (e.g. payment reference / screenshot):")
                                : a.key === "PAYMENT_VERIFIED"
                                  ? promptAndRun(a.key, "Verification note (what the counsellor confirmed):")
                                  : runAction(a.key)
                          }
                          disabled={busy !== null}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${a.tone}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Counsellor note</h3>
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
                        onClick={addNote}
                        disabled={busy !== null || !note.trim()}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                      >
                        Add note
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: immutable event history */}
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event history ({detail.events.length})
                  </h3>
                  <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
                    {detail.events.length === 0 ? (
                      <p className="text-sm text-slate-400">No events yet.</p>
                    ) : (
                      detail.events.map((ev) => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}