import pg from "pg";

const options = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Always set SSL for Supabase
};

console.log("PG connection options:", options);

const db = new pg.Client(options);
export default db;
