-- Run after migrations/016_self_paced_backend_cleanup.sql in a disposable
-- restore or the production project. This is read-only verification: it raises
-- an error when a retired object remains or a retained core object is missing.

DO $$
DECLARE
  retired_table TEXT;
  retained_table TEXT;
  retained_column TEXT;
  retained_function TEXT;
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

  FOREACH retained_column IN ARRAY ARRAY[
    'school_users.avatar_url',
    'school_users.updated_at',
    'school_courses.cover_url',
    'school_courses.updated_at',
    'password_reset_codes.attempts',
    'contact_submissions.subject',
    'donations.amount_usd'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = split_part(retained_column, '.', 1)
        AND column_name = split_part(retained_column, '.', 2)
    ) THEN
      RAISE EXCEPTION 'retained column public.% is missing after 016', retained_column;
    END IF;
  END LOOP;

  IF to_regclass('storage.buckets') IS NULL THEN
    RAISE EXCEPTION 'retained storage.buckets relation is missing after 016';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'school_courses'
      AND column_name IN ('schedule', 'capacity')
  ) THEN
    RAISE EXCEPTION 'retired school_courses schedule or capacity column remains after 016';
  END IF;

  FOREACH retained_function IN ARRAY ARRAY[
    'public.get_school_stats()',
    'public.enroll_student(text,text)',
    'public.unenroll_student(text,text)',
    'public.claim_password_reset_attempt(text,text,integer)'
  ] LOOP
    IF to_regprocedure(retained_function) IS NULL THEN
      RAISE EXCEPTION 'retained function % is missing after 016', retained_function;
    END IF;
  END LOOP;

  IF to_regprocedure('public.cleanup_old_sessions(integer)') IS NOT NULL THEN
    RAISE EXCEPTION 'retired cleanup_old_sessions(integer) function remains after 016';
  END IF;

  IF to_regprocedure('public.get_active_announcements(text)') IS NOT NULL THEN
    RAISE EXCEPTION 'retired get_active_announcements(text) function remains after 016';
  END IF;

  IF to_regtype('public.session_status') IS NOT NULL THEN
    RAISE EXCEPTION 'retired public.session_status type remains after 016';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_publication_rel AS publication_relation
    JOIN pg_class AS relation ON relation.oid = publication_relation.prrelid
    JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
    WHERE namespace.nspname = 'public'
      AND relation.relname IN ('school_sessions', 'announcements')
  ) THEN
    RAISE EXCEPTION 'retired realtime publication entry remains after 016';
  END IF;

  IF has_function_privilege('anon', 'public.get_school_stats()', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.get_school_stats()', 'EXECUTE') THEN
    RAISE EXCEPTION 'anon or authenticated can execute get_school_stats after 016';
  END IF;

  IF NOT has_function_privilege('service_role', 'public.get_school_stats()', 'EXECUTE') THEN
    RAISE EXCEPTION 'service_role cannot execute get_school_stats after 016';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE oid = 'public.get_school_stats()'::regprocedure
      AND (
        proacl IS NULL
        OR EXISTS (
          SELECT 1
          FROM aclexplode(proacl) AS privilege
          WHERE privilege.grantee = 0
            AND privilege.privilege_type = 'EXECUTE'
        )
      )
  ) THEN
    RAISE EXCEPTION 'PUBLIC can execute get_school_stats after 016';
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
