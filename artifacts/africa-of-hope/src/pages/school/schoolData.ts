export type Role = "admin" | "instructor" | "assistant" | "student";

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  duration: string;
  fee: string;
  students: string[];
  materials: { title: string; url: string }[];
  schedule: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface LiveSession {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  roomId: string;
  title: string;
  startedAt: string;
  status: "live" | "ended";
}

const DEFAULT_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    password: "AfroAdmin2026",
    name: "System Administrator",
    email: "admin@africaofhope.org",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "instructor1",
    password: "Instructor2026",
    name: "Demo Instructor",
    email: "instructor@africaofhope.org",
    role: "instructor",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    username: "assistant1",
    password: "Assistant2026",
    name: "Demo Assistant",
    email: "assistant@africaofhope.org",
    role: "assistant",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    username: "student1",
    password: "Student2026",
    name: "Demo Student",
    email: "student@africaofhope.org",
    role: "student",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_COURSES: Course[] = [
  {
    id: "c1",
    title: "Certificate in Computer Studies",
    description: "Comprehensive introduction to computers, Microsoft Office, and internet skills for beginners.",
    instructorId: "2",
    duration: "3 months",
    fee: "$35 registration",
    students: ["4"],
    materials: [
      { title: "Module 1 — Computer Basics", url: "#" },
      { title: "Module 2 — Microsoft Office Suite", url: "#" },
    ],
    schedule: "Monday, Wednesday, Friday — 9:00 AM",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Diploma in Business Administration",
    description: "Six-month diploma covering accounting, marketing, project management, and entrepreneurship.",
    instructorId: "2",
    duration: "6 months",
    fee: "$50 registration",
    students: [],
    materials: [{ title: "Course Outline", url: "#" }],
    schedule: "Tuesday, Thursday — 10:00 AM",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export function initSchoolData() {
  if (!localStorage.getItem("aoh_users")) {
    localStorage.setItem("aoh_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("aoh_courses")) {
    localStorage.setItem("aoh_courses", JSON.stringify(DEFAULT_COURSES));
  }
  if (!localStorage.getItem("aoh_sessions")) {
    localStorage.setItem("aoh_sessions", JSON.stringify([]));
  }
}

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem("aoh_users") || "[]");
}
export function saveUsers(users: User[]) {
  localStorage.setItem("aoh_users", JSON.stringify(users));
}
export function getCourses(): Course[] {
  return JSON.parse(localStorage.getItem("aoh_courses") || "[]");
}
export function saveCourses(courses: Course[]) {
  localStorage.setItem("aoh_courses", JSON.stringify(courses));
}
export function getSessions(): LiveSession[] {
  return JSON.parse(localStorage.getItem("aoh_sessions") || "[]");
}
export function saveSessions(sessions: LiveSession[]) {
  localStorage.setItem("aoh_sessions", JSON.stringify(sessions));
}
export function getSession(): { user: User } | null {
  const s = localStorage.getItem("aoh_session");
  return s ? JSON.parse(s) : null;
}
export function setSession(user: User) {
  localStorage.setItem("aoh_session", JSON.stringify({ user }));
}
export function clearSession() {
  localStorage.removeItem("aoh_session");
}
export function login(username: string, password: string): User | null {
  initSchoolData();
  const users = getUsers();
  return users.find((u) => u.username === username && u.password === password) || null;
}
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
