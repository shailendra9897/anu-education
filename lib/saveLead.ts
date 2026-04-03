import { db } from "@/lib/db";

export async function saveLead(
  phone: string,
  templateName: string,
  message: string,
  source: string,
  status: string
) {
  try {
    await db.query(
      `INSERT INTO whatsapp_leads 
      (phone, template_name, message, source, status) 
      VALUES ($1, $2, $3, $4, $5)`,
      [phone, templateName, message, source, status]
    );
  } catch (error) {
    console.error("DB Save Error:", error);
  }
}