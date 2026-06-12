import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Client } = pg;

const raw = process.env.SUPABASE_DB_URL;
if (!raw) {
  console.error("SUPABASE_DB_URL missing from env");
  process.exit(1);
}

const u = new URL(raw);
// host is db.<ref>.supabase.co  OR already a pooler host
let ref = null;
const m = u.hostname.match(/^db\.([a-z0-9]+)\.supabase\.co$/i);
if (m) ref = m[1];
else if (u.username.startsWith("postgres.")) ref = u.username.split(".")[1];

const password = process.env.SUPABASE_DB_PASSWORD || u.password;
const database = (u.pathname || "/postgres").replace(/^\//, "") || "postgres";

function makeClient(host, user) {
  return new Client({
    host,
    port: 5432,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
  });
}

async function tryConn(host, user) {
  const c = makeClient(host, user);
  try {
    await c.connect();
    await c.query("select 1");
    await c.end();
    return { host, user, ok: true };
  } catch (e) {
    try { await c.end(); } catch {}
    return { host, user, ok: false, err: e.code || e.message };
  }
}

async function findWorking() {
  // If the provided URL is already a pooler host, just use it.
  if (/pooler\.supabase\.com$/i.test(u.hostname)) {
    return { host: u.hostname, user: u.username };
  }
  if (!ref) throw new Error("Could not extract project ref from connection string");

  const regions = [
    "us-east-1","us-east-2","us-west-1","us-west-2",
    "ca-central-1","sa-east-1",
    "eu-west-1","eu-west-2","eu-west-3",
    "eu-central-1","eu-central-2","eu-north-1",
    "ap-south-1","ap-southeast-1","ap-southeast-2",
    "ap-northeast-1","ap-northeast-2","ap-east-1",
  ];
  const prefixes = ["aws-0", "aws-1"];
  const user = `postgres.${ref}`;
  const candidates = [];
  for (const p of prefixes)
    for (const r of regions)
      candidates.push(`${p}-${r}.pooler.supabase.com`);

  console.log(`probing ${candidates.length} pooler endpoints for tenant ${ref}...`);
  const results = await Promise.allSettled(candidates.map((h) => tryConn(h, user)));
  const hit = results.find((x) => x.status === "fulfilled" && x.value.ok);
  if (!hit) {
    const errs = {};
    for (const x of results) {
      if (x.status === "fulfilled" && !x.value.ok) {
        errs[x.value.err] = (errs[x.value.err] || 0) + 1;
      }
    }
    console.log("no working pooler found. error summary:", JSON.stringify(errs));
    throw new Error("Could not auto-detect pooler region");
  }
  return { host: hit.value.host, user: hit.value.user };
}

const { host, user } = await findWorking();
console.log("USING pooler host:", host, "user:", user);

const client = makeClient(host, user);
client.connectionTimeoutMillis = 15000;
delete client.query_timeout;
await client.connect();
const v = await client.query("select version()");
console.log("connected ->", String(v.rows[0].version).slice(0, 50));

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
console.log("\npublic tables (" + t.rows.length + "):", t.rows.map((r) => r.table_name).join(", "));

await client.end();
console.log("\nDONE. Working pooler host:", host);
