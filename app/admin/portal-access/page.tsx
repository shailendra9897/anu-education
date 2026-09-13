"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { AdminCrmNav } from "@/components/admin/AdminCrmNav";

type PortalStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

type PortalRequest = {
  id: string;
  conversationId?: string | null;
  demoBookingId?: string | null;
  studentName: string;
  email: string;
  phone: string;
  course?: string | null;
  status: PortalStatus;
  attemptCount: number;
  lastAttemptAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  errorMessage?: string | null;
  processedBy?: string | null;
  portalStudentId?: string | null;
  portalLogin?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ManualSetup = {
  registrationUrl: string;
  studentName: string;
  email: string;
  phone: string;
  course: string | null;
  status: PortalStatus;
};

type ApiResponse = {
  success: boolean;
  count: number;
  requests: PortalRequest[];
  registrationUrl?: string;
  error?: string;
};

type ActionResponse = {
  success: boolean;
  error?: string;
  request?: PortalRequest;
  setup?: ManualSetup;
};

const STATUS_OPTIONS: Array<"ALL" | PortalStatus> = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: PortalStatus }) {
  const styles: Record<PortalStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/**
 * Manual portal provisioning panel.
 *
 * Shows ONLY existing CRM data (name / email / phone / course) plus the
 * registration URL. It never displays or receives the portal password.
 * Opening the registration page is deliberately separate from marking
 * the request COMPLETED — the two are distinct, explicit admin actions.
 */
function ManualSetupPanel({
  setup,
  onComplete,
  onClose,
}: {
  setup: ManualSetup;
  onComplete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-teal-900">
          Manual Portal Setup Required
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={setup.registrationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"
          >
            Open Registration Page
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-500">Student:</span>{" "}
          {setup.studentName}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Email:</span>{" "}
          {setup.email}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Phone:</span>{" "}
          {setup.phone}
        </p>
        <p>
          <span className="font-semibold text-slate-500">Course:</span>{" "}
          {setup.course || "—"}
        </p>
      </div>

      <p className="mt-2 text-xs text-teal-800">
        Registration URL: {setup.registrationUrl}. Register the student on
        the portal, verify the account was created successfully, then mark
        the request completed. Opening this page does NOT complete the
        request.
      </p>

      <button
        type="button"
        onClick={onComplete}
        className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
      >
        Mark Portal Completed
      </button>
    </div>
  );
}

export default function PortalAccessPage() {
  const [requests, setRequests] = useState<PortalRequest[]>([]);
  const [manualSetup, setManualSetup] = useState<Record<string, ManualSetup>>(
    {},
  );
  const [selectedStatus, setSelectedStatus] =
    useState<"ALL" | PortalStatus>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query =
        selectedStatus === "ALL"
          ? ""
          : `?status=${selectedStatus}`;

      const response = await fetch(
        `/api/admin/portal-access${query}`,
        {
          cache: "no-store",
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load portal requests.",
        );
      }

      setRequests(data.requests);
    } catch (err) {
      console.error("[PORTAL ADMIN]", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load portal requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const performAction = async (
    id: string,
    action: "PROCESS" | "COMPLETE" | "FAIL" | "RETRY",
  ) => {
    try {
      const body: {
        action: "PROCESS" | "COMPLETE" | "FAIL" | "RETRY";
        errorMessage?: string;
        portalStudentId?: string;
        portalLogin?: string;
        notes?: string;
      } = { action };

      if (action === "FAIL") {
        const errorMessage = window.prompt(
          "Enter the failure reason:",
        );

        if (!errorMessage?.trim()) {
          return;
        }

        body.errorMessage = errorMessage.trim();
      }

      if (action === "COMPLETE") {
        const portalStudentId = window.prompt(
          "Portal Student ID (optional):",
        );

        const portalLogin = window.prompt(
          "Portal Login / Username (optional):",
        );

        body.portalStudentId =
          portalStudentId?.trim() || undefined;

        body.portalLogin =
          portalLogin?.trim() || undefined;
      }

      const response = await fetch(
        `/api/admin/portal-access/${id}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to update request.",
        );
      }

      setManualSetup((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== id),
        ) as Record<string, ManualSetup>,
      );
      await loadRequests();
    } catch (error) {
      console.error("[PORTAL ACTION]", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update portal request.",
      );
    }
  };

  /**
   * Manual provisioning support (read-only): fetch the registration URL
   * + student details, open the registration page in a new tab, and show
   * the inline panel. Does NOT change the request status.
   */
  const openManualSetup = async (request: PortalRequest) => {
    try {
      const response = await fetch(
        `/api/admin/portal-access/${request.id}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "MANUAL_SETUP" }),
        },
      );

      const data = (await response.json()) as ActionResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to prepare manual setup.",
        );
      }

      if (!data.setup) {
        throw new Error("Manual setup details are missing.");
      }

      const setup = data.setup;

      setManualSetup((prev) => ({
        ...prev,
        [request.id]: setup,
      }));

      if (setup.registrationUrl) {
        window.open(
          setup.registrationUrl,
          "_blank",
          "noopener,noreferrer",
        );
      }
    } catch (error) {
      console.error("[PORTAL MANUAL SETUP]", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to prepare manual setup.",
      );
    }
  };

  const canOpenManualSetup = (status: PortalStatus) =>
    status === "PENDING" || status === "PROCESSING" || status === "FAILED";

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    processing: requests.filter(
      (r) => r.status === "PROCESSING",
    ).length,
    completed: requests.filter(
      (r) => r.status === "COMPLETED",
    ).length,
    failed: requests.filter((r) => r.status === "FAILED").length,
  };

  const actionButtons = (request: PortalRequest) => (
    <>
      {request.status === "PENDING" && (
        <button
          type="button"
          onClick={() => performAction(request.id, "PROCESS")}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          Process
        </button>
      )}

      {request.status === "PROCESSING" && (
        <>
          <button
            type="button"
            onClick={() => performAction(request.id, "COMPLETE")}
            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            Complete
          </button>

          <button
            type="button"
            onClick={() => performAction(request.id, "FAIL")}
            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Fail
          </button>
        </>
      )}

      {request.status === "FAILED" && (
        <button
          type="button"
          onClick={() => performAction(request.id, "RETRY")}
          className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-700"
        >
          Retry
        </button>
      )}

      {canOpenManualSetup(request.status) && (
        <button
          type="button"
          onClick={() => openManualSetup(request)}
          className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          Manual Setup
        </button>
      )}
    </>
  );

  const manualPanel = (request: PortalRequest) => {
    const setup = manualSetup[request.id];
    if (!setup) return null;

    return (
      <ManualSetupPanel
        setup={setup}
        onClose={() =>
          setManualSetup((prev) =>
            Object.fromEntries(
              Object.entries(prev).filter(
                ([key]) => key !== request.id,
              ),
            ) as Record<string, ManualSetup>,
          )
        }
        onComplete={() => performAction(request.id, "COMPLETE")}
      />
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <AdminCrmNav current="/admin/portal-access" />
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              ANU Education Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Portal Access Queue
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage student portal access requests. Use{" "}
              <strong>Manual Setup</strong> when automatic provisioning is
              unavailable or failed.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRequests}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <SummaryCard
            label="All"
            value={counts.all}
            active={selectedStatus === "ALL"}
            onClick={() => setSelectedStatus("ALL")}
          />

          <SummaryCard
            label="Pending"
            value={counts.pending}
            active={selectedStatus === "PENDING"}
            onClick={() => setSelectedStatus("PENDING")}
          />

          <SummaryCard
            label="Processing"
            value={counts.processing}
            active={selectedStatus === "PROCESSING"}
            onClick={() => setSelectedStatus("PROCESSING")}
          />

          <SummaryCard
            label="Completed"
            value={counts.completed}
            active={selectedStatus === "COMPLETED"}
            onClick={() => setSelectedStatus("COMPLETED")}
          />

          <SummaryCard
            label="Failed"
            value={counts.failed}
            active={selectedStatus === "FAILED"}
            onClick={() => setSelectedStatus("FAILED")}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Portal Requests
            </h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading portal requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No portal access requests found.
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Course</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Attempts</th>
                      <th className="px-5 py-3">Created</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {requests.map((request) => (
                      <Fragment key={request.id}>
                        <tr className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">
                              {request.studentName}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              ID: {request.id}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {request.course || "—"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm text-slate-700">
                              {request.email}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {request.phone}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={request.status} />
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {request.attemptCount}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(request.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              {actionButtons(request)}
                            </div>
                          </td>
                        </tr>

                        {manualSetup[request.id] && (
                          <tr>
                            <td
                              colSpan={7}
                              className="bg-teal-50/50 px-5 py-4"
                            >
                              {manualPanel(request)}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">
                {requests.map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {request.studentName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {request.course || "No course"}
                        </p>
                      </div>

                      <StatusBadge status={request.status} />
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <p>{request.email}</p>
                      <p>{request.phone}</p>
                      <p>
                        Attempts:{" "}
                        <strong>{request.attemptCount}</strong>
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>

                    {request.errorMessage && (
                      <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                        {request.errorMessage}
                      </div>
                    )}

                    {/* MOBILE ACTIONS */}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      {actionButtons(request)}
                    </div>

                    {manualSetup[request.id] && (
                      <div className="mt-3">{manualPanel(request)}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </div>
    </button>
  );
}