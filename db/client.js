import "dotenv/config";
import pg from "pg";

const options = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always set SSL for Supabase
};

const db = new pg.Client(options);
export default db;
