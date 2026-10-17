const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API = `${API_BASE}/api/school`;

export type Role = "student" | "instructor" | "admin" | "super_admin";

export const MANAGEMENT_ROLES = new Set<Role>(["admin", "super_admin"]);
export const isManagement = (role: string): role is "admin" | "super_admin" =>
  MANAGEMENT_ROLES.has(role as Role);

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  instructor: "Instructor",
  student: "Student",
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-amber-100 text-amber-800",
  instructor: "bg-blue-100 text-blue-800",
  student: "bg-green-100 text-green-800",
};

export const ALL_ROLES: Role[] = [
  "student",
  "instructor",
  "admin",
  "super_admin",
];

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
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
  status: string;
  category?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  status: "pending" | "active" | "completed" | "withdrawn";
  fee: string;
  notes: string;
  enrolledAt: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  enrollmentId: string;
  amount: string;
  status: "pending" | "paid" | "overdue" | "waived";
  method: string;
  reference: string;
  dueDate: string | null;
  paidAt: string | null;
  notes: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  courseId: string;
  courseTitle?: string;
  assessment: string;
  score: string;
  maxScore: string;
  weight: string;
  grade: string;
  comment: string;
  recordedBy: string;
  createdAt: string;
}

export interface ReportOverview {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalManagement: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  pendingEnrollments: number;
  totalQuizzes: number;
  totalGrades: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
}

export interface AcademicReport {
  enrollmentTrend: { month: string; count: number }[];
  gradeByBand: { band: string; count: number }[];
  passFail: { name: string; value: number }[];
  gradesByCourse: { course: string; avg: number }[];
}

export interface FinanceReport {
  revenueTrend: { month: string; revenue: number }[];
  paymentStatus: { name: string; value: number }[];
  totalCollected: number;
  totalOutstanding: number;
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "true_false" | "short_answer";
  text: string;
  options?: string[];
  correct?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  instructions: string;
  dueDate: string | null;
  timeLimitMins: number;
  status: "draft" | "published";
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  studentName?: string;
  answers: Record<string, string>;
  score: number;
  maxScore: number;
  submittedAt: string;
  createdAt: string;
}

const TOKEN_KEY = "aoh_school_token";
const USER_KEY = "aoh_school_user";

function storeSession(token: string, user: User, remember: boolean) {
  const primary = remember ? localStorage : sessionStorage;
  const secondary = remember ? sessionStorage : localStorage;
  primary.setItem(TOKEN_KEY, token);
  primary.setItem(USER_KEY, JSON.stringify(user));
  secondary.removeItem(TOKEN_KEY);
  secondary.removeItem(USER_KEY);
}

export function persistSessionUser(user: User) {
  const storage = localStorage.getItem(TOKEN_KEY)
    ? localStorage
    : sessionStorage.getItem(TOKEN_KEY)
      ? sessionStorage
      : null;
  storage?.setItem(USER_KEY, JSON.stringify(user));
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const UNREACHABLE =
  "Unable to reach the school server. Please make sure the API server is deployed and VITE_API_URL is configured for this site.";

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: "The server returned an unexpected (non-JSON) response." };
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { headers: authHeaders(), ...options });
  } catch {
    throw new ApiError(UNREACHABLE);
  }
  const data = await parseJson(res);
  if (!res.ok)
    throw new ApiError(
      (data as { error?: string }).error || `Request failed (${res.status})`,
      res.status,
    );
  return data as T;
}

export async function apiLogin(
  username: string,
  password: string,
  remember = true,
): Promise<{ token: string; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new Error(UNREACHABLE);
  }
  const data = await parseJson(res);
  if (!res.ok || !data.token)
    throw new Error((data as { error?: string }).error || "Login failed");
  storeSession(data.token as string, data.user as User, remember);
  return data as unknown as { token: string; user: User };
}

export async function apiGetSetupStatus(): Promise<{ needsSetup: boolean }> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/setup-status`);
  } catch {
    throw new Error(UNREACHABLE);
  }
  const data = await parseJson(res);
  if (!res.ok)
    throw new Error(
      (data as { error?: string }).error || "Could not check setup status",
    );
  return { needsSetup: Boolean((data as { needsSetup?: boolean }).needsSetup) };
}

export async function apiSetup(payload: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  let res: Response;
  try {
    res = await fetch(`${API}/auth/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(UNREACHABLE);
  }
  const data = await parseJson(res);
  if (!res.ok || !data.token)
    throw new Error((data as { error?: string }).error || "Setup failed");
  storeSession(data.token as string, data.user as User, true);
  return data as unknown as { token: string; user: User };
}

export function getSession(): { user: User } | null {
  const token = getToken();
  const raw =
    localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!token || !raw) return null;
  try {
    return { user: JSON.parse(raw) as User };
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export const apiGetMe = () => apiFetch<User>("/me");

export async function apiForgotPassword(
  identifier: string,
): Promise<{ ok: boolean }> {
  await apiFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });
  return { ok: true };
}

export const apiResetPassword = (
  identifier: string,
  code: string,
  newPassword: string,
) =>
  apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ identifier, code, newPassword }),
  });

export const apiGetUsers = () => apiFetch<User[]>("/users");
export const apiCreateUser = (user: Omit<User, "id" | "createdAt">) =>
  apiFetch<User>("/users", { method: "POST", body: JSON.stringify(user) });
export const apiUpdateUser = (id: string, updates: Partial<User>) =>
  apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
export const apiDeleteUser = (id: string) =>
  apiFetch<void>(`/users/${id}`, { method: "DELETE" });

export const apiGetCourses = () => apiFetch<Course[]>("/courses");
export const apiCreateCourse = (
  course: Omit<Course, "id" | "createdAt" | "students" | "materials">,
) =>
  apiFetch<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
export const apiUpdateCourse = (id: string, updates: Partial<Course>) =>
  apiFetch<Course>(`/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
export const apiUpdateCourseMaterials = (
  id: string,
  materials: Course["materials"],
) =>
  apiFetch<Course>(`/courses/${id}/materials`, {
    method: "PATCH",
    body: JSON.stringify({ materials }),
  });
export const apiDeleteCourse = (id: string) =>
  apiFetch<void>(`/courses/${id}`, { method: "DELETE" });

export const apiGetEnrollments = (params?: {
  courseId?: string;
  studentId?: string;
  status?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.courseId) query.set("courseId", params.courseId);
  if (params?.studentId) query.set("studentId", params.studentId);
  if (params?.status) query.set("status", params.status);
  return apiFetch<Enrollment[]>(`/enrollments${query.size ? `?${query}` : ""}`);
};
export const apiCreateEnrollment = (data: {
  studentId: string;
  courseId: string;
  fee?: string;
  notes?: string;
}) =>
  apiFetch<Enrollment>("/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const apiUpdateEnrollment = (id: string, updates: Partial<Enrollment>) =>
  apiFetch<Enrollment>(`/enrollments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
export const apiDeleteEnrollment = (id: string) =>
  apiFetch<void>(`/enrollments/${id}`, { method: "DELETE" });

export const apiGetPayments = (params?: {
  studentId?: string;
  status?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.studentId) query.set("studentId", params.studentId);
  if (params?.status) query.set("status", params.status);
  return apiFetch<Payment[]>(`/payments${query.size ? `?${query}` : ""}`);
};
export const apiCreatePayment = (
  data: Omit<Payment, "id" | "createdAt" | "studentName" | "courseTitle">,
) =>
  apiFetch<Payment>("/payments", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const apiUpdatePayment = (id: string, updates: Partial<Payment>) =>
  apiFetch<Payment>(`/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const apiGetGrades = (params?: {
  courseId?: string;
  studentId?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.courseId) query.set("courseId", params.courseId);
  if (params?.studentId) query.set("studentId", params.studentId);
  return apiFetch<Grade[]>(`/grades${query.size ? `?${query}` : ""}`);
};
export const apiCreateGrade = (data: {
  studentId: string;
  courseId: string;
  assessment: string;
  score?: string;
  maxScore?: string;
  weight?: string;
  grade?: string;
  comment?: string;
}) =>
  apiFetch<Grade>("/grades", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateGrade = (id: string, updates: Partial<Grade>) =>
  apiFetch<Grade>(`/grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
export const apiDeleteGrade = (id: string) =>
  apiFetch<void>(`/grades/${id}`, { method: "DELETE" });

export const apiGetQuizzes = (params?: { courseId?: string }) => {
  const query = new URLSearchParams();
  if (params?.courseId) query.set("courseId", params.courseId);
  return apiFetch<Quiz[]>(`/quizzes${query.size ? `?${query}` : ""}`);
};
export const apiCreateQuiz = (
  data: Omit<Quiz, "id" | "createdAt" | "courseTitle">,
) => apiFetch<Quiz>("/quizzes", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateQuiz = (id: string, updates: Partial<Quiz>) =>
  apiFetch<Quiz>(`/quizzes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
export const apiDeleteQuiz = (id: string) =>
  apiFetch<void>(`/quizzes/${id}`, { method: "DELETE" });
export const apiSubmitQuiz = (id: string, answers: Record<string, string>) =>
  apiFetch<QuizSubmission & { score: number; maxScore: number }>(
    `/quizzes/${id}/submit`,
    { method: "POST", body: JSON.stringify({ answers }) },
  );
export const apiGetQuizSubmissions = (id: string) =>
  apiFetch<QuizSubmission[]>(`/quizzes/${id}/submissions`);
export const apiGetMyQuizSubmission = (id: string) =>
  apiFetch<QuizSubmission | null>(`/quizzes/${id}/my-submission`);

export const apiGetReportOverview = () =>
  apiFetch<ReportOverview>("/reports/overview");
export const apiGetAcademicReport = () =>
  apiFetch<AcademicReport>("/reports/academic");
export const apiGetFinanceReport = () =>
  apiFetch<FinanceReport>("/reports/finance");
