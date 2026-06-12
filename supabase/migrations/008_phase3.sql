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
