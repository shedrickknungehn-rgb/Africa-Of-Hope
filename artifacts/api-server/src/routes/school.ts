import { Router, type Request, type Response, type NextFunction } from "express";
import { getSupabase } from "../lib/db";
import { signToken, verifyToken, type JwtPayload } from "../lib/jwt";

const router = Router();
type AuthRequest = Request & { user?: JwtPayload };

const MGMT = new Set(["admin", "super_admin", "director", "registrar", "academic_coordinator", "finance_officer", "hr_officer"]);

function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const h = req.headers["authorization"];
  if (!h?.startsWith("Bearer ")) { res.status(401).json({ error: "Unauthorized" }); return; }
  const p = verifyToken(h.slice(7));
  if (!p) { res.status(401).json({ error: "Invalid or expired token" }); return; }
  req.user = p; next();
}

function requireMgmt(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !MGMT.has(req.user.role)) { res.status(403).json({ error: "Management access required" }); return; }
  next();
}

const STAFF = new Set(["instructor", "assistant", ...MGMT]);
function requireStaff(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || !STAFF.has(req.user.role)) { res.status(403).json({ error: "Staff access required" }); return; }
  next();
}

// Management and assistants may manage any class; an instructor only their own.
async function assertCourseAccess(req: AuthRequest, res: Response, courseId: string): Promise<boolean> {
  if (!courseId) { res.status(400).json({ error: "courseId required" }); return false; }
  if (MGMT.has(req.user!.role) || req.user!.role === "assistant") return true;
  const db = getSupabase();
  const { data } = await db.from("school_courses").select("instructor_id").eq("id", courseId).maybeSingle();
  if (data && String((data as { instructor_id: string }).instructor_id) === String(req.user!.id)) return true;
  res.status(403).json({ error: "You can only manage your own classes" });
  return false;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ─── DB types ──────────────────────────────────────────────── */
interface DbUser { id: number; username: string; password: string; name: string; email: string; phone?: string; role: string; is_active?: boolean; created_at: string; }
interface DbCourse { id: string; title: string; description: string; instructor_id: string; duration: string; fee: string; schedule: string; students: string[]; materials: { title: string; url: string }[]; status: string; capacity?: number; category?: string; created_at: string; }
interface DbSession { id: string; course_id: string; course_title: string; instructor_id: string; room_id: string; title: string; started_at: string; status: string; }
interface DbEnrollment { id: string; student_id: string; course_id: string; status: string; fee: string; notes: string; enrolled_at: string; created_at: string; }
interface DbAnnouncement { id: string; title: string; content: string; author_id: string; priority: string; target_roles: string[]; expires_at: string | null; created_at: string; }
interface DbEvent { id: string; title: string; description: string; date: string; location: string; type: string; created_at: string; }
interface DbPayment { id: string; student_id: string; course_id: string; enrollment_id: string; amount: string; status: string; method: string; reference: string; due_date: string | null; paid_at: string | null; notes: string; created_at: string; }
interface DbAttendance { id: string; student_id: string; course_id: string; session_date: string; status: string; notes: string; recorded_by: string; created_at: string; }
interface DbGrade { id: string; student_id: string; course_id: string; assessment: string; score: string; max_score: string; weight: string; grade: string; comment: string; recorded_by: string; created_at: string; }
interface DbStaff { id: string; user_id: string; position: string; department: string; employment_type: string; hire_date: string | null; salary: string; status: string; emergency_contact: string; notes: string; created_at: string; }
interface DbLeave { id: string; user_id: string; type: string; start_date: string; end_date: string; reason: string; status: string; reviewed_by: string; review_notes: string; created_at: string; }
interface DbPayroll { id: string; user_id: string; period: string; gross: string; deductions: string; net: string; status: string; paid_at: string | null; notes: string; created_at: string; }

/* ─── Formatters ────────────────────────────────────────────── */
const fmtUser = (u: DbUser, pw = true) => ({ id: String(u.id), username: u.username, password: pw ? u.password : "", name: u.name, email: u.email, phone: u.phone || "", role: u.role, isActive: u.is_active ?? true, createdAt: u.created_at });
const fmtCourse = (c: DbCourse) => ({ id: c.id, title: c.title, description: c.description, instructorId: c.instructor_id, duration: c.duration, fee: c.fee, schedule: c.schedule, students: Array.isArray(c.students) ? c.students : [], materials: Array.isArray(c.materials) ? c.materials : [], status: c.status, capacity: c.capacity ?? 30, category: c.category ?? "", createdAt: c.created_at });
const fmtSession = (s: DbSession) => ({ id: s.id, courseId: s.course_id, courseTitle: s.course_title, instructorId: s.instructor_id, roomId: s.room_id, title: s.title, startedAt: s.started_at, status: s.status });
const fmtEnrollment = (e: DbEnrollment, um = new Map<string, string>(), cm = new Map<string, string>()) => ({ id: e.id, studentId: e.student_id, studentName: um.get(e.student_id) || "", courseId: e.course_id, courseTitle: cm.get(e.course_id) || "", status: e.status, fee: e.fee, notes: e.notes, enrolledAt: e.enrolled_at, createdAt: e.created_at });
const fmtAnnouncement = (a: DbAnnouncement, um = new Map<string, string>()) => ({ id: a.id, title: a.title, content: a.content, authorId: a.author_id, authorName: um.get(a.author_id) || "", priority: a.priority, targetRoles: Array.isArray(a.target_roles) ? a.target_roles : ["all"], expiresAt: a.expires_at, createdAt: a.created_at });
const fmtEvent = (e: DbEvent) => ({ id: e.id, title: e.title, description: e.description, date: e.date, location: e.location, type: e.type, createdAt: e.created_at });
const fmtPayment = (p: DbPayment, um = new Map<string, string>(), cm = new Map<string, string>()) => ({ id: p.id, studentId: p.student_id, studentName: um.get(p.student_id) || "", courseId: p.course_id, courseTitle: cm.get(p.course_id) || "", enrollmentId: p.enrollment_id, amount: p.amount, status: p.status, method: p.method, reference: p.reference, dueDate: p.due_date, paidAt: p.paid_at, notes: p.notes, createdAt: p.created_at });
const fmtAttendance = (a: DbAttendance, um = new Map<string, string>(), cm = new Map<string, string>()) => ({ id: a.id, studentId: a.student_id, studentName: um.get(a.student_id) || "", courseId: a.course_id, courseTitle: cm.get(a.course_id) || "", sessionDate: a.session_date, status: a.status, notes: a.notes, recordedBy: a.recorded_by, createdAt: a.created_at });
const fmtGrade = (g: DbGrade, um = new Map<string, string>(), cm = new Map<string, string>()) => ({ id: g.id, studentId: g.student_id, studentName: um.get(g.student_id) || "", courseId: g.course_id, courseTitle: cm.get(g.course_id) || "", assessment: g.assessment, score: g.score, maxScore: g.max_score, weight: g.weight, grade: g.grade, comment: g.comment, recordedBy: g.recorded_by, createdAt: g.created_at });
const fmtStaff = (s: DbStaff, um = new Map<string, string>()) => ({ id: s.id, userId: s.user_id, userName: um.get(s.user_id) || "", position: s.position, department: s.department, employmentType: s.employment_type, hireDate: s.hire_date, salary: s.salary, status: s.status, emergencyContact: s.emergency_contact, notes: s.notes, createdAt: s.created_at });
const fmtLeave = (l: DbLeave, um = new Map<string, string>()) => ({ id: l.id, userId: l.user_id, userName: um.get(l.user_id) || "", type: l.type, startDate: l.start_date, endDate: l.end_date, reason: l.reason, status: l.status, reviewedBy: l.reviewed_by, reviewNotes: l.review_notes, createdAt: l.created_at });
const fmtPayroll = (p: DbPayroll, um = new Map<string, string>()) => ({ id: p.id, userId: p.user_id, userName: um.get(p.user_id) || "", period: p.period, gross: p.gross, deductions: p.deductions, net: p.net, status: p.status, paidAt: p.paid_at, notes: p.notes, createdAt: p.created_at });

async function getNameMaps(db: ReturnType<typeof getSupabase>) {
  const [{ data: users }, { data: courses }] = await Promise.all([
    db.from("school_users").select("id, name"),
    db.from("school_courses").select("id, title"),
  ]);
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  const cm = new Map<string, string>((courses ?? []).map((c: { id: string; title: string }) => [c.id, c.title]));
  return { um, cm };
}

/* ─── Auth ─────────────────────────────────────────────────── */
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) { res.status(400).json({ error: "Username and password required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_users").select("*").eq("username", username.trim()).limit(1).single();
  if (error || !data || (data as DbUser).password !== password) { res.status(401).json({ error: "Invalid username or password" }); return; }
  const u = data as DbUser;
  const token = signToken({ id: u.id, username: u.username, name: u.name, email: u.email, role: u.role });
  res.json({ token, user: fmtUser(u) });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_users").select("*").eq("id", req.user!.id).single();
  if (error || !data) { res.status(404).json({ error: "User not found" }); return; }
  res.json(fmtUser(data as DbUser));
});

/* ─── Users ─────────────────────────────────────────────────── */
router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_users").select("*").order("id", { ascending: true });
  if (error) throw error;
  const users = (data ?? []) as DbUser[];
  res.json(MGMT.has(req.user!.role) ? users.map((u) => fmtUser(u)) : users.filter((u) => u.role === "student").map((u) => fmtUser(u, false)));
});

router.post("/users", requireAuth, requireMgmt, async (req, res) => {
  const { username, password, name, email, phone, role } = req.body as Record<string, string>;
  if (!username || !password || !name) { res.status(400).json({ error: "Username, password, and name required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_users").insert({ username: username.trim(), password, name, email: email || "", phone: phone || "", role: role || "student" }).select().single();
  if (error) {
    if (error.code === "23505" || error.message?.includes("unique")) res.status(409).json({ error: "Username already exists" });
    else throw error;
    return;
  }
  res.status(201).json(fmtUser(data as DbUser));
});

router.patch("/users/:id", requireAuth, requireMgmt, async (req: AuthRequest, res) => {
  const id = Number(req.params["id"]);
  const { name, email, phone, role, password } = req.body as Record<string, string>;
  const upd: Record<string, string> = {};
  if (name) upd["name"] = name;
  if (email !== undefined) upd["email"] = email;
  if (phone !== undefined) upd["phone"] = phone;
  if (role) upd["role"] = role;
  if (password) upd["password"] = password;
  const db = getSupabase();
  const { data, error } = await db.from("school_users").update(upd).eq("id", id).select().single();
  if (error) throw error;
  res.json(fmtUser(data as DbUser));
});

router.delete("/users/:id", requireAuth, requireMgmt, async (req: AuthRequest, res) => {
  const id = Number(req.params["id"]);
  if (id === req.user!.id) { res.status(400).json({ error: "Cannot delete your own account" }); return; }
  const db = getSupabase();
  const { error } = await db.from("school_users").delete().eq("id", id);
  if (error) throw error;
  res.status(204).send();
});

/* ─── Courses ────────────────────────────────────────────────── */
router.get("/courses", requireAuth, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_courses").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  res.json(((data ?? []) as DbCourse[]).map(fmtCourse));
});

router.post("/courses", requireAuth, requireMgmt, async (req, res) => {
  const { title, description, instructorId, duration, fee, schedule, status, capacity, category } = req.body as Record<string, string>;
  if (!title) { res.status(400).json({ error: "Title is required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_courses").insert({ id: genId(), title, description: description || "", instructor_id: instructorId || "", duration: duration || "1 month", fee: fee || "", schedule: schedule || "", students: [], materials: [], status: status || "active", capacity: Number(capacity) || 30, category: category || "" }).select().single();
  if (error) throw error;
  res.status(201).json(fmtCourse(data as DbCourse));
});

router.patch("/courses/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { title, description, instructorId, duration, fee, schedule, status, capacity, category } = req.body as Record<string, string>;
  const upd: Record<string, unknown> = {};
  if (title) upd["title"] = title;
  if (description !== undefined) upd["description"] = description;
  if (instructorId !== undefined) upd["instructor_id"] = instructorId;
  if (duration) upd["duration"] = duration;
  if (fee !== undefined) upd["fee"] = fee;
  if (schedule !== undefined) upd["schedule"] = schedule;
  if (status) upd["status"] = status;
  if (capacity) upd["capacity"] = Number(capacity);
  if (category !== undefined) upd["category"] = category;
  const db = getSupabase();
  const { data, error } = await db.from("school_courses").update(upd).eq("id", id).select().single();
  if (error) throw error;
  res.json(fmtCourse(data as DbCourse));
});

router.delete("/courses/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_courses").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

// Staff can manage materials for classes they own (instructor) or any class (assistant/mgmt).
router.patch("/courses/:id/materials", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);
  if (!(await assertCourseAccess(req, res, id))) return;
  const { materials } = req.body as { materials: { title: string; url: string }[] };
  const db = getSupabase();
  const { data, error } = await db.from("school_courses").update({ materials: Array.isArray(materials) ? materials : [] }).eq("id", id).select().single();
  if (error) throw error;
  res.json(fmtCourse(data as DbCourse));
});

/* ─── Sessions ───────────────────────────────────────────────── */
router.get("/sessions", requireAuth, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_sessions").select("*").order("started_at", { ascending: false });
  if (error) throw error;
  res.json(((data ?? []) as DbSession[]).map(fmtSession));
});

router.post("/sessions", requireAuth, async (req, res) => {
  const { courseId, courseTitle, instructorId, roomId, title } = req.body as Record<string, string>;
  const id = genId();
  const db = getSupabase();
  const { data, error } = await db.from("school_sessions").insert({ id, course_id: courseId || "", course_title: courseTitle || "", instructor_id: instructorId || "", room_id: roomId || id, title: title || "Live Class", status: "live" }).select().single();
  if (error) throw error;
  res.status(201).json(fmtSession(data as DbSession));
});

router.patch("/sessions/:id/end", requireAuth, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_sessions").update({ status: "ended" }).eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Enrollments ────────────────────────────────────────────── */
router.get("/enrollments", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_enrollments").select("*");
  if (req.query["courseId"]) q = q.eq("course_id", String(req.query["courseId"]));
  if (req.query["studentId"]) q = q.eq("student_id", String(req.query["studentId"]));
  if (req.query["status"]) q = q.eq("status", String(req.query["status"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbEnrollment[]).map((e) => fmtEnrollment(e, um, cm)));
});

router.post("/enrollments", requireAuth, requireMgmt, async (req, res) => {
  const { studentId, courseId, fee, notes } = req.body as Record<string, string>;
  if (!studentId || !courseId) { res.status(400).json({ error: "studentId and courseId required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_enrollments").insert({ id: genId(), student_id: studentId, course_id: courseId, status: "pending", fee: fee || "", notes: notes || "" }).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.status(201).json(fmtEnrollment(data as DbEnrollment, um, cm));
});

router.patch("/enrollments/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { status, fee, notes } = req.body as Record<string, string>;
  const upd: Record<string, string> = {};
  if (status) upd["status"] = status;
  if (fee !== undefined) upd["fee"] = fee;
  if (notes !== undefined) upd["notes"] = notes;
  const db = getSupabase();
  const { data, error } = await db.from("school_enrollments").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(fmtEnrollment(data as DbEnrollment, um, cm));
});

router.delete("/enrollments/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_enrollments").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Announcements ──────────────────────────────────────────── */
router.get("/announcements", requireAuth, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_announcements").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(((data ?? []) as DbAnnouncement[]).map((a) => fmtAnnouncement(a, um)));
});

router.post("/announcements", requireAuth, requireMgmt, async (req: AuthRequest, res) => {
  const { title, content, priority, targetRoles, expiresAt } = req.body as { title: string; content: string; priority?: string; targetRoles?: string[]; expiresAt?: string };
  if (!title || !content) { res.status(400).json({ error: "Title and content required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_announcements").insert({ id: genId(), title, content, author_id: String(req.user!.id), priority: priority || "normal", target_roles: targetRoles || ["all"], expires_at: expiresAt || null }).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.status(201).json(fmtAnnouncement(data as DbAnnouncement, um));
});

router.delete("/announcements/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_announcements").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Events ─────────────────────────────────────────────────── */
router.get("/events", requireAuth, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_events").select("*").order("date", { ascending: true });
  if (error) throw error;
  res.json(((data ?? []) as DbEvent[]).map(fmtEvent));
});

router.post("/events", requireAuth, requireMgmt, async (req, res) => {
  const { title, description, date, location, type } = req.body as Record<string, string>;
  if (!title || !date) { res.status(400).json({ error: "Title and date required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_events").insert({ id: genId(), title, description: description || "", date, location: location || "", type: type || "academic" }).select().single();
  if (error) throw error;
  res.status(201).json(fmtEvent(data as DbEvent));
});

router.delete("/events/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_events").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Payments ───────────────────────────────────────────────── */
router.get("/payments", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_payments").select("*");
  if (req.query["studentId"]) q = q.eq("student_id", String(req.query["studentId"]));
  if (req.query["status"]) q = q.eq("status", String(req.query["status"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbPayment[]).map((p) => fmtPayment(p, um, cm)));
});

router.post("/payments", requireAuth, requireMgmt, async (req, res) => {
  const { studentId, courseId, enrollmentId, amount, method, reference, dueDate, notes } = req.body as Record<string, string>;
  if (!studentId || !courseId || !amount) { res.status(400).json({ error: "studentId, courseId, and amount required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_payments").insert({ id: genId(), student_id: studentId, course_id: courseId, enrollment_id: enrollmentId || "", amount, status: "pending", method: method || "", reference: reference || "", due_date: dueDate || null, paid_at: null, notes: notes || "" }).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.status(201).json(fmtPayment(data as DbPayment, um, cm));
});

router.patch("/payments/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { status, method, reference, paidAt, notes } = req.body as Record<string, string>;
  const upd: Record<string, string | null> = {};
  if (status) { upd["status"] = status; if (status === "paid" && !paidAt) upd["paid_at"] = new Date().toISOString(); }
  if (method !== undefined) upd["method"] = method;
  if (reference !== undefined) upd["reference"] = reference;
  if (paidAt !== undefined) upd["paid_at"] = paidAt || null;
  if (notes !== undefined) upd["notes"] = notes;
  const db = getSupabase();
  const { data, error } = await db.from("school_payments").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(fmtPayment(data as DbPayment, um, cm));
});

/* ─── Attendance ─────────────────────────────────────────────── */
router.get("/attendance", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_attendance").select("*");
  if (!STAFF.has(req.user!.role)) {
    q = q.eq("student_id", String(req.user!.id)); // students/alumni: own records only
  } else {
    if (req.query["studentId"]) q = q.eq("student_id", String(req.query["studentId"]));
  }
  if (req.query["courseId"]) q = q.eq("course_id", String(req.query["courseId"]));
  if (req.query["date"]) q = q.eq("session_date", String(req.query["date"]));
  const { data, error } = await q.order("session_date", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbAttendance[]).map((a) => fmtAttendance(a, um, cm)));
});

router.post("/attendance", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const { courseId, sessionDate, records } = req.body as { courseId: string; sessionDate: string; records: { studentId: string; status: string; notes?: string }[] };
  if (!courseId || !sessionDate || !Array.isArray(records)) { res.status(400).json({ error: "courseId, sessionDate, and records required" }); return; }
  if (!(await assertCourseAccess(req, res, courseId))) return;
  const db = getSupabase();
  await db.from("school_attendance").delete().eq("course_id", courseId).eq("session_date", sessionDate);
  const rows = records.map((r) => ({ id: genId(), student_id: r.studentId, course_id: courseId, session_date: sessionDate, status: r.status || "present", notes: r.notes || "", recorded_by: String(req.user!.id) }));
  if (rows.length === 0) { res.status(201).json([]); return; }
  const { data, error } = await db.from("school_attendance").insert(rows).select();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.status(201).json(((data ?? []) as DbAttendance[]).map((a) => fmtAttendance(a, um, cm)));
});

router.delete("/attendance/:id", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data: row } = await db.from("school_attendance").select("course_id").eq("id", String(req.params["id"])).maybeSingle();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  if (!(await assertCourseAccess(req, res, String((row as { course_id: string }).course_id)))) return;
  const { error } = await db.from("school_attendance").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Grades ─────────────────────────────────────────────────── */
router.get("/grades", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_grades").select("*");
  if (!STAFF.has(req.user!.role)) {
    q = q.eq("student_id", String(req.user!.id)); // students/alumni: own records only
  } else {
    if (req.query["studentId"]) q = q.eq("student_id", String(req.query["studentId"]));
  }
  if (req.query["courseId"]) q = q.eq("course_id", String(req.query["courseId"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbGrade[]).map((g) => fmtGrade(g, um, cm)));
});

router.post("/grades", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const { studentId, courseId, assessment, score, maxScore, weight, grade, comment } = req.body as Record<string, string>;
  if (!studentId || !courseId || !assessment) { res.status(400).json({ error: "studentId, courseId, and assessment required" }); return; }
  if (!(await assertCourseAccess(req, res, courseId))) return;
  const db = getSupabase();
  const { data, error } = await db.from("school_grades").insert({ id: genId(), student_id: studentId, course_id: courseId, assessment, score: score || "0", max_score: maxScore || "100", weight: weight || "", grade: grade || "", comment: comment || "", recorded_by: String(req.user!.id) }).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.status(201).json(fmtGrade(data as DbGrade, um, cm));
});

router.patch("/grades/:id", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);
  const { assessment, score, maxScore, weight, grade, comment } = req.body as Record<string, string>;
  const upd: Record<string, string> = {};
  if (assessment) upd["assessment"] = assessment;
  if (score !== undefined) upd["score"] = score;
  if (maxScore !== undefined) upd["max_score"] = maxScore;
  if (weight !== undefined) upd["weight"] = weight;
  if (grade !== undefined) upd["grade"] = grade;
  if (comment !== undefined) upd["comment"] = comment;
  const db = getSupabase();
  const { data: row } = await db.from("school_grades").select("course_id").eq("id", id).maybeSingle();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  if (!(await assertCourseAccess(req, res, String((row as { course_id: string }).course_id)))) return;
  const { data, error } = await db.from("school_grades").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(fmtGrade(data as DbGrade, um, cm));
});

router.delete("/grades/:id", requireAuth, requireStaff, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data: row } = await db.from("school_grades").select("course_id").eq("id", String(req.params["id"])).maybeSingle();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  if (!(await assertCourseAccess(req, res, String((row as { course_id: string }).course_id)))) return;
  const { error } = await db.from("school_grades").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── HR: Staff Records ──────────────────────────────────────── */
router.get("/staff", requireAuth, requireMgmt, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_staff_records").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(((data ?? []) as DbStaff[]).map((s) => fmtStaff(s, um)));
});

router.post("/staff", requireAuth, requireMgmt, async (req, res) => {
  const { userId, position, department, employmentType, hireDate, salary, status, emergencyContact, notes } = req.body as Record<string, string>;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_staff_records").insert({ id: genId(), user_id: userId, position: position || "", department: department || "", employment_type: employmentType || "full_time", hire_date: hireDate || null, salary: salary || "", status: status || "active", emergency_contact: emergencyContact || "", notes: notes || "" }).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.status(201).json(fmtStaff(data as DbStaff, um));
});

router.patch("/staff/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { position, department, employmentType, hireDate, salary, status, emergencyContact, notes } = req.body as Record<string, string>;
  const upd: Record<string, string | null> = {};
  if (position !== undefined) upd["position"] = position;
  if (department !== undefined) upd["department"] = department;
  if (employmentType) upd["employment_type"] = employmentType;
  if (hireDate !== undefined) upd["hire_date"] = hireDate || null;
  if (salary !== undefined) upd["salary"] = salary;
  if (status) upd["status"] = status;
  if (emergencyContact !== undefined) upd["emergency_contact"] = emergencyContact;
  if (notes !== undefined) upd["notes"] = notes;
  const db = getSupabase();
  const { data, error } = await db.from("school_staff_records").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(fmtStaff(data as DbStaff, um));
});

router.delete("/staff/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db.from("school_staff_records").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── HR: Leave Requests ─────────────────────────────────────── */
router.get("/leave", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_leave_requests").select("*");
  if (!MGMT.has(req.user!.role)) q = q.eq("user_id", String(req.user!.id));
  else if (req.query["userId"]) q = q.eq("user_id", String(req.query["userId"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(((data ?? []) as DbLeave[]).map((l) => fmtLeave(l, um)));
});

router.post("/leave", requireAuth, async (req: AuthRequest, res) => {
  const { type, startDate, endDate, reason } = req.body as Record<string, string>;
  if (!startDate || !endDate) { res.status(400).json({ error: "startDate and endDate required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_leave_requests").insert({ id: genId(), user_id: String(req.user!.id), type: type || "annual", start_date: startDate, end_date: endDate, reason: reason || "", status: "pending" }).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.status(201).json(fmtLeave(data as DbLeave, um));
});

router.patch("/leave/:id", requireAuth, requireMgmt, async (req: AuthRequest, res) => {
  const id = String(req.params["id"]);
  const { status, reviewNotes } = req.body as Record<string, string>;
  const upd: Record<string, string> = {};
  if (status) upd["status"] = status;
  if (reviewNotes !== undefined) upd["review_notes"] = reviewNotes;
  if (status) upd["reviewed_by"] = String(req.user!.id);
  const db = getSupabase();
  const { data, error } = await db.from("school_leave_requests").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(fmtLeave(data as DbLeave, um));
});

/* ─── HR: Payroll ────────────────────────────────────────────── */
router.get("/payroll", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_payroll").select("*");
  if (!MGMT.has(req.user!.role)) q = q.eq("user_id", String(req.user!.id));
  else if (req.query["userId"]) q = q.eq("user_id", String(req.query["userId"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(((data ?? []) as DbPayroll[]).map((p) => fmtPayroll(p, um)));
});

router.post("/payroll", requireAuth, requireMgmt, async (req, res) => {
  const { userId, period, gross, deductions, net, notes } = req.body as Record<string, string>;
  if (!userId || !period) { res.status(400).json({ error: "userId and period required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_payroll").insert({ id: genId(), user_id: userId, period, gross: gross || "0", deductions: deductions || "0", net: net || "0", status: "pending", paid_at: null, notes: notes || "" }).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.status(201).json(fmtPayroll(data as DbPayroll, um));
});

router.patch("/payroll/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { gross, deductions, net, status, notes } = req.body as Record<string, string>;
  const upd: Record<string, string | null> = {};
  if (gross !== undefined) upd["gross"] = gross;
  if (deductions !== undefined) upd["deductions"] = deductions;
  if (net !== undefined) upd["net"] = net;
  if (status) { upd["status"] = status; if (status === "paid") upd["paid_at"] = new Date().toISOString(); }
  if (notes !== undefined) upd["notes"] = notes;
  const db = getSupabase();
  const { data, error } = await db.from("school_payroll").update(upd).eq("id", id).select().single();
  if (error) throw error;
  const { data: users } = await db.from("school_users").select("id, name");
  const um = new Map<string, string>((users ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
  res.json(fmtPayroll(data as DbPayroll, um));
});

/* ─── Reports ────────────────────────────────────────────────── */
router.get("/reports/overview", requireAuth, requireMgmt, async (_req, res) => {
  const db = getSupabase();
  const [{ data: users }, { data: courses }, { data: enrollments }, { data: payments }, { data: sessions }, { data: events }, { data: announcements }] = await Promise.all([
    db.from("school_users").select("id, role"),
    db.from("school_courses").select("id, status"),
    db.from("school_enrollments").select("id, status"),
    db.from("school_payments").select("id, status"),
    db.from("school_sessions").select("id, status"),
    db.from("school_events").select("id, date"),
    db.from("school_announcements").select("id"),
  ]);
  const u = (users ?? []) as { id: number; role: string }[];
  const c = (courses ?? []) as { id: string; status: string }[];
  const e = (enrollments ?? []) as { id: string; status: string }[];
  const p = (payments ?? []) as { id: string; status: string }[];
  const s = (sessions ?? []) as { id: string; status: string }[];
  const ev = (events ?? []) as { id: string; date: string }[];
  const an = (announcements ?? []) as { id: string }[];
  const mgmtArr = [...MGMT];
  const now = new Date().toISOString();
  res.json({
    totalUsers: u.length, totalStudents: u.filter((x) => x.role === "student").length,
    totalInstructors: u.filter((x) => x.role === "instructor" || x.role === "assistant").length,
    totalManagement: u.filter((x) => mgmtArr.includes(x.role)).length,
    totalCourses: c.length, activeCourses: c.filter((x) => x.status === "active").length,
    totalEnrollments: e.length, activeEnrollments: e.filter((x) => x.status === "active").length,
    pendingEnrollments: e.filter((x) => x.status === "pending").length,
    totalPayments: p.length, paidPayments: p.filter((x) => x.status === "paid").length,
    pendingPayments: p.filter((x) => x.status === "pending" || x.status === "overdue").length,
    liveSessions: s.filter((x) => x.status === "live").length,
    upcomingEvents: ev.filter((x) => x.date > now).length,
    totalAnnouncements: an.length,
  });
});

/* ─── Messages ───────────────────────────────────────────────── */
interface DbMessage { id: string; sender_id: string; recipient_id: string; subject: string; body: string; is_read: boolean; parent_id: string; created_at: string; }

const buildUserMap = async (): Promise<Map<string, string>> => {
  const db = getSupabase();
  const { data } = await db.from("school_users").select("id, name");
  return new Map<string, string>((data ?? []).map((u: { id: number; name: string }) => [String(u.id), u.name]));
};

const fmtMsg = (m: DbMessage, um: Map<string, string>) => ({
  id: m.id,
  senderId: m.sender_id,
  senderName: um.get(m.sender_id) || "Unknown",
  recipientId: m.recipient_id,
  recipientName: um.get(m.recipient_id) || "Unknown",
  subject: m.subject,
  body: m.body,
  isRead: m.is_read,
  parentId: m.parent_id,
  createdAt: m.created_at,
});

router.get("/messages", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const isAdmin = MGMT.has(req.user!.role);
  const showAll = req.query["all"] === "true" && isAdmin;
  const uid = String(req.user!.id);
  const box = String(req.query["box"] || "all");

  let q = db.from("school_messages").select("*");
  if (!showAll) {
    if (box === "inbox") q = q.eq("recipient_id", uid);
    else if (box === "sent") q = q.eq("sender_id", uid);
    else q = q.or(`sender_id.eq.${uid},recipient_id.eq.${uid}`);
  }
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const um = await buildUserMap();
  res.json(((data ?? []) as DbMessage[]).map((m) => fmtMsg(m, um)));
});

router.post("/messages", requireAuth, async (req: AuthRequest, res) => {
  const { recipientId, subject, body, parentId } = req.body as { recipientId?: string; subject?: string; body?: string; parentId?: string };
  if (!recipientId || !body) { res.status(400).json({ error: "recipientId and body required" }); return; }
  const db = getSupabase();
  const { data, error } = await db.from("school_messages").insert({
    id: genId(),
    sender_id: String(req.user!.id),
    recipient_id: recipientId,
    subject: subject || "",
    body,
    is_read: false,
    parent_id: parentId || "",
  }).select().single();
  if (error) throw error;
  const um = await buildUserMap();
  res.status(201).json(fmtMsg(data as DbMessage, um));
});

router.patch("/messages/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data: msg } = await db.from("school_messages").select("recipient_id").eq("id", String(req.params["id"])).maybeSingle();
  if (!msg || String((msg as { recipient_id: string }).recipient_id) !== String(req.user!.id)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { data, error } = await db.from("school_messages").update({ is_read: true }).eq("id", String(req.params["id"])).select().single();
  if (error) throw error;
  const um = await buildUserMap();
  res.json(fmtMsg(data as DbMessage, um));
});

router.delete("/messages/:id", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data: msg } = await db.from("school_messages").select("sender_id, recipient_id").eq("id", String(req.params["id"])).maybeSingle();
  if (!msg) { res.status(404).json({ error: "Not found" }); return; }
  const m = msg as { sender_id: string; recipient_id: string };
  const uid = String(req.user!.id);
  if (m.sender_id !== uid && m.recipient_id !== uid && !MGMT.has(req.user!.role)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { error } = await db.from("school_messages").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

export default router;
