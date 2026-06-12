import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

const pw = process.env.SUPABASE_DB_PASSWORD || "";
if (!pw) { console.error("SUPABASE_DB_PASSWORD missing"); process.exit(1); }

const ref = "uwincewnltlfdffarvwu";
const host = "aws-0-eu-west-1.pooler.supabase.com";
const user = `postgres.${ref}`;

function mk() {
  return new Client({
    host, port: 5432, user, password: pw, database: "postgres",
    ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000,
  });
}

async function connectWithRetry(maxMs = 80000, gapMs = 10000) {
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < maxMs) {
    attempt++;
    const c = mk();
    try {
      await c.connect();
      await c.query("select 1");
      console.log(`connected on attempt ${attempt}`);
      return c;
    } catch (e) {
      console.log(`attempt ${attempt} failed: ${e.code || ""} ${e.message}`);
      try { await c.end(); } catch {}
      if (e.code !== "28P01") {
        // not a password issue -> stop early
        if (Date.now() - start + gapMs >= maxMs) break;
      }
      await new Promise((r) => setTimeout(r, gapMs));
    }
  }
  return null;
}

const client = await connectWithRetry();
if (!client) {
  console.log("\nRESULT: could not authenticate (password rejected / not synced).");
  process.exit(2);
}

const v = await client.query("select version()");
console.log("server ->", String(v.rows[0].version).slice(0, 50));

const dir = "/home/runner/workspace/supabase/migrations";
const files = [
  "001_initial_schema.sql","002_rls_policies.sql","003_realtime.sql",
  "004_storage.sql","005_functions.sql","006_phase1_expansion.sql",
  "007_phase2_expansion.sql","008_phase3.sql","009_remove_demo_data.sql",
];
for (const f of files) {
  const sql = fs.readFileSync(`${dir}/${f}`, "utf8");
  try { await client.query(sql); console.log("OK   ", f); }
  catch (e) { console.log("FAIL ", f, "->", e.message); }
}
const t = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
console.log("\npublic tables (" + t.rows.length + "):", t.rows.map((r) => r.table_name).join(", "));
await client.end();
console.log("\nDONE");
