-- ============================================================
-- Phase 1 Expansion: Multi-Role ERP + Admin Portal Foundation
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Expand user roles (convert enum to TEXT for flexibility) ─
ALTER TABLE school_users ALTER COLUMN role TYPE TEXT USING role::TEXT;
DROP TYPE IF EXISTS user_role CASCADE;

-- Add new columns to school_users
ALTER TABLE school_users ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE school_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── Expand course status (convert enum to TEXT) ──────────────
-- Drop the RLS policy that references status so the column type can change;
-- it is recreated at the end of this migration against the TEXT column.
DROP POLICY IF EXISTS "anon_read_active_courses" ON school_courses;
ALTER TABLE school_courses ALTER COLUMN status TYPE TEXT USING status::TEXT;
DROP TYPE IF EXISTS course_status CASCADE;
ALTER TABLE school_courses ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 30;
ALTER TABLE school_courses ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';

-- ─── Enrollments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_enrollments (
  id            TEXT        PRIMARY KEY,
  student_id    TEXT        NOT NULL,
  course_id     TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending',
  fee           TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Announcements ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_announcements (
  id            TEXT        PRIMARY KEY,
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  author_id     TEXT        NOT NULL,
  priority      TEXT        NOT NULL DEFAULT 'normal',
  target_roles  JSONB       NOT NULL DEFAULT '["all"]'::jsonb,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Events ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_events (
  id            TEXT        PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  date          TIMESTAMPTZ NOT NULL,
  location      TEXT        NOT NULL DEFAULT '',
  type          TEXT        NOT NULL DEFAULT 'academic',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Payments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_payments (
  id            TEXT        PRIMARY KEY,
  student_id    TEXT        NOT NULL,
  course_id     TEXT        NOT NULL,
  enrollment_id TEXT        NOT NULL DEFAULT '',
  amount        TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending',
  method        TEXT        NOT NULL DEFAULT '',
  reference     TEXT        NOT NULL DEFAULT '',
  due_date      TIMESTAMPTZ,
  paid_at       TIMESTAMPTZ,
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Recreate the course read policy against the now-TEXT column ─
CREATE POLICY "anon_read_active_courses"
  ON school_courses
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');
