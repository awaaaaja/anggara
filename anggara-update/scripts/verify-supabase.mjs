// Local-only verification: proves the Supabase client connects to the same
// project as the legacy Next.js app and can read an existing table.
// Uses the service-role key to bypass RLS so a real row is returned — this is a
// server-side script and the key is NEVER shipped to the browser.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env");

function loadEnv() {
  const raw = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  // Pick a table that exists in the legacy schema; ormawa is seeded.
  const tables = ["ormawa", "profiles", "proposals"];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.error(`Query failed on "${table}":`, error.message);
      continue;
    }
    console.log(`OK  table="${table}"  rows_returned=${data.length}`);
    if (data.length > 0) {
      console.log("Sample row:", JSON.stringify(data[0]));
      console.log("VERIFY_SUCCESS: fetched 1 row from existing table.");
      return;
    }
  }
  console.log("VERIFY_DONE: connection succeeded but no rows found in sampled tables.");
}

main().catch((err) => {
  console.error("VERIFY_FAILED:", err);
  process.exit(1);
});
