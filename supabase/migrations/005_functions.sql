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
