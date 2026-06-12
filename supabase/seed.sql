-- ============================================================
-- Africa of Hope — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Default Users (passwords stored plaintext per existing system design)
INSERT INTO school_users (username, password, name, email, role) VALUES
  ('admin',       'AfroAdmin2026',  'System Administrator', 'admin@africaofhope.org',      'admin'),
  ('instructor1', 'Instructor2026', 'Demo Instructor',      'instructor@africaofhope.org', 'instructor'),
  ('assistant1',  'Assistant2026',  'Demo Assistant',       'assistant@africaofhope.org',  'assistant'),
  ('student1',    'Student2026',    'Demo Student',         'student@africaofhope.org',    'student')
ON CONFLICT (username) DO NOTHING;

-- Default Courses
INSERT INTO school_courses (id, title, description, instructor_id, duration, fee, schedule, students, materials, status) VALUES
  (
    'c1',
    'Certificate in Computer Studies',
    'Comprehensive introduction to computers, Microsoft Office, and internet skills for beginners.',
    '2',
    '3 months',
    '$35 registration',
    'Monday, Wednesday, Friday — 9:00 AM',
    '["4"]'::jsonb,
    '[{"title":"Module 1 — Computer Basics","url":"#"},{"title":"Module 2 — Microsoft Office Suite","url":"#"}]'::jsonb,
    'active'
  ),
  (
    'c2',
    'Diploma in Business Administration',
    'Six-month diploma covering accounting, marketing, project management, and entrepreneurship.',
    '2',
    '6 months',
    '$50 registration',
    'Tuesday, Thursday — 10:00 AM',
    '[]'::jsonb,
    '[{"title":"Course Outline","url":"#"}]'::jsonb,
    'active'
  ),
  (
    'c3',
    'Certificate in Health & Community Development',
    'Foundational health education covering first aid, nutrition, maternal health, and community outreach.',
    '2',
    '4 months',
    '$40 registration',
    'Wednesday, Friday — 2:00 PM',
    '[]'::jsonb,
    '[{"title":"Health Basics Module","url":"#"}]'::jsonb,
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Welcome Announcement
INSERT INTO announcements (title, body, audience, is_active) VALUES
  (
    'Welcome to Africa of Hope School Portal',
    'Welcome to Africa of Hope School of Professional Studies! Classes for the 2026/2027 academic year are now open. Browse courses, join live classes, and download materials from your dashboard.',
    'all',
    TRUE
  )
ON CONFLICT DO NOTHING;
