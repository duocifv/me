import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from 'dotenv';
dotenv.config();

const url = new URL(process.env.DATABASE_URL!);
const pool = mysql.createPool(process.env.DATABASE_URL!); 
export const db = drizzle(pool);

pool.getConnection().then(() => {
  console.log("✅ Connected to DB");
}).catch((err) => {
  console.error("❌ DB Connection Error:", err);
  console.log('🔍 DB config', {
    url
  });
});