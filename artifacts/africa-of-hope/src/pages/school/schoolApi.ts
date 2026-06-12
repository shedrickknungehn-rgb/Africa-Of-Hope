const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API = `${API_BASE}/api/school`;

export type Role =
  | "super_admin" | "director" | "registrar" | "academic_coordinator"
  | "finance_officer" | "hr_officer" | "instructor" | "assistant"
  | "student" | "alumni" | "admin" | "parent";

export const MANAGEMENT_ROLES = new Set<string>([
  "admin", "super_admin", "director", "registrar",
  "academic_coordinator", "finance_officer", "hr_officer",
]);

export const isManagement = (role: string) => MANAGEMENT_ROLES.has(role);

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin", director: "Director", registrar: "Registrar",
  academic_coordinator: "Academic Coordinator", finance_officer: "Finance Officer",
  hr_officer: "HR Officer", instructor: "Instructor", assistant: "Assistant",
  student: "Student", alumni: "Alumni", admin: "Admin", parent: "Parent/Guardian",
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800", director: "bg-orange-100 text-orange-800",
  registrar: "bg-amber-100 text-amber-800", academic_coordinator: "bg-yellow-100 text-yellow-800",
  finance_officer: "bg-teal-100 text-teal-800", hr_officer: "bg-cyan-100 text-cyan-800",
  instructor: "bg-blue-100 text-blue-800", assistant: "bg-purple-100 text-purple-800",
  student: "bg-green-100 text-green-800", alumni: "bg-indigo-100 text-indigo-800",
  admin: "bg-red-100 text-red-800", parent: "bg-pink-100 text-pink-800",
};

export const ALL_ROLES: Role[] = [
  "super_admin", "director", "registrar", "academic_coordinator",
  "finance_officer", "hr_officer", "instructor", "assistant", "student", "alumni", "parent",
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

export interface Attendance {
  id: string; studentId: string; studentName?: string;
  courseId: string; courseTitle?: string; sessionDate: string;
  status: "present" | "absent" | "late" | "excused";
  notes: string; recordedBy: string; createdAt: string;
}

export interface Grade {
  id: string; studentId: string; studentName?: string;
  courseId: string; courseTitle?: string; assessment: string;
  score: string; maxScore: string; weight: string;
  grade: string; comment: string; recordedBy: string; createdAt: string;
}

export interface StaffRecord {
  id: string; userId: string; userName?: string;
  position: string; department: string;
  employmentType: "full_time" | "part_time" | "contract" | "volunteer";
  hireDate: string | null; salary: string;
  status: "active" | "on_leave" | "terminated";
  emergencyContact: string; notes: string; createdAt: string;
}

export interface LeaveRequest {
  id: string; userId: string; userName?: string;
  type: "annual" | "sick" | "personal" | "unpaid" | "maternity";
  startDate: string; endDate: string; reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string; reviewNotes: string; createdAt: string;
}

export interface Payroll {
  id: string; userId: string; userName?: string;
  period: string; gross: string; deductions: string; net: string;
  status: "pending" | "paid"; paidAt: string | null;
  notes: string; createdAt: string;
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
export const apiUpdateCourseMaterials = (id: string, materials: { title: string; url: string }[]) => apiFetch<Course>(`/courses/${id}/materials`, { method: "PATCH", body: JSON.stringify({ materials }) });
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

/* ─── Attendance ─────────────────────────────────────────────── */
export const apiGetAttendance = (params?: { courseId?: string; studentId?: string; date?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  if (params?.studentId) q.set("studentId", params.studentId);
  if (params?.date) q.set("date", params.date);
  const qs = q.toString();
  return apiFetch<Attendance[]>(`/attendance${qs ? `?${qs}` : ""}`);
};
export const apiSaveAttendance = (data: { courseId: string; sessionDate: string; records: { studentId: string; status: string; notes?: string }[] }) => apiFetch<Attendance[]>("/attendance", { method: "POST", body: JSON.stringify(data) });
export const apiDeleteAttendance = (id: string) => apiFetch<void>(`/attendance/${id}`, { method: "DELETE" });

/* ─── Grades ─────────────────────────────────────────────────── */
export const apiGetGrades = (params?: { courseId?: string; studentId?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  if (params?.studentId) q.set("studentId", params.studentId);
  const qs = q.toString();
  return apiFetch<Grade[]>(`/grades${qs ? `?${qs}` : ""}`);
};
export const apiCreateGrade = (data: { studentId: string; courseId: string; assessment: string; score?: string; maxScore?: string; weight?: string; grade?: string; comment?: string }) => apiFetch<Grade>("/grades", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateGrade = (id: string, updates: Partial<Grade>) => apiFetch<Grade>(`/grades/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteGrade = (id: string) => apiFetch<void>(`/grades/${id}`, { method: "DELETE" });

/* ─── HR: Staff Records ──────────────────────────────────────── */
export const apiGetStaff = () => apiFetch<StaffRecord[]>("/staff");
export const apiCreateStaff = (data: Omit<StaffRecord, "id" | "createdAt" | "userName">) => apiFetch<StaffRecord>("/staff", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateStaff = (id: string, updates: Partial<StaffRecord>) => apiFetch<StaffRecord>(`/staff/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteStaff = (id: string) => apiFetch<void>(`/staff/${id}`, { method: "DELETE" });

/* ─── HR: Leave Requests ─────────────────────────────────────── */
export const apiGetLeave = (params?: { userId?: string }) => {
  const q = new URLSearchParams();
  if (params?.userId) q.set("userId", params.userId);
  const qs = q.toString();
  return apiFetch<LeaveRequest[]>(`/leave${qs ? `?${qs}` : ""}`);
};
export const apiCreateLeave = (data: { type: string; startDate: string; endDate: string; reason?: string }) => apiFetch<LeaveRequest>("/leave", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateLeave = (id: string, updates: { status?: string; reviewNotes?: string }) => apiFetch<LeaveRequest>(`/leave/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

/* ─── HR: Payroll ────────────────────────────────────────────── */
export const apiGetPayroll = (params?: { userId?: string }) => {
  const q = new URLSearchParams();
  if (params?.userId) q.set("userId", params.userId);
  const qs = q.toString();
  return apiFetch<Payroll[]>(`/payroll${qs ? `?${qs}` : ""}`);
};
export const apiCreatePayroll = (data: { userId: string; period: string; gross?: string; deductions?: string; net?: string; notes?: string }) => apiFetch<Payroll>("/payroll", { method: "POST", body: JSON.stringify(data) });
export const apiUpdatePayroll = (id: string, updates: Partial<Payroll>) => apiFetch<Payroll>(`/payroll/${id}`, { method: "PATCH", body: JSON.stringify(updates) });

/* ─── Timetable ──────────────────────────────────────────────── */
export interface TimetableSlot {
  id: string; courseId: string; courseTitle?: string;
  instructorId?: string; instructorName?: string;
  dayOfWeek: string; period: string; room: string;
  startTime: string; endTime: string; createdAt: string;
}

export const apiGetTimetable = (params?: { courseId?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  const qs = q.toString();
  return apiFetch<TimetableSlot[]>(`/timetable${qs ? `?${qs}` : ""}`);
};
export const apiCreateTimetableSlot = (data: Omit<TimetableSlot, "id" | "createdAt" | "courseTitle" | "instructorName">) =>
  apiFetch<TimetableSlot>("/timetable", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) =>
  apiFetch<TimetableSlot>(`/timetable/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteTimetableSlot = (id: string) =>
  apiFetch<void>(`/timetable/${id}`, { method: "DELETE" });

/* ─── Exams ──────────────────────────────────────────────────── */
export interface Exam {
  id: string; courseId: string; courseTitle?: string;
  title: string; examDate: string;
  startTime: string; endTime: string; room: string;
  invigilatorId: string; invigilatorName?: string;
  notes: string; createdAt: string;
}

export const apiGetExams = (params?: { courseId?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  const qs = q.toString();
  return apiFetch<Exam[]>(`/exams${qs ? `?${qs}` : ""}`);
};
export const apiCreateExam = (data: Omit<Exam, "id" | "createdAt" | "courseTitle" | "invigilatorName">) =>
  apiFetch<Exam>("/exams", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateExam = (id: string, updates: Partial<Exam>) =>
  apiFetch<Exam>(`/exams/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteExam = (id: string) =>
  apiFetch<void>(`/exams/${id}`, { method: "DELETE" });

/* ─── Messages ───────────────────────────────────────────────── */
export interface Message {
  id: string; senderId: string; senderName: string;
  recipientId: string; recipientName: string;
  subject: string; body: string; isRead: boolean;
  parentId: string; createdAt: string;
}

export interface MessageContact { id: string; name: string; role: string; }
export const apiGetContacts = () => apiFetch<MessageContact[]>("/messages/contacts");

export const apiGetMessages = (params?: { box?: "inbox" | "sent" | "all"; all?: boolean }) => {
  const q = new URLSearchParams();
  if (params?.box) q.set("box", params.box);
  if (params?.all) q.set("all", "true");
  const qs = q.toString();
  return apiFetch<Message[]>(`/messages${qs ? `?${qs}` : ""}`);
};
export const apiSendMessage = (data: { recipientId: string; subject?: string; body: string; parentId?: string }) =>
  apiFetch<Message>("/messages", { method: "POST", body: JSON.stringify(data) });
export const apiMarkMessageRead = (id: string) =>
  apiFetch<Message>(`/messages/${id}/read`, { method: "PATCH" });
export const apiDeleteMessage = (id: string) =>
  apiFetch<void>(`/messages/${id}`, { method: "DELETE" });

/* ─── Quizzes ────────────────────────────────────────────────── */
export interface QuizQuestion {
  id: string; type: "mcq" | "true_false" | "short_answer";
  text: string; options?: string[]; correct?: string;
}

export interface Quiz {
  id: string; courseId: string; courseTitle?: string;
  title: string; instructions: string;
  dueDate: string | null; timeLimitMins: number;
  status: "draft" | "published";
  questions: QuizQuestion[];
  createdBy: string; createdAt: string;
}

export interface QuizSubmission {
  id: string; quizId: string; studentId: string; studentName?: string;
  answers: Record<string, string>; score: number; maxScore: number;
  submittedAt: string; createdAt: string;
}

export const apiGetQuizzes = (params?: { courseId?: string }) => {
  const q = new URLSearchParams();
  if (params?.courseId) q.set("courseId", params.courseId);
  const qs = q.toString();
  return apiFetch<Quiz[]>(`/quizzes${qs ? `?${qs}` : ""}`);
};
export const apiCreateQuiz = (data: Omit<Quiz, "id" | "createdAt" | "courseTitle">) =>
  apiFetch<Quiz>("/quizzes", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateQuiz = (id: string, updates: Partial<Quiz>) =>
  apiFetch<Quiz>(`/quizzes/${id}`, { method: "PATCH", body: JSON.stringify(updates) });
export const apiDeleteQuiz = (id: string) =>
  apiFetch<void>(`/quizzes/${id}`, { method: "DELETE" });
export const apiSubmitQuiz = (id: string, answers: Record<string, string>) =>
  apiFetch<QuizSubmission & { score: number; maxScore: number }>(`/quizzes/${id}/submit`, { method: "POST", body: JSON.stringify({ answers }) });
export const apiGetQuizSubmissions = (id: string) =>
  apiFetch<QuizSubmission[]>(`/quizzes/${id}/submissions`);
export const apiGetMyQuizSubmission = (id: string) =>
  apiFetch<QuizSubmission | null>(`/quizzes/${id}/my-submission`);

/* ─── Parent Links ───────────────────────────────────────────── */
export interface ParentLink {
  id: string; parentId: string; studentId: string; studentName?: string; createdAt: string;
}

export const apiGetMyChildren = () => apiFetch<User[]>("/users/my-children");
export const apiGetParentLinks = () => apiFetch<ParentLink[]>("/parent-links");
export const apiCreateParentLink = (data: { parentId: string; studentId: string }) =>
  apiFetch<ParentLink>("/parent-links", { method: "POST", body: JSON.stringify(data) });
export const apiDeleteParentLink = (id: string) =>
  apiFetch<void>(`/parent-links/${id}`, { method: "DELETE" });

/* ─── Library ────────────────────────────────────────────────── */
export interface Book {
  id: string; title: string; author: string; isbn: string; category: string;
  totalCopies: number; availableCopies: number; description: string; createdAt: string;
}

export interface Borrow {
  id: string; bookId: string; bookTitle: string; userId: string; userName: string;
  borrowedDate: string; dueDate: string; returnedDate: string | null;
  fineAmount: string; status: string; createdAt: string;
}

export const apiGetBooks = () => apiFetch<Book[]>("/books");
export const apiCreateBook = (data: Omit<Book, "id" | "createdAt">) =>
  apiFetch<Book>("/books", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateBook = (id: string, data: Partial<Omit<Book, "id" | "createdAt">>) =>
  apiFetch<Book>(`/books/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const apiDeleteBook = (id: string) =>
  apiFetch<void>(`/books/${id}`, { method: "DELETE" });

export const apiGetBorrows = (params?: { userId?: string; bookId?: string; status?: string }) => {
  const q = new URLSearchParams();
  if (params?.userId) q.set("userId", params.userId);
  if (params?.bookId) q.set("bookId", params.bookId);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return apiFetch<Borrow[]>(`/borrows${qs ? "?" + qs : ""}`);
};
export const apiCreateBorrow = (data: { bookId: string; userId?: string; dueDate: string }) =>
  apiFetch<Borrow>("/borrows", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateBorrow = (id: string, data: { status?: string; fineAmount?: string; returnedDate?: string }) =>
  apiFetch<Borrow>(`/borrows/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const apiDeleteBorrow = (id: string) =>
  apiFetch<void>(`/borrows/${id}`, { method: "DELETE" });

/* ─── Reports ────────────────────────────────────────────────── */
export const apiGetReportOverview = () => apiFetch<ReportOverview>("/reports/overview");

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
