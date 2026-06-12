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

  logger.info("School data seeded successfully");
}
