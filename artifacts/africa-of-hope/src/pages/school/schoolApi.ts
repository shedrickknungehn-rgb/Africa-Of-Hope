const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API = `${API_BASE}/api/school`;

export type Role =
  | "super_admin" | "director" | "registrar" | "academic_coordinator"
  | "finance_officer" | "hr_officer" | "instructor" | "assistant"
  | "student" | "alumni" | "admin";

export const MANAGEMENT_ROLES = new Set<string>([
  "admin", "super_admin", "director", "registrar",
  "academic_coordinator", "finance_officer", "hr_officer",
]);

export const isManagement = (role: string) => MANAGEMENT_ROLES.has(role);

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin", director: "Director", registrar: "Registrar",
  academic_coordinator: "Academic Coordinator", finance_officer: "Finance Officer",
  hr_officer: "HR Officer", instructor: "Instructor", assistant: "Assistant",
  student: "Student", alumni: "Alumni", admin: "Admin",
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800", director: "bg-orange-100 text-orange-800",
  registrar: "bg-amber-100 text-amber-800", academic_coordinator: "bg-yellow-100 text-yellow-800",
  finance_officer: "bg-teal-100 text-teal-800", hr_officer: "bg-cyan-100 text-cyan-800",
  instructor: "bg-blue-100 text-blue-800", assistant: "bg-purple-100 text-purple-800",
  student: "bg-green-100 text-green-800", alumni: "bg-indigo-100 text-indigo-800",
  admin: "bg-red-100 text-red-800",
};

export const ALL_ROLES: Role[] = [
  "super_admin", "director", "registrar", "academic_coordinator",
  "finance_officer", "hr_officer", "instructor", "assistant", "student", "alumni",
];

export interface User {
  id: string; username: string; password: string;
  name: string; email: string; phone?: string;
  role: string; isActive?: boolean; createdAt: string;
}

export interface Course {
  id: string; title: string; description: string; instructorId: string;
  duration: string; fee: string; schedule: string; students: string[];
  materials: { title: string; url: string }[]; status: string;
  capacity?: number; category?: string; createdAt: string;
}

export interface LiveSession {
  id: string; courseId: string; courseTitle: string; instructorId: string;
  roomId: string; title: string; startedAt: string; status: "live" | "ended";
}

export interface Enrollment {
  id: string; studentId: string; studentName?: string;
  courseId: string; courseTitle?: string;
  status: "pending" | "active" | "completed" | "withdrawn";
  fee: string; notes: string; enrolledAt: string; createdAt: string;
}

export interface Announcement {
  id: string; title: string; content: string; authorId: string; authorName?: string;
  priority: "low" | "normal" | "high" | "urgent";
  targetRoles: string[]; expiresAt: string | null; createdAt: string;
}

export interface SchoolEvent {
  id: string; title: string; description: string; date: string;
  location: string; type: "academic" | "social" | "administrative" | "external";
  createdAt: string;
}

export interface Payment {
  id: string; studentId: string; studentName?: string;
  courseId: string; courseTitle?: string; enrollmentId: string;
  amount: string; status: "pending" | "paid" | "overdue" | "waived";
  method: string; reference: string; dueDate: string | null;
  paidAt: string | null; notes: string; createdAt: string;
}

export interface ReportOverview {
  totalUsers: number; totalStudents: number; totalInstructors: number; totalManagement: number;
  totalCourses: number; activeCourses: number; totalEnrollments: number;
  activeEnrollments: number; pendingEnrollments: number;
  totalPayments: number; paidPayments: number; pendingPayments: number;
  liveSessions: number; upcomingEvents: number; totalAnnouncements: number;
}

function getToken() { return localStorage.getItem("aoh_school_token"); }

function authHeaders(): HeadersInit {
  const t = getToken();
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: authHeaders(), ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

/* ─── Auth ─────────────────────────────────────────────────── */
export async function apiLogin(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
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
  try { return { user: JSON.parse(raw) as User }; } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem("aoh_school_token");
  localStorage.removeItem("aoh_school_user");
}

/* ─── Users ─────────────────────────────────────────────────── */
export const apiGetUsers = () => apiFetch<User[]>("/users");
export const apiCreateUser = (user: Omit<User, "id" | "createdAt">) => apiFetch<User>("/users", { method: "POST", body: JSON.stringify(user) });
export const apiUpdateUser = (id: string, updates: Partial<User>) => apiFetch<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteUser = (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" });

/* ─── Courses ────────────────────────────────────────────────── */
export const apiGetCourses = () => apiFetch<Course[]>("/courses");
export const apiCreateCourse = (c: Omit<Course, "id" | "createdAt" | "students" | "materials">) => apiFetch<Course>("/courses", { method: "POST", body: JSON.stringify(c) });
export const apiUpdateCourse = (id: string, updates: Partial<Course>) => apiFetch<Course>(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteCourse = (id: string) => apiFetch<void>(`/courses/${id}`, { method: "DELETE" });

/* ─── Sessions ───────────────────────────────────────────────── */
export const apiGetSessions = () => apiFetch<LiveSession[]>("/sessions");
export const apiCreateSession = (data: Partial<LiveSession>) => apiFetch<LiveSession>("/sessions", { method: "POST", body: JSON.stringify(data) });

/* ─── Enrollments ────────────────────────────────────────────── */
export const apiGetEnrollments = (params?: { courseId?: string; studentId?: string; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  if (params?.studentId) q.set("studentId", params.studentId);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return apiFetch<Enrollment[]>(`/enrollments${qs ? `?${qs}` : ""}`);
};
export const apiCreateEnrollment = (data: { studentId: string; courseId: string; fee?: string; notes?: string }) => apiFetch<Enrollment>("/enrollments", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateEnrollment = (id: string, updates: Partial<Enrollment>) => apiFetch<Enrollment>(`/enrollments/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteEnrollment = (id: string) => apiFetch<void>(`/enrollments/${id}`, { method: "DELETE" });

/* ─── Announcements ──────────────────────────────────────────── */
export const apiGetAnnouncements = () => apiFetch<Announcement[]>("/announcements");
export const apiCreateAnnouncement = (data: Omit<Announcement, "id" | "createdAt" | "authorName">) => apiFetch<Announcement>("/announcements", { method: "POST", body: JSON.stringify(data) });
export const apiDeleteAnnouncement = (id: string) => apiFetch<void>(`/announcements/${id}`, { method: "DELETE" });

/* ─── Events ─────────────────────────────────────────────────── */
export const apiGetEvents = () => apiFetch<SchoolEvent[]>("/events");
export const apiCreateEvent = (data: Omit<SchoolEvent, "id" | "createdAt">) => apiFetch<SchoolEvent>("/events", { method: "POST", body: JSON.stringify(data) });
export const apiDeleteEvent = (id: string) => apiFetch<void>(`/events/${id}`, { method: "DELETE" });

/* ─── Payments ───────────────────────────────────────────────── */
export const apiGetPayments = (params?: { studentId?: string; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.studentId) q.set("studentId", params.studentId);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return apiFetch<Payment[]>(`/payments${qs ? `?${qs}` : ""}`);
};
export const apiCreatePayment = (data: Omit<Payment, "id" | "createdAt" | "studentName" | "courseTitle">) => apiFetch<Payment>("/payments", { method: "POST", body: JSON.stringify(data) });
export const apiUpdatePayment = (id: string, updates: Partial<Payment>) => apiFetch<Payment>(`/payments/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

/* ─── Reports ────────────────────────────────────────────────── */
export const apiGetReportOverview = () => apiFetch<ReportOverview>("/reports/overview");

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
