import { query } from "./db";
import { logger } from "./logger";

export async function seedSchoolData() {
  const existing = await query(
    "SELECT id FROM school_users WHERE username = 'admin' LIMIT 1"
  );
  if (existing.rows.length > 0) return;

  logger.info("Seeding default school data…");

  await query(`
    INSERT INTO school_users (username, password, name, email, role) VALUES
      ('admin',       'AfroAdmin2026',  'System Administrator', 'admin@africaofhope.org',      'admin'),
      ('instructor1', 'Instructor2026', 'Demo Instructor',      'instructor@africaofhope.org', 'instructor'),
      ('assistant1',  'Assistant2026',  'Demo Assistant',       'assistant@africaofhope.org',  'assistant'),
      ('student1',    'Student2026',    'Demo Student',         'student@africaofhope.org',    'student')
  `);

  await query(`
    INSERT INTO school_courses (id, title, description, instructor_id, duration, fee, schedule, students, materials, status)
    VALUES
      ('c1', 'Certificate in Computer Studies',
       'Comprehensive introduction to computers, Microsoft Office, and internet skills for beginners.',
       '2', '3 months', '$35 registration', 'Monday, Wednesday, Friday — 9:00 AM',
       '["4"]', '[{"title":"Module 1 — Computer Basics","url":"#"},{"title":"Module 2 — Microsoft Office Suite","url":"#"}]',
       'active'),
      ('c2', 'Diploma in Business Administration',
       'Six-month diploma covering accounting, marketing, project management, and entrepreneurship.',
       '2', '6 months', '$50 registration', 'Tuesday, Thursday — 10:00 AM',
       '[]', '[{"title":"Course Outline","url":"#"}]',
       'active')
  `);

  logger.info("School data seeded successfully");
}
