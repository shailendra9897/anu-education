// lib/db.ts
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',         // ✅ or your hosting DB hostname (check in OVIPanel)
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'your_db_name',
});