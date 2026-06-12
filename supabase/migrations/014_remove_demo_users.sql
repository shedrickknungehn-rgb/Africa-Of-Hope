-- 014_remove_demo_users.sql
-- Pre-launch hardening: remove the seeded demo logins (one per role) that were
-- used to explore the portal during development. The matching on-screen
-- "Demo logins" panel has been removed from the sign-in page.
--
-- The seeded super_admin from 010_superadmin.sql is intentionally NOT deleted —
-- it is the real first administrator account. Deleting these rows cascades to
-- any of their password_reset_codes (ON DELETE CASCADE).

DELETE FROM school_users
WHERE username IN (
  'director', 'registrar', 'coordinator', 'finance', 'hr',
  'instructor', 'assistant', 'student', 'parent'
);
