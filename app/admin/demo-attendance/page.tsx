"use client";

// ═════════════════════════════════════════════════════════════════
// PHASE S6-D2-B — COUNSELLOR-CONTROLLED FREE DEMO ATTENDANCE
//
// A compact, focused companion surface on the existing /admin area
// (modeled on /admin/admissions). It lists DemoBookings and lets a
// counsellor/admin resolve attendance with a single click:
//        [✓ Attended]  [✕ No Show]  [Cancel]  (+ optional note)
//
// Every write goes to POST /api/admin/demo-bookings/[id]/actions, whose
// server derives the actor and enforces per-record authorization. This
// page never writes to the DB directly. Attendance NEVER touches an
// AdmissionEnrollment (no payment verify, no admission confirm).
//
// The counsellor does not manage technical fields — only the human
// outcome. After any action the row is refreshed so the visible status
// updates immediately.
// ═════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { AdminCrmNav } from "@/components/admin/AdminCrmNav";

type StaffShort = { id: string; name: string };

type BookingRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  course: string | null;
  preferredBatch: string | null;
  preferredDate: string | null;
  status: string;
  attendedAt: string | null;
  noShowAt: string | null;
  cancelledAt: string | null;
  attendanceNote: string | null;
  createdAt: string;
  assignedCounsellor: StaffShort | null;
  attendanceVerifiedByStaff: StaffShort | null;
};

type ListResponse = {
  success: boolean;
  bookings: BookingRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  statuses: string[];
  error?: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ATTENDED: "Attended",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  ATTENDED: "bg-green-100 text-green-800",
  NO_SHOW: "bg-amber-100 text-amber-800",
  CANCELLED: "bg-gray-100 text-gray-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function fmtDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
}

export default function DemoAttendancePage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  // Note field keyed per booking id; placeholder text set on click.
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteFor, setNoteFor] = useState<string | null>(null);

  const limit = 50;

  const loadBookings = useCallback(
    async (resetOffset = true) => {
      try {
        setLoading(true);
        setError(null);
        const newOffset = resetOffset ? 0 : offset;
        const params = new URLSearchParams({ limit: `${limit}`, offset: `${newOffset}` });
        if (filterStatus !== "ALL") params.set("status", filterStatus);
        const res = await fetch(`/api/admin/demo-bookings?${params}`, { cache: "no-store" });
        const data = (await res.json()) as ListResponse;
        if (!res.ok || !data.success) throw new Error(data.error || "Unable to load demo bookings.");
        setBookings((prev) => (resetOffset ? data.bookings : [...prev, ...data.bookings]));
        setOffset((prev) => (resetOffset ? 0 : prev));
        setTotal(data.total);
        setHasMore(data.hasMore);
        if (data.statuses.length) setStatuses(data.statuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load demo bookings.");
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, offset, limit],
  );

  useEffect(() => {
    loadBookings(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const runAction = useCallback(
    async (bookingId: string, action: string) => {
      setBusy(`${action}-${bookingId}`);
      const note = notes[bookingId]?.trim() || undefined;
      try {
        const res = await fetch(`/api/admin/demo-bookings/${bookingId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, note }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.errorCode ? `${data.error} (${data.errorCode})` : data.error || "Action failed.");
        }
        window.alert("Attendance updated");
        setNoteFor(null);
        setNotes((prev) => ({ ...prev, [bookingId]: "" }));
        await loadBookings(false);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "Action failed.");
      } finally {
        setBusy(null);
      }
    },
    [notes, loadBookings],
  );

  const isResolved = (status: string) => status === "ATTENDED" || status === "NO_SHOW" || status === "CANCELLED";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <AdminCrmNav current="/admin/demo-attendance" />
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Free Demo Attendance</h1>
          <p className="mt-1 text-sm text-gray-600">
            Verify demo attendance as a human counsellor/admin. Attendance never confirms admission or verifies payment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="ALL">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Demo batch/date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned / Verified by</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.name || "Unnamed"}</div>
                  <div className="text-xs text-gray-500">{b.phone || ""}{b.email ? ` · ${b.email}` : ""}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{b.course || "—"}</td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{b.preferredDate ? fmtDate(b.preferredDate) : "—"}</div>
                  {b.preferredBatch ? <div className="text-xs text-gray-500">{b.preferredBatch}</div> : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  <div>{b.assignedCounsellor ? `Assigned: ${b.assignedCounsellor.name}` : "Unassigned"}</div>
                  {b.attendanceVerifiedByStaff ? (
                    <div className="text-gray-500">Verified: {b.attendanceVerifiedByStaff.name}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {isResolved(b.status) ? (
                    <div className="text-right text-xs text-gray-500">
                      {b.attendanceNote ? <div className="mb-1 italic">{b.attendanceNote}</div> : null}
                      <span>{STATUS_LABELS[b.status]} on {fmtDate(b.attendedAt || b.noShowAt || b.cancelledAt)}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => runAction(b.id, "MARK_ATTENDED")}
                          disabled={busy !== null}
                          className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ Attended
                        </button>
                        <button
                          onClick={() => runAction(b.id, "MARK_NO_SHOW")}
                          disabled={busy !== null}
                          className="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                        >
                          ✕ No Show
                        </button>
                        <button
                          onClick={() => runAction(b.id, "CANCEL")}
                          disabled={busy !== null}
                          className="rounded bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setNoteFor(noteFor === b.id ? null : b.id)}
                          className="text-xs text-amber-700 underline disabled:opacity-50"
                          disabled={busy !== null}
                        >
                          {noteFor === b.id ? "Hide note" : "+ note"}
                        </button>
                        {noteFor === b.id ? (
                          <>
                            <input
                              value={notes[b.id] ?? ""}
                              onChange={(e) => setNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                              placeholder="Attendance note (optional)"
                              className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => runAction(b.id, "MARK_ATTENDED")}
                              disabled={busy !== null}
                              className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              Apply w/ note
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No demo bookings match this view.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="mt-4 text-center">
          <button
            onClick={() => loadBookings(false)}
            disabled={loading}
            className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      {loading && bookings.length === 0 ? (
        <div className="mt-6 text-center text-sm text-gray-500">Loading…</div>
      ) : null}
    </div>
  );
}
