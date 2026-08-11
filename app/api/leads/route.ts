import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");

    let query = `SELECT * FROM whatsapp_leads WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== "all") {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      query += ` AND (phone ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (fromDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }
    if (toDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(toDate + " 23:59:59");
      paramIndex++;
    }

    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as total");
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || "0");

    query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return NextResponse.json({
      leads: result.rows,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error("Leads API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}