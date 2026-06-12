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
