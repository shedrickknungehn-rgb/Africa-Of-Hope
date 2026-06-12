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
