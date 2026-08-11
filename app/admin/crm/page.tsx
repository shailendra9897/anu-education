'use client';

import { useEffect, useState } from "react";

export default function CRMPage() {

  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/crm")
      .then(res => res.json())
      .then(data => setLeads(data));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>ANU Education CRM</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Phone</th>
            <th>Name</th>
            <th>Message</th>
            <th>Source</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead, index) => (
            <tr key={index}>
              <td>{lead.Date}</td>
              <td>
                <a href={`https://wa.me/${lead.Phone}`} target="_blank">
                  {lead.Phone}
                </a>
              </td>
              <td>{lead.Name}</td>
              <td>{lead.Message}</td>
              <td>{lead.Source}</td>
              <td>{lead.Status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}