const API = "/api/school";

export type Role = "admin" | "instructor" | "assistant" | "student";

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  duration: string;
  fee: string;
  schedule: string;
  students: string[];
  materials: { title: string; url: string }[];
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

function getToken(): string | null {
  return localStorage.getItem("aoh_school_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ─── Auth ─────────────────────────────────────────────── */

export async function apiLogin(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("aoh_school_token", data.token);
  localStorage.setItem("aoh_school_user", JSON.stringify(data.user));
  return data;
}

export function getSession(): { user: User } | null {
  const token = localStorage.getItem("aoh_school_token");
  const raw = localStorage.getItem("aoh_school_user");
  if (!token || !raw) return null;
  try {
    return { user: JSON.parse(raw) as User };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("aoh_school_token");
  localStorage.removeItem("aoh_school_user");
}

/* ─── Users ─────────────────────────────────────────────── */

export async function apiGetUsers(): Promise<User[]> {
  const res = await fetch(`${API}/users`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export async function apiCreateUser(user: Omit<User, "id" | "createdAt">): Promise<User> {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create user");
  return data;
}

export async function apiDeleteUser(id: string): Promise<void> {
  const res = await fetch(`${API}/users/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to delete user");
}

/* ─── Courses ────────────────────────────────────────────── */

export async function apiGetCourses(): Promise<Course[]> {
  const res = await fetch(`${API}/courses`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load courses");
  return res.json();
}

export async function apiCreateCourse(course: Omit<Course, "id" | "createdAt" | "students" | "materials">): Promise<Course> {
  const res = await fetch(`${API}/courses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(course),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create course");
  return data;
}

export async function apiDeleteCourse(id: string): Promise<void> {
  const res = await fetch(`${API}/courses/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to delete course");
}

/* ─── Sessions ───────────────────────────────────────────── */

export async function apiGetSessions(): Promise<LiveSession[]> {
  const res = await fetch(`${API}/sessions`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load sessions");
  return res.json();
}

export async function apiCreateSession(data: Partial<LiveSession>): Promise<LiveSession> {
  const res = await fetch(`${API}/sessions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create session");
  return json;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
