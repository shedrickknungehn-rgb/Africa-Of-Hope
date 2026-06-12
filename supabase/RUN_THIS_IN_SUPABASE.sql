-- ============================================================
-- Africa of Hope — Complete School Database Setup
-- Paste this ENTIRE file into Supabase → SQL Editor → New Query → Run
-- Safe to run on a fresh project. Includes demo-data cleanup (009).
-- ============================================================


-- ============================================================
-- migrations/001_initial_schema.sql
-- ============================================================
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


-- ============================================================
-- migrations/002_rls_policies.sql
-- ============================================================
-- ============================================================
-- Africa of Hope — Row Level Security (RLS) Policies
-- These protect tables when accessed via Supabase client directly
-- The Express API bypasses RLS using the service_role key
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE school_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_courses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;

-- ─── School Users ────────────────────────────────────────────
-- Only the service role (backend API) can read/write school_users
-- This prevents direct client access to passwords

CREATE POLICY "service_role_only_users"
  ON school_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── School Courses ──────────────────────────────────────────
-- Authenticated users (via Supabase Auth) can read active courses
-- Only service_role can write

CREATE POLICY "anon_read_active_courses"
  ON school_courses
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "service_role_write_courses"
  ON school_courses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── School Sessions ─────────────────────────────────────────
-- Authenticated users can read live sessions
-- Only service_role can write

CREATE POLICY "anon_read_live_sessions"
  ON school_sessions
  FOR SELECT
  TO anon, authenticated
  USING (status = 'live');

CREATE POLICY "service_role_write_sessions"
  ON school_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── Contact Submissions ─────────────────────────────────────
-- Anyone can insert; only service_role can read/update/delete

CREATE POLICY "anon_insert_contact"
  ON contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_manage_contact"
  ON contact_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── Donations ───────────────────────────────────────────────
-- Anyone can insert; only service_role can read full list

CREATE POLICY "anon_insert_donation"
  ON donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "service_role_manage_donations"
  ON donations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── Announcements ───────────────────────────────────────────
-- Anyone can read active, non-expired announcements

CREATE POLICY "anon_read_active_announcements"
  ON announcements
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "service_role_manage_announcements"
  ON announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- migrations/003_realtime.sql
-- ============================================================
-- ============================================================
-- Africa of Hope — Realtime Subscriptions
-- Enables live updates for the School Portal
-- ============================================================

-- Add tables to Supabase Realtime publication
-- This allows the frontend to subscribe to live changes

ALTER PUBLICATION supabase_realtime ADD TABLE school_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- Note: school_users is intentionally excluded from realtime
-- to avoid leaking user/password data via subscriptions.
-- The backend API handles user data exclusively.

-- ─── Realtime Filters (applied in frontend code) ─────────────
-- Subscribe to live sessions:
--   supabase
--     .channel('live-sessions')
--     .on('postgres_changes', {
--       event: '*',
--       schema: 'public',
--       table: 'school_sessions',
--       filter: 'status=eq.live'
--     }, handler)
--     .subscribe()
--
-- Subscribe to announcements:
--   supabase
--     .channel('announcements')
--     .on('postgres_changes', {
--       event: 'INSERT',
--       schema: 'public',
--       table: 'announcements',
--       filter: 'is_active=eq.true'
--     }, handler)
--     .subscribe()


-- ============================================================
-- migrations/004_storage.sql
-- ============================================================
-- ============================================================
-- Africa of Hope — Storage Buckets
-- Run AFTER enabling Storage in your Supabase project
-- Supabase Dashboard → Storage → Create bucket
-- OR run this SQL directly
-- ============================================================

-- ─── Buckets ─────────────────────────────────────────────────

-- Course materials (PDFs, slides, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  false,
  52428800,  -- 50 MB
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Media / gallery images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-gallery',
  'media-gallery',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- User avatars (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies ────────────────────────────────────

-- course-materials: only authenticated users can read; only service_role can write
CREATE POLICY "auth_read_materials"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'course-materials');

CREATE POLICY "service_write_materials"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "service_delete_materials"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'course-materials');

-- media-gallery: public read; service_role can manage
CREATE POLICY "public_read_gallery"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media-gallery');

CREATE POLICY "service_write_gallery"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'media-gallery')
  WITH CHECK (bucket_id = 'media-gallery');

-- avatars: public read; owner can upload their own
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "authenticated_upload_avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- migrations/005_functions.sql
-- ============================================================
-- ============================================================
-- Africa of Hope — Database Functions & Stored Procedures
-- ============================================================

-- ─── Get Dashboard Stats (Admin) ─────────────────────────────
CREATE OR REPLACE FUNCTION get_school_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users',      (SELECT COUNT(*) FROM school_users),
    'total_students',   (SELECT COUNT(*) FROM school_users WHERE role = 'student'),
    'total_instructors',(SELECT COUNT(*) FROM school_users WHERE role = 'instructor'),
    'active_courses',   (SELECT COUNT(*) FROM school_courses WHERE status = 'active'),
    'live_sessions',    (SELECT COUNT(*) FROM school_sessions WHERE status = 'live'),
    'total_sessions',   (SELECT COUNT(*) FROM school_sessions)
  ) INTO result;
  RETURN result;
END;
$$;

-- ─── Enroll Student in Course ────────────────────────────────
CREATE OR REPLACE FUNCTION enroll_student(p_course_id TEXT, p_student_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_students JSONB;
BEGIN
  SELECT students INTO current_students
  FROM school_courses WHERE id = p_course_id;

  IF current_students IS NULL THEN
    RETURN FALSE;
  END IF;

  IF current_students @> to_jsonb(p_student_id) THEN
    RETURN FALSE;
  END IF;

  UPDATE school_courses
  SET students = current_students || to_jsonb(p_student_id),
      updated_at = NOW()
  WHERE id = p_course_id;

  RETURN TRUE;
END;
$$;

-- ─── Unenroll Student from Course ────────────────────────────
CREATE OR REPLACE FUNCTION unenroll_student(p_course_id TEXT, p_student_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE school_courses
  SET students = (
    SELECT jsonb_agg(s)
    FROM jsonb_array_elements(students) AS s
    WHERE s #>> '{}' != p_student_id
  ),
  updated_at = NOW()
  WHERE id = p_course_id;

  RETURN FOUND;
END;
$$;

-- ─── Clean Up Ended Sessions ─────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_old_sessions(older_than_days INT DEFAULT 30)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM school_sessions
  WHERE status = 'ended'
    AND started_at < NOW() - (older_than_days || ' days')::INTERVAL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- ─── Get Active Announcements ────────────────────────────────
CREATE OR REPLACE FUNCTION get_active_announcements(p_audience TEXT DEFAULT 'all')
RETURNS SETOF announcements LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM announcements
  WHERE is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (audience = 'all' OR audience = p_audience)
  ORDER BY created_at DESC;
$$;


-- ============================================================
-- migrations/006_phase1_expansion.sql
-- ============================================================
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

-- ─── Seed demo users for all 9 roles ─────────────────────────
INSERT INTO school_users (username, password, name, email, role) VALUES
  ('superadmin',   'SuperAdmin2026',   'Super Administrator',    'superadmin@aoh.edu.lr',   'super_admin'),
  ('director',     'Director2026',     'Dr. James Kollie',       'director@aoh.edu.lr',     'director'),
  ('registrar',    'Registrar2026',    'Mary Johnson',           'registrar@aoh.edu.lr',    'registrar'),
  ('coordinator',  'Coordinator2026',  'Prof. Samuel Doe',       'coordinator@aoh.edu.lr',  'academic_coordinator'),
  ('finance',      'Finance2026',      'Alice Freeman',          'finance@aoh.edu.lr',      'finance_officer'),
  ('hr',           'HR2026',           'Robert Brown',           'hr@aoh.edu.lr',           'hr_officer'),
  ('alumni1',      'Alumni2026',       'Grace Wesseh',           'grace@alumni.aoh.edu.lr', 'alumni')
ON CONFLICT (username) DO NOTHING;


-- ============================================================
-- migrations/007_phase2_expansion.sql
-- ============================================================
-- ============================================================
-- Phase 2 Expansion: Academic Depth (Attendance + Grades) + HR
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Attendance ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_attendance (
  id            TEXT        PRIMARY KEY,
  student_id    TEXT        NOT NULL,
  course_id     TEXT        NOT NULL,
  session_date  TIMESTAMPTZ NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'present',
  notes         TEXT        NOT NULL DEFAULT '',
  recorded_by   TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON school_attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course  ON school_attendance (course_id);

-- ─── Grades ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_grades (
  id            TEXT        PRIMARY KEY,
  student_id    TEXT        NOT NULL,
  course_id     TEXT        NOT NULL,
  assessment    TEXT        NOT NULL,
  score         TEXT        NOT NULL DEFAULT '0',
  max_score     TEXT        NOT NULL DEFAULT '100',
  weight        TEXT        NOT NULL DEFAULT '',
  grade         TEXT        NOT NULL DEFAULT '',
  comment       TEXT        NOT NULL DEFAULT '',
  recorded_by   TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_grades_student ON school_grades (student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course  ON school_grades (course_id);

-- ─── Staff Records (HR) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_staff_records (
  id                 TEXT        PRIMARY KEY,
  user_id            TEXT        NOT NULL,
  position           TEXT        NOT NULL DEFAULT '',
  department         TEXT        NOT NULL DEFAULT '',
  employment_type    TEXT        NOT NULL DEFAULT 'full_time',
  hire_date          TIMESTAMPTZ,
  salary             TEXT        NOT NULL DEFAULT '',
  status             TEXT        NOT NULL DEFAULT 'active',
  emergency_contact  TEXT        NOT NULL DEFAULT '',
  notes              TEXT        NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_staff_user ON school_staff_records (user_id);

-- ─── Leave Requests (HR) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_leave_requests (
  id            TEXT        PRIMARY KEY,
  user_id       TEXT        NOT NULL,
  type          TEXT        NOT NULL DEFAULT 'annual',
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  reason        TEXT        NOT NULL DEFAULT '',
  status        TEXT        NOT NULL DEFAULT 'pending',
  reviewed_by   TEXT        NOT NULL DEFAULT '',
  review_notes  TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leave_user ON school_leave_requests (user_id);

-- ─── Payroll (HR) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_payroll (
  id            TEXT        PRIMARY KEY,
  user_id       TEXT        NOT NULL,
  period        TEXT        NOT NULL,
  gross         TEXT        NOT NULL DEFAULT '0',
  deductions    TEXT        NOT NULL DEFAULT '0',
  net           TEXT        NOT NULL DEFAULT '0',
  status        TEXT        NOT NULL DEFAULT 'pending',
  paid_at       TIMESTAMPTZ,
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payroll_user ON school_payroll (user_id);


-- ============================================================
-- migrations/008_phase3.sql
-- ============================================================
-- ============================================================
-- Phase 3 Expansion: Messaging, Timetable, Assessments,
--                    Parent Portal, Library
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Messaging ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_messages (
  id            TEXT        PRIMARY KEY,
  sender_id     TEXT        NOT NULL,
  recipient_id  TEXT        NOT NULL,
  subject       TEXT        NOT NULL DEFAULT '',
  body          TEXT        NOT NULL DEFAULT '',
  is_read       BOOLEAN     NOT NULL DEFAULT FALSE,
  parent_id     TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON school_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON school_messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent    ON school_messages (parent_id);

-- ─── Timetable ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_timetable (
  id            TEXT        PRIMARY KEY,
  course_id     TEXT        NOT NULL,
  day_of_week   TEXT        NOT NULL,
  period        TEXT        NOT NULL DEFAULT '',
  room          TEXT        NOT NULL DEFAULT '',
  start_time    TEXT        NOT NULL DEFAULT '',
  end_time      TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timetable_course ON school_timetable (course_id);

-- ─── Exams ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_exams (
  id              TEXT        PRIMARY KEY,
  course_id       TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  exam_date       TIMESTAMPTZ NOT NULL,
  start_time      TEXT        NOT NULL DEFAULT '',
  end_time        TEXT        NOT NULL DEFAULT '',
  room            TEXT        NOT NULL DEFAULT '',
  invigilator_id  TEXT        NOT NULL DEFAULT '',
  notes           TEXT        NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exams_course    ON school_exams (course_id);
CREATE INDEX IF NOT EXISTS idx_exams_exam_date ON school_exams (exam_date);

-- ─── Quizzes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_quizzes (
  id               TEXT        PRIMARY KEY,
  course_id        TEXT        NOT NULL,
  title            TEXT        NOT NULL,
  instructions     TEXT        NOT NULL DEFAULT '',
  due_date         TIMESTAMPTZ,
  time_limit_mins  INTEGER     DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'draft',
  questions        JSONB       NOT NULL DEFAULT '[]',
  created_by       TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON school_quizzes (course_id);

-- ─── Quiz Submissions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_quiz_submissions (
  id           TEXT        PRIMARY KEY,
  quiz_id      TEXT        NOT NULL,
  student_id   TEXT        NOT NULL,
  answers      JSONB       NOT NULL DEFAULT '{}',
  score        INTEGER     NOT NULL DEFAULT 0,
  max_score    INTEGER     NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz    ON school_quiz_submissions (quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON school_quiz_submissions (student_id);

-- ─── Parent–Student Links ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_student_links (
  id          TEXT        PRIMARY KEY,
  parent_id   TEXT        NOT NULL,
  student_id  TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent  ON parent_student_links (parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links (student_id);

-- ─── Library Books ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_books (
  id               TEXT        PRIMARY KEY,
  title            TEXT        NOT NULL,
  author           TEXT        NOT NULL DEFAULT '',
  isbn             TEXT        NOT NULL DEFAULT '',
  category         TEXT        NOT NULL DEFAULT '',
  total_copies     INTEGER     NOT NULL DEFAULT 1,
  available_copies INTEGER     NOT NULL DEFAULT 1,
  description      TEXT        NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_books_category ON school_books (category);

-- ─── Library Borrows ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_borrows (
  id             TEXT        PRIMARY KEY,
  book_id        TEXT        NOT NULL,
  user_id        TEXT        NOT NULL,
  borrowed_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date       TIMESTAMPTZ NOT NULL,
  returned_date  TIMESTAMPTZ,
  fine_amount    TEXT        NOT NULL DEFAULT '0',
  status         TEXT        NOT NULL DEFAULT 'borrowed',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_borrows_book ON school_borrows (book_id);
CREATE INDEX IF NOT EXISTS idx_borrows_user ON school_borrows (user_id);


-- ============================================================
-- migrations/009_remove_demo_data.sql
-- ============================================================
-- 009_remove_demo_data.sql
-- Removes ALL seeded demo data (including every demo login credential) so the
-- platform starts from a clean slate. After running this, the school login
-- screen shows the first-run "Create Super Administrator" setup flow
-- (POST /api/school/auth/setup) because no super_admin row exists.
--
-- Only school_* tables and parent_student_links are cleared. The public site's
-- contact_submissions and donations tables are intentionally left untouched.
--
-- Safe to run multiple times; tables that do not exist are skipped.

DO $$
DECLARE
  t text;
  demo_tables text[] := ARRAY[
    'school_borrows', 'school_books', 'school_quiz_submissions', 'school_quizzes',
    'school_exams', 'school_timetable', 'school_messages', 'parent_student_links',
    'school_payroll', 'school_leave_requests', 'school_staff_records',
    'school_grades', 'school_attendance', 'school_payments', 'school_events',
    'school_announcements', 'school_enrollments', 'school_sessions',
    'school_courses', 'school_users'
  ];
BEGIN
  FOREACH t IN ARRAY demo_tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DELETE FROM %I', t);
    END IF;
  END LOOP;
END $$;

