-- 010_superadmin.sql
-- Seeds a single Super Administrator login so the backend can be accessed.
-- Runs AFTER 009 (which clears all demo data), so this credential persists.
-- Safe to run multiple times: no-op if the username already exists.
--
--   Username: superadmin
--   Password: SuperAdmin2026
--   Role:     super_admin (full management access)

INSERT INTO school_users (username, password, name, email, phone, role, is_active)
VALUES ('superadmin', 'SuperAdmin2026', 'Super Administrator', 'superadmin@aoh.edu.lr', '', 'super_admin', TRUE)
ON CONFLICT (username) DO NOTHING;
