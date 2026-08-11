import { db } from "@/lib/db";

export async function saveLead(
  phone: string,
  templateName: string,
  message: string,
  source: string,
  status: string
) {
  try {
    const res = await db.query(
      `INSERT INTO whatsapp_leads 
      (phone, template_name, message, source, status) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [phone, templateName, message, source, status]
    );

    console.log("✅ DB INSERTED:", res.rows[0]);

  } catch (error: any) {
    console.error("❌ DB ERROR FULL:", error);
  }
}