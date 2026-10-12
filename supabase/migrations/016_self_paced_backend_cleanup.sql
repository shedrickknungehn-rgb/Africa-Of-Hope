-- 016_self_paced_backend_cleanup.sql
--
-- Destructive, forward-only cleanup for the self-paced academy model.
-- Take and test an encrypted backup before applying this migration. It is
-- deliberately strict: missing historical/core objects or external dependencies
-- abort the transaction rather than silently broadening the deletion.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $$
DECLARE
  required_table TEXT;
  unexpected_function TEXT;
BEGIN
  FOREACH required_table IN ARRAY ARRAY[
    'school_users',
    'school_courses',
    'school_enrollments',
    'school_quizzes',
    'school_quiz_submissions',
    'school_grades',
    'school_payments',
    'password_reset_codes',
    'school_sessions',
    'school_attendance',
    'school_announcements',
    'school_events',
    'parent_student_links',
    'school_staff_records',
    'school_leave_requests',
    'school_payroll',
    'school_messages',
    'school_timetable',
    'school_exams',
    'school_books',
    'school_borrows',
    'announcements'
  ] LOOP
    IF to_regclass(format('public.%I', required_table)) IS NULL THEN
      RAISE EXCEPTION '016 cleanup requires public.% to exist', required_table;
    END IF;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1
    FROM public.school_users
    WHERE is_active
      AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION '016 cleanup would leave no active administrator';
  END IF;

  -- PL/pgSQL bodies are not consistently represented in pg_depend. Refuse to
  -- continue when an unaccounted-for public function names a retired object.
  SELECT p.oid::regprocedure::TEXT
  INTO unexpected_function
  FROM pg_proc AS p
  JOIN pg_namespace AS n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.oid NOT IN (
      'public.get_school_stats()'::regprocedure,
      'public.cleanup_old_sessions(integer)'::regprocedure,
      'public.get_active_announcements(text)'::regprocedure
    )
    AND lower(pg_get_functiondef(p.oid)) ~ '\m(school_sessions|school_attendance|school_announcements|school_events|parent_student_links|school_staff_records|school_leave_requests|school_payroll|school_messages|school_timetable|school_exams|school_books|school_borrows|announcements)\M'
  LIMIT 1;

  IF unexpected_function IS NOT NULL THEN
    RAISE EXCEPTION '016 cleanup blocked by unaccounted-for function dependency: %', unexpected_function;
  END IF;
END;
$$;

-- Lock the affected relations before removing records or altering the core
-- course table. lock_timeout above keeps this from waiting indefinitely.
LOCK TABLE
  public.school_users,
  public.school_courses,
  public.school_sessions,
  public.school_attendance,
  public.school_announcements,
  public.school_events,
  public.parent_student_links,
  public.school_staff_records,
  public.school_leave_requests,
  public.school_payroll,
  public.school_messages,
  public.school_timetable,
  public.school_exams,
  public.school_books,
  public.school_borrows,
  public.announcements
IN ACCESS EXCLUSIVE MODE;

-- Retire every unsupported account without deleting its identity or history.
UPDATE public.school_users
SET is_active = FALSE
WHERE is_active
  AND role NOT IN ('student', 'instructor', 'admin', 'super_admin');

-- These policies, publication entries, and functions are the only historical
-- dependencies of the session and old public-announcement tables.
DROP POLICY "anon_read_live_sessions" ON public.school_sessions;
DROP POLICY "service_role_write_sessions" ON public.school_sessions;
DROP POLICY "anon_read_active_announcements" ON public.announcements;
DROP POLICY "service_role_manage_announcements" ON public.announcements;

ALTER PUBLICATION supabase_realtime DROP TABLE public.school_sessions;
ALTER PUBLICATION supabase_realtime DROP TABLE public.announcements;

DROP FUNCTION public.cleanup_old_sessions(INTEGER) RESTRICT;
DROP FUNCTION public.get_active_announcements(TEXT) RESTRICT;

-- Replace the legacy live-session statistics before removing its source table.
CREATE OR REPLACE FUNCTION public.get_school_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM school_users),
    'active_users', (
      SELECT COUNT(*)
      FROM school_users
      WHERE is_active
        AND role IN ('student', 'instructor', 'admin', 'super_admin')
    ),
    'active_students', (
      SELECT COUNT(*) FROM school_users WHERE is_active AND role = 'student'
    ),
    'active_instructors', (
      SELECT COUNT(*) FROM school_users WHERE is_active AND role = 'instructor'
    ),
    'active_administrators', (
      SELECT COUNT(*)
      FROM school_users
      WHERE is_active AND role IN ('admin', 'super_admin')
    ),
    'active_courses', (
      SELECT COUNT(*) FROM school_courses WHERE status = 'active'
    ),
    'total_enrollments', (SELECT COUNT(*) FROM school_enrollments),
    'active_enrollments', (
      SELECT COUNT(*) FROM school_enrollments WHERE status = 'active'
    ),
    'total_quizzes', (SELECT COUNT(*) FROM school_quizzes),
    'total_grades', (SELECT COUNT(*) FROM school_grades),
    'total_payments', (SELECT COUNT(*) FROM school_payments),
    'paid_payment_total', (
      SELECT COALESCE(SUM(
        CASE
          WHEN amount ~ '^-?[0-9]+(\.[0-9]+)?$' THEN amount::NUMERIC
          ELSE 0
        END
      ), 0)
      FROM school_payments
      WHERE status = 'paid'
    )
  );
$$;

-- Restrictive drops preserve the transaction if any unknown view, trigger,
-- policy, or other external dependency was added outside this migration set.
DROP TABLE public.school_borrows RESTRICT;
DROP TABLE public.school_books RESTRICT;
DROP TABLE public.school_exams RESTRICT;
DROP TABLE public.school_timetable RESTRICT;
DROP TABLE public.school_messages RESTRICT;
DROP TABLE public.parent_student_links RESTRICT;
DROP TABLE public.school_payroll RESTRICT;
DROP TABLE public.school_leave_requests RESTRICT;
DROP TABLE public.school_staff_records RESTRICT;
DROP TABLE public.school_attendance RESTRICT;
DROP TABLE public.school_events RESTRICT;
DROP TABLE public.school_announcements RESTRICT;
DROP TABLE public.school_sessions RESTRICT;

-- The old public announcement table follows removal of its policies, realtime
-- publication entry, and typed helper function above. Its owned index is
-- removed with the table; no public-site table depends on it.
DROP TABLE public.announcements RESTRICT;

ALTER TABLE public.school_courses DROP COLUMN schedule RESTRICT;
ALTER TABLE public.school_courses DROP COLUMN capacity RESTRICT;

-- session_status was used only by the retired school_sessions table. RESTRICT
-- makes an unaccounted-for use block the migration.
DROP TYPE public.session_status RESTRICT;

COMMIT;
