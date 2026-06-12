import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const conn = process.env.SUPABASE_DB_URL;
if (!conn) {
  console.error("SUPABASE_DB_URL missing from env");
  process.exit(1);
}

const ROOT = "/home/runner/workspace";
const dir = path.join(ROOT, "supabase/migrations");
const files = [
  "001_initial_schema.sql",
  "002_rls_policies.sql",
  "003_realtime.sql",
  "004_storage.sql",
  "005_functions.sql",
  "006_phase1_expansion.sql",
  "007_phase2_expansion.sql",
  "008_phase3.sql",
  "009_remove_demo_data.sql",
];

const client = new Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const v = await client.query("select version()");
console.log("connected ->", String(v.rows[0].version).slice(0, 50));

for (const f of files) {
  const sql = fs.readFileSync(path.join(dir, f), "utf8");
  try {
    await client.query(sql);
    console.log("OK   ", f);
  } catch (e) {
    console.log("FAIL ", f, "->", e.message);
  }
}

const t = await client.query(
  "select table_name from information_schema.tables where table_schema='public' order by table_name"
);
console.log(
  "\npublic tables (" + t.rows.length + "):",
  t.rows.map((r) => r.table_name).join(", ")
);

await client.end();
