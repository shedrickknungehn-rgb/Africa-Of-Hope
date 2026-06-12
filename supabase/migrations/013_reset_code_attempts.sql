-- 013_reset_code_attempts.sql
-- Adds a per-code attempt counter so a 6-digit reset code can be locked out
-- after a handful of wrong guesses (brute-force protection). The Express API
-- increments this column on each incorrect attempt and deletes the row once the
-- limit is reached.

ALTER TABLE password_reset_codes
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
