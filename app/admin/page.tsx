import mysql from "mysql2/promise";

export const metadata = {
  title: "Admin - Leads",
};

async function getLeads() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  const [rows] = await db.execute("SELECT * FROM leads ORDER BY id DESC");
  return rows as any[];
}

export default async function AdminPage() {
  const leads = await getLeads();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submitted Leads</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Message</th>
            <th className="border px-2 py-1">Source</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="border px-2 py-1">{lead.id}</td>
              <td className="border px-2 py-1">{lead.name}</td>
              <td className="border px-2 py-1">{lead.email}</td>
              <td className="border px-2 py-1">{lead.phone}</td>
              <td className="border px-2 py-1">{lead.message}</td>
              <td className="border px-2 py-1">{lead.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}