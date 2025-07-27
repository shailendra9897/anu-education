import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Create DB connection
const db = await mysql.createConnection({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
});

export async function POST(req: Request) {
  const { name, email, phone, message, source = "contact" } = await req.json();

  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await db.execute(
      "INSERT INTO leads (name, email, phone, message, source) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, message, source]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Insert Error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}