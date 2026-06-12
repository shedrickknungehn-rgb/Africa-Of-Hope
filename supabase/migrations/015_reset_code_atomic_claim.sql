-- 015_reset_code_atomic_claim.sql
-- Make reset-code verification + attempt counting ATOMIC to close a
-- brute-force bypass: the previous read-then-write increment (SELECT attempts
-- -> attempts+1 -> UPDATE) let concurrent wrong-code requests all read the same
-- value and overwrite each other, so far more than the limit of guesses could
-- slip through before lockout.
--
-- This function locks the code row (SELECT ... FOR UPDATE) so concurrent
-- attempts serialize, then atomically: expires/invalidates, locks out at the
-- limit, accepts a correct code, or increments on a wrong code. The Express API
-- calls it via RPC and acts on the returned status.
--
-- Returned status values:
--   'invalid' — no code on file or it has expired (row deleted if it existed)
--   'locked'  — attempt limit reached; row deleted, caller should 429
--   'ok'      — code matches; row left in place for the caller to delete after
--               the password is updated; out_user_id is set
--   'wrong'   — incorrect code; attempts incremented; out_remaining is set

CREATE OR REPLACE FUNCTION claim_password_reset_attempt(
  p_username_key TEXT,
  p_code         TEXT,
  p_max          INTEGER
)
RETURNS TABLE (status TEXT, out_user_id INTEGER, out_remaining INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  r            password_reset_codes%ROWTYPE;
  new_attempts INTEGER;
BEGIN
  SELECT * INTO r
  FROM password_reset_codes
  WHERE username_key = p_username_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'invalid'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  IF r.expires_at < NOW() THEN
    DELETE FROM password_reset_codes WHERE username_key = p_username_key;
    RETURN QUERY SELECT 'invalid'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  IF r.attempts >= p_max THEN
    DELETE FROM password_reset_codes WHERE username_key = p_username_key;
    RETURN QUERY SELECT 'locked'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  IF r.code = p_code THEN
    RETURN QUERY SELECT 'ok'::TEXT, r.user_id, NULL::INTEGER;
    RETURN;
  END IF;

  new_attempts := r.attempts + 1;
  IF new_attempts >= p_max THEN
    DELETE FROM password_reset_codes WHERE username_key = p_username_key;
    RETURN QUERY SELECT 'locked'::TEXT, NULL::INTEGER, NULL::INTEGER;
    RETURN;
  END IF;

  UPDATE password_reset_codes SET attempts = new_attempts WHERE username_key = p_username_key;
  RETURN QUERY SELECT 'wrong'::TEXT, NULL::INTEGER, (p_max - new_attempts);
END;
$$;
