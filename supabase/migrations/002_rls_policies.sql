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
