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
