"use client";

import { useEffect, useState, useCallback } from "react";

type Lead = {
  id: number;
  phone: string;
  template_name: string;
  message: string;
  source: string;
  status: string;
  created_at: string;
};

type ApiResponse = {
  leads: Lead[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const limit = 50;

  const fetchLeads = useCallback(async (resetOffset = true) => {
  setLoading(true);
  const newOffset = resetOffset ? 0 : offset;
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: newOffset.toString(),
    status: filterStatus,
    ...(search && { search }),
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  });

  try {
    const res = await fetch(`/api/leads?${params}`);
    
    // 👇 Check if response is OK and content-type is JSON
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API error:", res.status, errorText);
      throw new Error(`API returned ${res.status}`);
    }
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Non-JSON response:", text);
      throw new Error("Expected JSON but got " + contentType);
    }
    
    const data: ApiResponse = await res.json();

    if (resetOffset) {
      setLeads(data.leads);
      setOffset(0);
    } else {
      setLeads((prev) => [...prev, ...data.leads]);
    }
    setTotal(data.total);
    setHasMore(data.hasMore);
  } catch (error) {
    console.error("Fetch leads failed:", error);
    alert("Failed to load leads. Check console for details.");
  } finally {
    setLoading(false);
  }
}, [filterStatus, search, fromDate, toDate, offset, limit]);
  useEffect(() => {
    fetchLeads(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, search, fromDate, toDate]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchLeads(false);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Phone", "Template", "Message", "Source", "Status", "Date"];
    const rows = leads.map((lead) => [
      lead.id,
      lead.phone,
      lead.template_name,
      lead.message,
      lead.source,
      lead.status,
      new Date(lead.created_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Delete this lead?")) return;

    const res = await fetch("/api/leads/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      // Refresh the current view (preserve filters)
      fetchLeads(true);
    } else {
      alert("Failed to delete lead.");
    }
  };

  const statusColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-800",
    Interested: "bg-green-100 text-green-800",
    Converted: "bg-purple-100 text-purple-800",
    Sent: "bg-gray-100 text-gray-800",
    Unsubscribed: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 WhatsApp Leads</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select
            className="border rounded px-3 py-1"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="New">New</option>
            <option value="Interested">Interested</option>
            <option value="Converted">Converted</option>
            <option value="Sent">Sent</option>
            <option value="Unsubscribed">Unsubscribed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Search (Phone/Message)</label>
          <input
            type="text"
            placeholder="Search..."
            className="border rounded px-3 py-1 w-48"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">From Date</label>
          <input
            type="date"
            className="border rounded px-3 py-1"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">To Date</label>
          <input
            type="date"
            className="border rounded px-3 py-1"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          📎 Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {leads.length} of {total} leads
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Template</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{lead.phone}</td>
                <td className="p-2 max-w-xs truncate">{lead.template_name || "-"}</td>
                <td className="p-2 max-w-md truncate">{lead.message}</td>
                <td className="p-2">{lead.source}</td>
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[lead.status] || "bg-gray-100"}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-2 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}