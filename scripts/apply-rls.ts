import { config } from "dotenv";
import { readFileSync } from "fs";
import { Client } from "pg";

config({ path: ".env.local" });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const sql = readFileSync(new URL("./rls.sql", import.meta.url), "utf8");
  await client.query(sql);
  console.log("RLS policies applied.");
  await client.end();
}

main().catch((e) => {
  console.error("GAGAL:", e.message);
  process.exit(1);
});