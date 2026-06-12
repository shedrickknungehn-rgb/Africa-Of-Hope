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
    { username: "admin",       password: "AfroAdmin2026",  name: "System Administrator", email: "admin@africaofhope.org",      role: "admin" },
    { username: "instructor1", password: "Instructor2026", name: "Demo Instructor",      email: "instructor@africaofhope.org", role: "instructor" },
    { username: "assistant1",  password: "Assistant2026",  name: "Demo Assistant",       email: "assistant@africaofhope.org",  role: "assistant" },
    { username: "student1",    password: "Student2026",    name: "Demo Student",         email: "student@africaofhope.org",    role: "student" },
  ]);

  await db.from("school_courses").insert([
    {
      id: "c1",
      title: "Certificate in Computer Studies",
      description: "Comprehensive introduction to computers, Microsoft Office, and internet skills for beginners.",
      instructor_id: "2",
      duration: "3 months",
      fee: "$35 registration",
      schedule: "Monday, Wednesday, Friday — 9:00 AM",
      students: ["4"],
      materials: [
        { title: "Module 1 — Computer Basics", url: "#" },
        { title: "Module 2 — Microsoft Office Suite", url: "#" },
      ],
      status: "active",
    },
    {
      id: "c2",
      title: "Diploma in Business Administration",
      description: "Six-month diploma covering accounting, marketing, project management, and entrepreneurship.",
      instructor_id: "2",
      duration: "6 months",
      fee: "$50 registration",
      schedule: "Tuesday, Thursday — 10:00 AM",
      students: [],
      materials: [{ title: "Course Outline", url: "#" }],
      status: "active",
    },
  ]);

  logger.info("School data seeded successfully");
}
