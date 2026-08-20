"use client";

import { useCallback, useEffect, useState } from "react";

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
    [filterStatus, filterAssigned, offset, limit],
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
  }, [filterStatus, filterAssigned]);

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

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
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

                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
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
