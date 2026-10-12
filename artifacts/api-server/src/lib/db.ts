import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

const configuredRequestTimeoutMs = Number(
  process.env["SUPABASE_REQUEST_TIMEOUT_MS"],
);
const requestTimeoutMs =
  Number.isFinite(configuredRequestTimeoutMs) && configuredRequestTimeoutMs > 0
    ? configuredRequestTimeoutMs
    : 5_000;

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;

  try {
    return await fetch(input, { ...init, signal });
  } finally {
    clearTimeout(timeout);
  }
};

export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !key) {
    throw new Error(
      "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
    );
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  });

  return _client;
}

// Tests inject an in-memory Supabase-compatible client so route authorization
// can be exercised without a database connection.
export function setSupabaseClientForTest(client: SupabaseClient | null): void {
  _client = client;
}

export { getSupabase as supabase };
