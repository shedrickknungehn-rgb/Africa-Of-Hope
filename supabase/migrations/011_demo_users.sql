-- 011_demo_users.sql
-- Seeds demonstration logins (one per major role) so the portal can be
-- explored quickly. These are shown on the login screen for now.
-- Safe to run multiple times: no-op for usernames that already exist.
--
--   Every demo password below is: Demo2026
--
-- NOTE: these are convenience accounts for testing. Remove them (and the
-- demo panel on the login screen) before going live with real users.

INSERT INTO school_users (username, password, name, email, phone, role, is_active) VALUES
  ('director',   'Demo2026', 'Daniel Director',     'director@demo.aoh.edu.lr',   '', 'director',             TRUE),
  ('registrar',  'Demo2026', 'Rita Registrar',      'registrar@demo.aoh.edu.lr',  '', 'registrar',            TRUE),
  ('coordinator','Demo2026', 'Cora Coordinator',    'coordinator@demo.aoh.edu.lr','', 'academic_coordinator', TRUE),
  ('finance',    'Demo2026', 'Felix Finance',       'finance@demo.aoh.edu.lr',    '', 'finance_officer',      TRUE),
  ('hr',         'Demo2026', 'Hana Human-Resource', 'hr@demo.aoh.edu.lr',         '', 'hr_officer',           TRUE),
  ('instructor', 'Demo2026', 'Ian Instructor',      'instructor@demo.aoh.edu.lr', '', 'instructor',           TRUE),
  ('assistant',  'Demo2026', 'Amy Assistant',       'assistant@demo.aoh.edu.lr',  '', 'assistant',            TRUE),
  ('student',    'Demo2026', 'Sam Student',         'student@demo.aoh.edu.lr',    '', 'student',              TRUE),
  ('parent',     'Demo2026', 'Pat Parent',          'parent@demo.aoh.edu.lr',     '', 'parent',               TRUE)
ON CONFLICT (username) DO NOTHING;
