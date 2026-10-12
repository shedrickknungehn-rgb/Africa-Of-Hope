-- Run after migrations/016_self_paced_backend_cleanup.sql in a disposable
-- restore or the production project. This is read-only verification: it raises
-- an error when a retired object remains or a retained core object is missing.

DO $$
DECLARE
  retired_table TEXT;
  retained_table TEXT;
BEGIN
  FOREACH retired_table IN ARRAY ARRAY[
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
    IF to_regclass(format('public.%I', retired_table)) IS NOT NULL THEN
      RAISE EXCEPTION 'retired table public.% remains after 016', retired_table;
    END IF;
  END LOOP;

  FOREACH retained_table IN ARRAY ARRAY[
    'school_users',
    'school_courses',
    'school_enrollments',
    'school_quizzes',
    'school_quiz_submissions',
    'school_grades',
    'school_payments',
    'password_reset_codes',
    'contact_submissions',
    'donations'
  ] LOOP
    IF to_regclass(format('public.%I', retained_table)) IS NULL THEN
      RAISE EXCEPTION 'retained table public.% is missing after 016', retained_table;
    END IF;
  END LOOP;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'school_courses'
      AND column_name IN ('schedule', 'capacity')
  ) THEN
    RAISE EXCEPTION 'retired school_courses schedule or capacity column remains after 016';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.school_users
    WHERE is_active
      AND role NOT IN ('student', 'instructor', 'admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'an unsupported role remains active after 016';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.school_users
    WHERE is_active
      AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'no active administrator remains after 016';
  END IF;
END;
$$;

SELECT public.get_school_stats();
