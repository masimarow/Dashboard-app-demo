import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

  console.log("Running migration...");
  await pool.query(sql);
  console.log("Migration complete.");

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});