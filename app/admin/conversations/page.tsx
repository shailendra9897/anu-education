"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminCrmNav } from "@/components/admin/AdminCrmNav";

type AssignedCounsellor = {
  id: string;
  name: string;
  email: string;
};

type Conversation = {
  id: string;
  source: string;
  status: string;
  phone: string | null;
  sessionId: string | null;
  name: string | null;
  email: string | null;
  leadScore: number | null;
  leadTier: string | null;
  assignedCounsellorId: string | null;
  assignedCounsellor: AssignedCounsellor | null;
  _count: { messages: number };
  createdAt: string;
  updatedAt: string;
  derivedAction: {
    state: "FOLLOW_UP" | "PRIORITY_FOLLOW_UP" | "ADMISSION_ASSISTANCE";
    course: string | null;
    reason: string;
  } | null;
  qualificationStage:
    | "LOST"
    | "ADMISSION_READY"
    | "HIGH_INTENT"
    | "QUALIFIED"
    | "QUALIFYING"
    | "ENGAGED"
    | "NEW"
    | null;
};

type Counsellor = {
  id: string;
  name: string;
  email: string;
};

type ApiResponse = {
  success: boolean;
  conversations: Conversation[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  error?: string;
};

type StaffApiResponse = {
  success: boolean;
  staff: Counsellor[];
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterAssigned, setFilterAssigned] = useState<string>("ALL");
  const [filterAction, setFilterAction] = useState("ALL");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const limit = 50;

  const loadConversations = useCallback(
    async (resetOffset = true) => {
      try {
        setLoading(true);
        setError(null);

        const newOffset = resetOffset ? 0 : offset;
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: newOffset.toString(),
        });

        if (filterStatus !== "ALL") {
          params.set("status", filterStatus);
        }

        if (filterAssigned !== "ALL") {
          params.set("assigned", filterAssigned);
        }

        if (filterAction !== "ALL") {
          params.set("action", filterAction);
        }

        const res = await fetch(`/api/admin/conversations?${params}`, {
          cache: "no-store",
        });

        const data = (await res.json()) as ApiResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Unable to load conversations.");
        }

        if (resetOffset) {
          setConversations(data.conversations);
          setOffset(0);
        } else {
          setConversations((prev) => [...prev, ...data.conversations]);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("[CONVERSATIONS ADMIN]", err);
        setError(
          err instanceof Error ? err.message : "Unable to load conversations.",
        );
      } finally {
        setLoading(false);
      }
    },
    [filterStatus, filterAssigned, filterAction, offset, limit],
  );

  const loadCounsellors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/staff?active=true&role=COUNSELLOR", {
        cache: "no-store",
      });
      const data = (await res.json()) as StaffApiResponse;

      if (res.ok && data.success) {
        setCounsellors(data.staff);
      }
    } catch (err) {
      console.error("[CONVERSATIONS] Failed to load counsellors:", err);
    }
  }, []);

  useEffect(() => {
    loadConversations(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterAssigned, filterAction]);

  useEffect(() => {
    loadCounsellors();
  }, [loadCounsellors]);

  const handleAssign = async (conversationId: string, staffId: string | null) => {
    setAssigningId(conversationId);

    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update assignment.");
      }

      await loadConversations(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Assignment failed.");
    } finally {
      setAssigningId(null);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "HANDED_OFF":
        return "bg-orange-100 text-orange-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // S5-D — read-only derived counsellor action (from the audit-only
  // COUNSELLOR_ACTION event log). Internal admin surface only.
  const actionBadgeLabel: Record<string, string> = {
    FOLLOW_UP: "Follow-up",
    PRIORITY_FOLLOW_UP: "Priority Follow-up",
    ADMISSION_ASSISTANCE: "Admission Assistance",
  };
  const actionBadgeColor: Record<string, string> = {
    FOLLOW_UP: "bg-blue-100 text-blue-800",
    PRIORITY_FOLLOW_UP: "bg-amber-100 text-amber-800",
    ADMISSION_ASSISTANCE: "bg-red-100 text-red-800",
  };
  const actionBadge = (conv: Conversation) => {
    if (!conv.derivedAction) {
      return <span className="text-slate-300">—</span>;
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span
          className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${actionBadgeColor[conv.derivedAction.state] ?? "bg-slate-100 text-slate-600"}`}
        >
          {actionBadgeLabel[conv.derivedAction.state] ?? conv.derivedAction.state}
          {conv.derivedAction.course
            ? ` · ${conv.derivedAction.course}`
            : ""}
        </span>
        {conv.derivedAction.reason ? (
          <span className="max-w-[240px] truncate text-xs text-slate-500" title={conv.derivedAction.reason}>
            {conv.derivedAction.reason}
          </span>
        ) : null}
      </div>
    );
  };

  // LEAD-QUALIFICATION-AGENT-02 — read-only qualification stage badge.
  // Presentation only: derived compute-on-read, never a stored score.
  const stageLabel: Record<string, string> = {
    LOST: "Lost",
    ADMISSION_READY: "Admission ready",
    HIGH_INTENT: "High intent",
    QUALIFIED: "Qualified",
    QUALIFYING: "Qualifying",
    ENGAGED: "Engaged",
    NEW: "New",
  };
  const stageColor: Record<string, string> = {
    LOST: "bg-gray-200 text-gray-800",
    ADMISSION_READY: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
    HIGH_INTENT: "bg-orange-100 text-orange-800 ring-1 ring-orange-300",
    QUALIFIED: "bg-amber-100 text-amber-800",
    QUALIFYING: "bg-blue-100 text-blue-800",
    ENGAGED: "bg-indigo-100 text-indigo-800",
    NEW: "bg-slate-100 text-slate-700",
  };
  const stageBadge = (stage: Conversation["qualificationStage"]) => {
    if (!stage) return <span className="text-slate-300">—</span>;
    return (
      <span
        title="Approximate — derived from lead context and admission state only. Open the conversation for the full qualification."
        className={`inline-flex w-fit whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${stageColor[stage] ?? "bg-slate-100 text-slate-600"}`}
      >
        {stageLabel[stage] ?? stage}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminCrmNav current="/admin/conversations" />
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              ANU Education Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Conversations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View conversations and manage counsellor assignment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadConversations(true)}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="HANDED_OFF">Handed Off</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Assignment
            </label>
            <select
              value={filterAssigned}
              onChange={(e) => setFilterAssigned(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All</option>
              <option value="false">Unassigned</option>
              <option value="true">Assigned</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Counsellor Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="ADMISSION_ASSISTANCE">Admission Assistance</option>
              <option value="PRIORITY_FOLLOW_UP">Priority Follow-up</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="NONE">No Action</option>
            </select>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-4 text-sm text-slate-600">
          Showing {conversations.length} of {total} conversations
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading && conversations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No conversations found.
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Messages</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          Stage
                          <span
                            title="Approximate stage derived from lead context and admission state only — transcript and demo signals are excluded here. Open the conversation for the full qualification."
                            className="rounded bg-slate-200 px-1 text-[10px] font-semibold text-slate-600"
                          >
                            approx
                          </span>
                        </span>
                      </th>
                      <th className="px-4 py-3">Assigned To</th>
                      <th className="px-4 py-3">Updated</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 text-sm">
                            {conv.name || conv.phone || conv.sessionId || "Anonymous"}
                          </div>
                          {conv.email && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {conv.email}
                            </div>
                          )}
                          {conv.phone && conv.name && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {conv.phone}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {conv.source}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(conv.status)}`}
                          >
                            {conv.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {conv._count.messages}
                        </td>

                        <td className="px-4 py-3">
                          {actionBadge(conv)}
                        </td>

                        <td className="px-4 py-3">
                          {stageBadge(conv.qualificationStage)}
                        </td>

                        <td className="px-4 py-3 text-sm">
                          {conv.assignedCounsellor ? (
                            <span className="text-slate-900 font-medium">
                              {conv.assignedCounsellor.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-500">
                          {formatDate(conv.updatedAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1.5">
                            <Link
                              href={`/admin/conversations/${conv.id}`}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              View
                            </Link>
                            {assigningId === conv.id ? (
                              <span className="text-xs text-slate-500">
                                Saving...
                              </span>
                            ) : conv.assignedCounsellorId ? (
                              <button
                                type="button"
                                onClick={() => handleAssign(conv.id, null)}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                Release
                              </button>
                            ) : (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssign(conv.id, e.target.value);
                                  }
                                }}
                                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">Assign...</option>
                                {counsellors.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">
                {conversations.map((conv) => (
                  <div key={conv.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          {conv.name || conv.phone || conv.sessionId || "Anonymous"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {conv.source} &middot; {conv._count.messages} messages
                        </p>
                        {conv.derivedAction && (
                          <div className="mt-1.5">{actionBadge(conv)}</div>
                        )}
                        {conv.qualificationStage && (
                          <div className="mt-1.5">{stageBadge(conv.qualificationStage)}</div>
                        )}
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(conv.status)}`}
                      >
                        {conv.status}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      {conv.assignedCounsellor ? (
                        <p>
                          Assigned:{" "}
                          <strong>{conv.assignedCounsellor.name}</strong>
                        </p>
                      ) : (
                        <p className="text-slate-400">Unassigned</p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                      <Link
                        href={`/admin/conversations/${conv.id}`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        View
                      </Link>
                      {assigningId === conv.id ? (
                        <span className="text-xs text-slate-500">Saving...</span>
                      ) : conv.assignedCounsellorId ? (
                        <button
                          type="button"
                          onClick={() => handleAssign(conv.id, null)}
                          className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                        >
                          Release
                        </button>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(conv.id, e.target.value);
                            }
                          }}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Assign counsellor...</option>
                          {counsellors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                const newOffset = offset + limit;
                setOffset(newOffset);
                loadConversations(false);
              }}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
