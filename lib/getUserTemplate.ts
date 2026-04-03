import { db } from "@/lib/db";

export async function getUserTemplate(phone: string) {
  const res = await db.query(
    `SELECT template_name 
     FROM whatsapp_leads 
     WHERE phone = $1 
     ORDER BY id DESC LIMIT 1`,
    [phone]
  );

  return res.rows[0]?.template_name || null;
}