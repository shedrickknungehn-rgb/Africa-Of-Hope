import pg from "pg";

const { Pool } = pg;

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
  ssl: process.env["NODE_ENV"] === "production" ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(sql, params);
  } finally {
    client.release();
  }
}
