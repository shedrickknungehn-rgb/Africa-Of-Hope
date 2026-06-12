-- ============================================================
-- Africa of Hope — Password reset codes
-- Persists one-time forgot-password codes so the flow works across
-- stateless serverless (Vercel function) invocations instead of relying
-- on in-process memory. Access is locked to the service role; the Express
-- API reads/writes it with the service_role key (which bypasses RLS).
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_codes (
  username_key TEXT        PRIMARY KEY,        -- lowercased username
  user_id      INTEGER     NOT NULL REFERENCES school_users(id) ON DELETE CASCADE,
  code         TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at
  ON password_reset_codes (expires_at);

ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Only the service role (backend API) can touch reset codes.
CREATE POLICY "service_role_only_reset_codes"
  ON password_reset_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
