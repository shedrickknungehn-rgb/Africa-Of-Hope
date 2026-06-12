import { getSupabase } from "./db";
import { logger } from "./logger";

export async function seedSchoolData() {
  const db = getSupabase();

  const { data } = await db
    .from("school_users")
    .select("id")
    .eq("username", "admin")
    .limit(1);

  if (data && data.length > 0) return;

  logger.info("Seeding default school data…");

  await db.from("school_users").insert([
    { username: "admin",       password: "AfroAdmin2026",   name: "System Administrator", email: "admin@africaofhope.org",      role: "admin" },
    { username: "superadmin",  password: "SuperAdmin2026",  name: "Super Administrator",  email: "superadmin@aoh.edu.lr",       role: "super_admin" },
    { username: "director",    password: "Director2026",    name: "Dr. James Kollie",     email: "director@aoh.edu.lr",         role: "director" },
    { username: "registrar",   password: "Registrar2026",   name: "Mary Johnson",         email: "registrar@aoh.edu.lr",        role: "registrar" },
    { username: "coordinator", password: "Coordinator2026", name: "Prof. Samuel Doe",     email: "coordinator@aoh.edu.lr",      role: "academic_coordinator" },
    { username: "finance",     password: "Finance2026",     name: "Alice Freeman",        email: "finance@aoh.edu.lr",          role: "finance_officer" },
    { username: "hr",          password: "HR2026",          name: "Robert Brown",         email: "hr@aoh.edu.lr",               role: "hr_officer" },
    { username: "instructor1", password: "Instructor2026",  name: "Demo Instructor",      email: "instructor@africaofhope.org", role: "instructor" },
    { username: "assistant1",  password: "Assistant2026",   name: "Demo Assistant",       email: "assistant@africaofhope.org",  role: "assistant" },
    { username: "student1",    password: "Student2026",     name: "Demo Student",         email: "student@africaofhope.org",    role: "student" },
    { username: "student2",    password: "Student2026",     name: "Grace Wesseh",         email: "grace@africaofhope.org",      role: "student" },
    { username: "alumni1",     password: "Alumni2026",      name: "John Kollie",          email: "john@alumni.aoh.edu.lr",      role: "alumni" },
  ]);

  await db.from("school_courses").insert([
    {
      id: "c1",
      title: "Certificate in Computer Studies",
      description: "Comprehensive introduction to computers, Microsoft Office, and internet skills for beginners.",
      instructor_id: "8",
      duration: "3 months",
      fee: "USD 35",
      schedule: "Monday, Wednesday, Friday — 9:00 AM",
      students: ["10"],
      materials: [
        { title: "Module 1 — Computer Basics", url: "#" },
        { title: "Module 2 — Microsoft Office Suite", url: "#" },
      ],
      status: "active",
      capacity: 30,
      category: "Information Technology",
    },
    {
      id: "c2",
      title: "Diploma in Business Administration",
      description: "Six-month diploma covering accounting, marketing, project management, and entrepreneurship.",
      instructor_id: "8",
      duration: "6 months",
      fee: "USD 50",
      schedule: "Tuesday, Thursday — 10:00 AM",
      students: [],
      materials: [{ title: "Course Outline", url: "#" }],
      status: "active",
      capacity: 25,
      category: "Business",
    },
    {
      id: "c3",
      title: "Certificate in Community Health",
      description: "Foundational health education covering hygiene, nutrition, and basic first aid.",
      instructor_id: "8",
      duration: "2 months",
      fee: "USD 25",
      schedule: "Saturday — 8:00 AM",
      students: [],
      materials: [],
      status: "active",
      capacity: 40,
      category: "Health",
    },
  ]);

  try {
    const nowIso = new Date().toISOString();
    const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString(); };

    await db.from("school_grades").insert([
      { id: "g1", student_id: "10", course_id: "c1", assessment: "Module 1 Quiz", score: "18", max_score: "20", weight: "10", grade: "A", comment: "Excellent grasp of basics", recorded_by: "8" },
      { id: "g2", student_id: "10", course_id: "c1", assessment: "Midterm Exam", score: "72", max_score: "100", weight: "30", grade: "B", comment: "Good, review file management", recorded_by: "8" },
    ]);

    await db.from("school_attendance").insert([
      { id: "a1", student_id: "10", course_id: "c1", session_date: day(-7), status: "present", notes: "", recorded_by: "8" },
      { id: "a2", student_id: "10", course_id: "c1", session_date: day(-5), status: "late", notes: "Arrived 15 min late", recorded_by: "8" },
      { id: "a3", student_id: "10", course_id: "c1", session_date: day(-2), status: "present", notes: "", recorded_by: "8" },
    ]);

    await db.from("school_staff_records").insert([
      { id: "sr1", user_id: "8", position: "Lead Instructor", department: "Academics", employment_type: "full_time", hire_date: "2024-01-15", salary: "USD 600/mo", status: "active", emergency_contact: "Jane Doe — 0770000000", notes: "" },
      { id: "sr2", user_id: "9", position: "Teaching Assistant", department: "Academics", employment_type: "part_time", hire_date: "2024-06-01", salary: "USD 300/mo", status: "active", emergency_contact: "", notes: "" },
      { id: "sr3", user_id: "7", position: "HR Officer", department: "Administration", employment_type: "full_time", hire_date: "2023-09-10", salary: "USD 550/mo", status: "active", emergency_contact: "", notes: "" },
    ]);

    await db.from("school_leave_requests").insert([
      { id: "lr1", user_id: "9", type: "sick", start_date: day(3), end_date: day(4), reason: "Medical appointment", status: "pending", reviewed_by: "", review_notes: "" },
      { id: "lr2", user_id: "8", type: "annual", start_date: day(-30), end_date: day(-26), reason: "Family visit", status: "approved", reviewed_by: "7", review_notes: "Approved — coverage arranged" },
    ]);

    await db.from("school_payroll").insert([
      { id: "pr1", user_id: "8", period: nowIso.slice(0, 7), gross: "600", deductions: "60", net: "540", status: "pending", paid_at: null, notes: "" },
      { id: "pr2", user_id: "9", period: nowIso.slice(0, 7), gross: "300", deductions: "30", net: "270", status: "pending", paid_at: null, notes: "" },
    ]);

    logger.info("Phase 2 (attendance, grades, HR) demo data seeded");
  } catch (e) {
    logger.warn("Phase 2 tables not seeded (run migration 007 to enable): " + (e instanceof Error ? e.message : String(e)));
  }

  logger.info("School data seeded successfully");
}
