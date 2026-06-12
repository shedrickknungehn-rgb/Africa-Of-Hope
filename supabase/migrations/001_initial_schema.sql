-- ============================================================
-- Africa of Hope — Supabase Production Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ───────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'assistant', 'student');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('live', 'ended', 'scheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Tables ──────────────────────────────────────────────────

-- School Users (internal portal users — separate from Supabase Auth)
CREATE TABLE IF NOT EXISTS school_users (
  id          SERIAL PRIMARY KEY,
  username    TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL DEFAULT '',
  role        user_role   NOT NULL DEFAULT 'student',
  avatar_url  TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses
CREATE TABLE IF NOT EXISTS school_courses (
  id            TEXT        PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  instructor_id TEXT        NOT NULL DEFAULT '',
  duration      TEXT        NOT NULL DEFAULT '1 month',
  fee           TEXT        NOT NULL DEFAULT '',
  schedule      TEXT        NOT NULL DEFAULT '',
  students      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  materials     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  status        course_status NOT NULL DEFAULT 'active',
  cover_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Live Sessions
CREATE TABLE IF NOT EXISTS school_sessions (
  id            TEXT          PRIMARY KEY,
  course_id     TEXT          NOT NULL DEFAULT '',
  course_title  TEXT          NOT NULL DEFAULT '',
  instructor_id TEXT          NOT NULL DEFAULT '',
  room_id       TEXT          NOT NULL,
  title         TEXT          NOT NULL DEFAULT 'Live Class',
  started_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  status        session_status NOT NULL DEFAULT 'live',
  participant_count INT       NOT NULL DEFAULT 0
);

-- Contact Form Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT,
  message    TEXT        NOT NULL,
  status     TEXT        NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donation Records (for tracking purposes)
CREATE TABLE IF NOT EXISTS donations (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name      TEXT,
  donor_email     TEXT,
  amount_usd      NUMERIC(10,2),
  currency        TEXT        NOT NULL DEFAULT 'USD',
  payment_ref     TEXT,
  payment_method  TEXT,
  message         TEXT,
  is_anonymous    BOOLEAN     NOT NULL DEFAULT FALSE,
  status          TEXT        NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Announcements (for student dashboard ticker / admin notices)
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  audience   TEXT        NOT NULL DEFAULT 'all',
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by INT         REFERENCES school_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_school_users_username   ON school_users(username);
CREATE INDEX IF NOT EXISTS idx_school_users_role       ON school_users(role);
CREATE INDEX IF NOT EXISTS idx_school_courses_status   ON school_courses(status);
CREATE INDEX IF NOT EXISTS idx_school_courses_created  ON school_courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_school_sessions_status  ON school_sessions(status);
CREATE INDEX IF NOT EXISTS idx_school_sessions_started ON school_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status          ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_announcements_active    ON announcements(is_active, expires_at);

-- ─── Updated-at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_school_users_updated ON school_users;
CREATE TRIGGER trg_school_users_updated
  BEFORE UPDATE ON school_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_school_courses_updated ON school_courses;
CREATE TRIGGER trg_school_courses_updated
  BEFORE UPDATE ON school_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
