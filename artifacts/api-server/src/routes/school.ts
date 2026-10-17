import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getSupabase } from "../lib/db";
import { signToken, verifyToken, type JwtPayload } from "../lib/jwt";
import { isEmailConfigured, sendResetCodeEmail } from "../lib/mailer";
import { logger } from "../lib/logger";

const router = Router();
type AuthRequest = Request & { user?: JwtPayload };

const SUPPORTED_ROLES = new Set([
  "student",
  "instructor",
  "admin",
  "super_admin",
]);
const MGMT = new Set(["admin", "super_admin"]);
const STAFF = new Set(["instructor", ...MGMT]);

async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const h = req.headers["authorization"];
  if (!h?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const tokenUser = verifyToken(h.slice(7));
  if (!tokenUser) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  let data: unknown;
  let error: unknown;
  try {
    ({ data, error } = await getSupabase()
      .from("school_users")
      .select("id, username, name, email, role, is_active")
      .eq("id", tokenUser.id)
      .maybeSingle());
  } catch {
    res.status(503).json({ error: "Authentication service unavailable" });
    return;
  }
  if (error) {
    res.status(503).json({ error: "Authentication service unavailable" });
    return;
  }
  const user = data as Omit<DbUser, "password" | "phone" | "created_at"> | null;
  if (!user || user.is_active !== true || !SUPPORTED_ROLES.has(user.role)) {
    res.status(401).json({ error: "This account is no longer authorized" });
    return;
  }

  // The database record, rather than the JWT claim, defines current privileges.
  req.user = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
}

function requireMgmt(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user || !MGMT.has(req.user.role)) {
    res.status(403).json({ error: "Management access required" });
    return;
  }
  next();
}

function requireStaff(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user || !STAFF.has(req.user.role)) {
    res.status(403).json({ error: "Staff access required" });
    return;
  }
  next();
}

// Administrators may manage any course; an instructor only their own.
async function assertCourseAccess(
  req: AuthRequest,
  res: Response,
  courseId: string,
): Promise<boolean> {
  if (!courseId) {
    res.status(400).json({ error: "courseId required" });
    return false;
  }
  if (MGMT.has(req.user!.role)) return true;
  const db = getSupabase();
  const { data } = await db
    .from("school_courses")
    .select("instructor_id")
    .eq("id", courseId)
    .maybeSingle();
  if (
    data &&
    String((data as { instructor_id: string }).instructor_id) ===
      String(req.user!.id)
  )
    return true;
  res.status(403).json({ error: "You can only manage your own courses" });
  return false;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const RESET_TTL_MS = 10 * 60 * 1000;
// Lock a reset code after this many wrong guesses so the 6-digit code can't be brute-forced.
const MAX_RESET_ATTEMPTS = 5;
function genResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ─── DB types ──────────────────────────────────────────────── */
interface DbUser {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active?: boolean;
  created_at: string;
}
interface DbCourse {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  duration: string;
  fee: string;
  students: string[];
  materials: { title: string; url: string }[];
  status: string;
  category?: string;
  created_at: string;
}
interface DbEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  fee: string;
  notes: string;
  enrolled_at: string;
  created_at: string;
}
interface DbPayment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_id: string;
  amount: string;
  status: string;
  method: string;
  reference: string;
  due_date: string | null;
  paid_at: string | null;
  notes: string;
  created_at: string;
}
interface DbGrade {
  id: string;
  student_id: string;
  course_id: string;
  assessment: string;
  score: string;
  max_score: string;
  weight: string;
  grade: string;
  comment: string;
  recorded_by: string;
  created_at: string;
}

/* ─── Formatters ────────────────────────────────────────────── */
const fmtUser = (u: DbUser, pw = true) => ({
  id: String(u.id),
  username: u.username,
  password: pw ? u.password : "",
  name: u.name,
  email: u.email,
  phone: u.phone || "",
  role: u.role,
  isActive: u.is_active ?? true,
  createdAt: u.created_at,
});
const fmtCourse = (c: DbCourse) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  instructorId: c.instructor_id,
  duration: c.duration,
  fee: c.fee,
  students: Array.isArray(c.students) ? c.students : [],
  materials: Array.isArray(c.materials) ? c.materials : [],
  status: c.status,
  category: c.category ?? "",
  createdAt: c.created_at,
});
const fmtEnrollment = (
  e: DbEnrollment,
  um = new Map<string, string>(),
  cm = new Map<string, string>(),
) => ({
  id: e.id,
  studentId: e.student_id,
  studentName: um.get(e.student_id) || "",
  courseId: e.course_id,
  courseTitle: cm.get(e.course_id) || "",
  status: e.status,
  fee: e.fee,
  notes: e.notes,
  enrolledAt: e.enrolled_at,
  createdAt: e.created_at,
});
const fmtPayment = (
  p: DbPayment,
  um = new Map<string, string>(),
  cm = new Map<string, string>(),
) => ({
  id: p.id,
  studentId: p.student_id,
  studentName: um.get(p.student_id) || "",
  courseId: p.course_id,
  courseTitle: cm.get(p.course_id) || "",
  enrollmentId: p.enrollment_id,
  amount: p.amount,
  status: p.status,
  method: p.method,
  reference: p.reference,
  dueDate: p.due_date,
  paidAt: p.paid_at,
  notes: p.notes,
  createdAt: p.created_at,
});
const fmtGrade = (
  g: DbGrade,
  um = new Map<string, string>(),
  cm = new Map<string, string>(),
) => ({
  id: g.id,
  studentId: g.student_id,
  studentName: um.get(g.student_id) || "",
  courseId: g.course_id,
  courseTitle: cm.get(g.course_id) || "",
  assessment: g.assessment,
  score: g.score,
  maxScore: g.max_score,
  weight: g.weight,
  grade: g.grade,
  comment: g.comment,
  recordedBy: g.recorded_by,
  createdAt: g.created_at,
});

async function getNameMaps(db: ReturnType<typeof getSupabase>) {
  const [{ data: users }, { data: courses }] = await Promise.all([
    db.from("school_users").select("id, name"),
    db.from("school_courses").select("id, title"),
  ]);
  const um = new Map<string, string>(
    (users ?? []).map((u: { id: number; name: string }) => [
      String(u.id),
      u.name,
    ]),
  );
  const cm = new Map<string, string>(
    (courses ?? []).map((c: { id: string; title: string }) => [c.id, c.title]),
  );
  return { um, cm };
}

async function activeSuperAdminCount(
  db: ReturnType<typeof getSupabase>,
): Promise<number> {
  const { data, error } = await db
    .from("school_users")
    .select("id")
    .eq("role", "super_admin")
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []).length;
}

/* ─── Auth ─────────────────────────────────────────────────── */
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_users")
    .select("*")
    .eq("username", username.trim())
    .limit(1)
    .single();
  if (error || !data || (data as DbUser).password !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const u = data as DbUser;
  if (u.is_active !== true || !SUPPORTED_ROLES.has(u.role)) {
    res.status(403).json({
      error:
        "This account has been deactivated. Please contact an administrator.",
    });
    return;
  }
  const token = signToken({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
  });
  res.json({ token, user: fmtUser(u) });
});

/* First-run setup: when no super_admin exists, the login screen shows a
   "Create Super Administrator" form instead of demo accounts. */
router.get("/auth/setup-status", async (_req, res) => {
  const db = getSupabase();
  const { count, error } = await db
    .from("school_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (error) {
    res.status(503).json({
      error:
        "Database not ready. Please run the school migrations in Supabase.",
    });
    return;
  }
  res.json({ needsSetup: (count ?? 0) === 0 });
});

router.post("/auth/setup", async (req, res) => {
  const { name, username, email, password } = req.body as Record<
    string,
    string
  >;
  if (!name || !username || !password) {
    res
      .status(400)
      .json({ error: "Name, username, and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const db = getSupabase();
  const { count, error: cErr } = await db
    .from("school_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin");
  if (cErr) {
    res.status(503).json({
      error:
        "Database not ready. Please run the school migrations in Supabase.",
    });
    return;
  }
  if ((count ?? 0) > 0) {
    res
      .status(403)
      .json({ error: "Setup has already been completed. Please sign in." });
    return;
  }
  const { data, error } = await db
    .from("school_users")
    .insert({
      username: username.trim(),
      password,
      name: name.trim(),
      email: (email || "").trim(),
      phone: "",
      role: "super_admin",
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505" || error.message?.includes("unique")) {
      res.status(409).json({ error: "That username is already taken" });
      return;
    }
    throw error;
  }
  const u = data as DbUser;
  const token = signToken({
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: u.role,
  });
  res.status(201).json({ token, user: fmtUser(u) });
});

/* Forgot password — any user can request a one-time code. The code is emailed
   (Resend) and never returned in the response. We always reply with a generic
   { ok: true } so the endpoint can't be used to discover which usernames/emails
   exist. Codes are stored in Supabase (password_reset_codes) for 10 minutes so
   the flow survives across stateless serverless invocations. */
router.post("/auth/forgot-password", async (req, res) => {
  const { identifier } = req.body as { identifier?: string };
  const id = (identifier || "").trim();
  if (!id) {
    res.status(400).json({ error: "Please enter your username or email" });
    return;
  }
  const db = getSupabase();
  let { data } = await db
    .from("school_users")
    .select("id, username, name, email, is_active")
    .eq("username", id)
    .limit(1)
    .maybeSingle();
  if (!data)
    ({ data } = await db
      .from("school_users")
      .select("id, username, name, email, is_active")
      .eq("email", id)
      .limit(1)
      .maybeSingle());

  // Generic response used for every "we can't/​won't send" branch to avoid leaking account existence.
  const generic = { ok: true };

  if (!data) {
    res.json(generic);
    return;
  }
  const u = data as {
    id: number;
    username: string;
    name: string;
    email: string;
    is_active?: boolean;
  };
  // Inactive accounts cannot reset their password.
  if (u.is_active === false) {
    res.json(generic);
    return;
  }
  // No address on file → nothing to email; respond generically (and log for staff follow-up).
  if (!u.email) {
    logger.warn(
      { username: u.username },
      "Password reset requested but no email on file",
    );
    res.json(generic);
    return;
  }

  const code = genResetCode();
  const nowIso = new Date().toISOString();
  // Opportunistically clear expired codes so the table stays small.
  await db.from("password_reset_codes").delete().lt("expires_at", nowIso);
  const { error } = await db.from("password_reset_codes").upsert(
    {
      username_key: u.username.toLowerCase(),
      user_id: u.id,
      code,
      attempts: 0,
      expires_at: new Date(Date.now() + RESET_TTL_MS).toISOString(),
      created_at: nowIso,
    },
    { onConflict: "username_key" },
  );
  if (error) {
    res
      .status(500)
      .json({ error: "Could not start password reset. Please try again." });
    return;
  }

  if (isEmailConfigured()) {
    try {
      await sendResetCodeEmail(u.email, u.name, code);
    } catch (e) {
      logger.error(
        { err: e, username: u.username },
        "Failed to send reset code email",
      );
      res.status(500).json({
        error: "We couldn't send your reset email. Please try again later.",
      });
      return;
    }
  } else if (process.env["NODE_ENV"] === "production") {
    // In production we must never fall back to exposing the code.
    logger.error(
      "Password reset requested but email is not configured (RESEND_API_KEY missing)",
    );
    res.status(500).json({
      error:
        "Password reset is temporarily unavailable. Please contact an administrator.",
    });
    return;
  } else {
    // Dev convenience only: surface the code in server logs (never in the HTTP response).
    logger.warn(
      { username: u.username, code },
      "Email not configured — reset code logged for local dev only",
    );
  }

  res.json(generic);
});

router.post("/auth/reset-password", async (req, res) => {
  const { identifier, code, newPassword } = req.body as {
    identifier?: string;
    code?: string;
    newPassword?: string;
  };
  const idRaw = (identifier || "").trim();
  const c = (code || "").trim();
  if (!idRaw || !c || !newPassword) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (newPassword.length < 6) {
    res
      .status(400)
      .json({ error: "New password must be at least 6 characters" });
    return;
  }
  const db = getSupabase();

  // Resolve the account from a username OR email so the code key (canonical username) is correct.
  let { data: userRow } = await db
    .from("school_users")
    .select("id, username, is_active")
    .eq("username", idRaw)
    .limit(1)
    .maybeSingle();
  if (!userRow)
    ({ data: userRow } = await db
      .from("school_users")
      .select("id, username, is_active")
      .eq("email", idRaw)
      .limit(1)
      .maybeSingle());

  const genericErr =
    "Your code is invalid or has expired. Please request a new one.";
  if (!userRow) {
    res.status(400).json({ error: genericErr });
    return;
  }
  const usr = userRow as { id: number; username: string; is_active?: boolean };
  if (usr.is_active === false) {
    res.status(403).json({
      error:
        "This account has been deactivated. Please contact an administrator.",
    });
    return;
  }

  const key = usr.username.toLowerCase();
  // Verify the code and account for the attempt ATOMICALLY in the DB. A plain
  // read-then-write increment races under concurrent requests (parallel wrong
  // guesses read the same count and overwrite each other), which would let an
  // attacker exceed MAX_RESET_ATTEMPTS. The SQL function locks the row
  // (SELECT ... FOR UPDATE) so concurrent attempts serialize. See
  // supabase/migrations/015_reset_code_atomic_claim.sql.
  const { data: claimRows, error: claimErr } = await db.rpc(
    "claim_password_reset_attempt",
    {
      p_username_key: key,
      p_code: c,
      p_max: MAX_RESET_ATTEMPTS,
    },
  );
  if (claimErr) {
    res
      .status(500)
      .json({ error: "Could not reset your password. Please try again." });
    return;
  }
  const claim = (Array.isArray(claimRows) ? claimRows[0] : claimRows) as
    | {
        status: string;
        out_user_id: number | null;
        out_remaining: number | null;
      }
    | undefined;
  if (!claim || claim.status === "invalid") {
    res.status(400).json({ error: genericErr });
    return;
  }
  if (claim.status === "locked") {
    res.status(429).json({
      error: "Too many incorrect attempts. Please request a new code.",
    });
    return;
  }
  if (claim.status === "wrong") {
    const remaining = claim.out_remaining ?? 0;
    res.status(400).json({
      error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    });
    return;
  }
  // status === "ok": the code matched. Update the password, then delete the code.
  const { error } = await db
    .from("school_users")
    .update({ password: newPassword })
    .eq("id", usr.id);
  if (error) {
    res
      .status(500)
      .json({ error: "Could not reset your password. Please try again." });
    return;
  }
  await db.from("password_reset_codes").delete().eq("username_key", key);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data, error } = await db
    .from("school_users")
    .select("*")
    .eq("id", req.user!.id)
    .single();
  if (error || !data) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(fmtUser(data as DbUser));
});

/* ─── Users ─────────────────────────────────────────────────── */
router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const { data, error } = await db
    .from("school_users")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  const users = (data ?? []) as DbUser[];
  if (MGMT.has(req.user!.role)) {
    res.json(users.map((user) => fmtUser(user)));
    return;
  }
  if (req.user!.role === "instructor") {
    res.json(
      users
        .filter((user) => user.role === "student")
        .map((user) => fmtUser(user, false)),
    );
    return;
  }
  res.json(
    users
      .filter((user) => user.id === req.user!.id)
      .map((user) => fmtUser(user, false)),
  );
});

router.post(
  "/users",
  requireAuth,
  requireMgmt,
  async (req: AuthRequest, res) => {
    const { username, password, name, email, phone, role } = req.body as Record<
      string,
      string
    >;
    if (!username || !password || !name) {
      res.status(400).json({ error: "Username, password, and name required" });
      return;
    }
    const accountRole = role || "student";
    if (!SUPPORTED_ROLES.has(accountRole)) {
      res.status(400).json({ error: "Unsupported academy role" });
      return;
    }
    if (accountRole === "super_admin" && req.user!.role !== "super_admin") {
      res.status(403).json({ error: "Super administrator access required" });
      return;
    }
    const db = getSupabase();
    const { data, error } = await db
      .from("school_users")
      .insert({
        username: username.trim(),
        password,
        name,
        email: email || "",
        phone: phone || "",
        role: accountRole,
      })
      .select()
      .single();
    if (error) {
      if (error.code === "23505" || error.message?.includes("unique"))
        res.status(409).json({ error: "Username already exists" });
      else throw error;
      return;
    }
    res.status(201).json(fmtUser(data as DbUser));
  },
);

router.patch(
  "/users/:id",
  requireAuth,
  requireMgmt,
  async (req: AuthRequest, res) => {
    const id = Number(req.params["id"]);
    const { name, email, phone, role, password, isActive } = req.body as Record<
      string,
      string | boolean
    >;
    const db = getSupabase();
    const { data: existing, error: existingError } = await db
      .from("school_users")
      .select("id, role, is_active")
      .eq("id", id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const target = existing as { role: string; is_active: boolean };
    const accountRole = typeof role === "string" ? role : target.role;
    const accountIsActive =
      typeof isActive === "boolean" ? isActive : target.is_active;
    if (id === req.user!.id && (!accountIsActive || !MGMT.has(accountRole))) {
      res
        .status(400)
        .json({ error: "Cannot deactivate or demote your own account" });
      return;
    }
    if (typeof role === "string" && !SUPPORTED_ROLES.has(accountRole)) {
      res.status(400).json({ error: "Unsupported academy role" });
      return;
    }
    if (
      (target.role === "super_admin" || accountRole === "super_admin") &&
      req.user!.role !== "super_admin"
    ) {
      res.status(403).json({ error: "Super administrator access required" });
      return;
    }
    if (isActive === true && !SUPPORTED_ROLES.has(accountRole)) {
      res.status(400).json({ error: "Unsupported roles cannot be activated" });
      return;
    }
    if (
      target.role === "super_admin" &&
      target.is_active &&
      (!accountIsActive || accountRole !== "super_admin") &&
      (await activeSuperAdminCount(db)) <= 1
    ) {
      res
        .status(409)
        .json({ error: "At least one active super administrator is required" });
      return;
    }

    const upd: Record<string, string | boolean> = {};
    if (name) upd["name"] = name;
    if (email !== undefined) upd["email"] = email;
    if (phone !== undefined) upd["phone"] = phone;
    if (typeof role === "string") upd["role"] = role;
    if (password) upd["password"] = password;
    if (typeof isActive === "boolean") upd["is_active"] = isActive;
    const { data, error } = await db
      .from("school_users")
      .update(upd)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(fmtUser(data as DbUser));
  },
);

router.delete(
  "/users/:id",
  requireAuth,
  requireMgmt,
  async (req: AuthRequest, res) => {
    const id = Number(req.params["id"]);
    if (id === req.user!.id) {
      res.status(400).json({ error: "Cannot delete your own account" });
      return;
    }
    const db = getSupabase();
    const { data: existing, error: existingError } = await db
      .from("school_users")
      .select("role, is_active")
      .eq("id", id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const target = existing as { role: string; is_active: boolean };
    if (target.role === "super_admin" && req.user!.role !== "super_admin") {
      res.status(403).json({ error: "Super administrator access required" });
      return;
    }
    if (
      target.role === "super_admin" &&
      target.is_active &&
      (await activeSuperAdminCount(db)) <= 1
    ) {
      res
        .status(409)
        .json({ error: "At least one active super administrator is required" });
      return;
    }
    const { error } = await db.from("school_users").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  },
);

/* ─── Courses ────────────────────────────────────────────────── */
router.get("/courses", requireAuth, async (_req, res) => {
  const db = getSupabase();
  const { data, error } = await db
    .from("school_courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  res.json(((data ?? []) as DbCourse[]).map(fmtCourse));
});

router.post("/courses", requireAuth, requireMgmt, async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    res.status(400).json({ error: "Course payload required" });
    return;
  }
  if ("schedule" in req.body || "capacity" in req.body) {
    res.status(400).json({
      error: "schedule and capacity are not supported for self-paced courses",
    });
    return;
  }
  const { title, description, instructorId, duration, fee, status, category } =
    req.body as Record<string, string>;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_courses")
    .insert({
      id: genId(),
      title,
      description: description || "",
      instructor_id: instructorId || "",
      duration: duration || "1 month",
      fee: fee || "",
      students: [],
      materials: [],
      status: status || "active",
      category: category || "",
    })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(fmtCourse(data as DbCourse));
});

router.patch("/courses/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    res.status(400).json({ error: "Course payload required" });
    return;
  }
  if ("schedule" in req.body || "capacity" in req.body) {
    res.status(400).json({
      error: "schedule and capacity are not supported for self-paced courses",
    });
    return;
  }
  const { title, description, instructorId, duration, fee, status, category } =
    req.body as Record<string, string>;
  const upd: Record<string, unknown> = {};
  if (title) upd["title"] = title;
  if (description !== undefined) upd["description"] = description;
  if (instructorId !== undefined) upd["instructor_id"] = instructorId;
  if (duration) upd["duration"] = duration;
  if (fee !== undefined) upd["fee"] = fee;
  if (status) upd["status"] = status;
  if (category !== undefined) upd["category"] = category;
  const db = getSupabase();
  const { data, error } = await db
    .from("school_courses")
    .update(upd)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  res.json(fmtCourse(data as DbCourse));
});

router.delete("/courses/:id", requireAuth, requireMgmt, async (req, res) => {
  const db = getSupabase();
  const { error } = await db
    .from("school_courses")
    .delete()
    .eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

// Instructors manage materials for their own courses; administrators may manage any course.
router.patch(
  "/courses/:id/materials",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const id = String(req.params["id"]);
    if (!(await assertCourseAccess(req, res, id))) return;
    const { materials } = req.body as {
      materials: { title: string; url: string }[];
    };
    const db = getSupabase();
    const { data, error } = await db
      .from("school_courses")
      .update({ materials: Array.isArray(materials) ? materials : [] })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json(fmtCourse(data as DbCourse));
  },
);

/* ─── Enrollments ────────────────────────────────────────────── */
router.get("/enrollments", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  let q = db.from("school_enrollments").select("*");
  const role = req.user!.role;
  const userId = String(req.user!.id);
  if (role === "student") {
    q = q.eq("student_id", userId);
  } else if (role === "instructor") {
    const { data: courses } = await db
      .from("school_courses")
      .select("id")
      .eq("instructor_id", userId);
    const courseIds = (courses ?? []).map(
      (course: { id: string }) => course.id,
    );
    if (courseIds.length === 0) {
      res.json([]);
      return;
    }
    q = q.in("course_id", courseIds);
  }
  if (req.query["courseId"])
    q = q.eq("course_id", String(req.query["courseId"]));
  if (req.query["studentId"] && role !== "student")
    q = q.eq("student_id", String(req.query["studentId"]));
  if (req.query["status"]) q = q.eq("status", String(req.query["status"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(
    ((data ?? []) as DbEnrollment[]).map((e) => fmtEnrollment(e, um, cm)),
  );
});

router.post("/enrollments", requireAuth, requireMgmt, async (req, res) => {
  const { studentId, courseId, fee, notes } = req.body as Record<
    string,
    string
  >;
  if (!studentId || !courseId) {
    res.status(400).json({ error: "studentId and courseId required" });
    return;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_enrollments")
    .insert({
      id: genId(),
      student_id: studentId,
      course_id: courseId,
      status: "pending",
      fee: fee || "",
      notes: notes || "",
    })
    .select()
    .single();
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
  const { data, error } = await db
    .from("school_enrollments")
    .update(upd)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(fmtEnrollment(data as DbEnrollment, um, cm));
});

router.delete(
  "/enrollments/:id",
  requireAuth,
  requireMgmt,
  async (req, res) => {
    const db = getSupabase();
    const { error } = await db
      .from("school_enrollments")
      .delete()
      .eq("id", String(req.params["id"]));
    if (error) throw error;
    res.status(204).send();
  },
);

/* ─── Payments ───────────────────────────────────────────────── */
router.get("/payments", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const role = req.user!.role;
  const uid = String(req.user!.id);
  let q = db.from("school_payments").select("*");
  if (MGMT.has(role)) {
    if (req.query["studentId"])
      q = q.eq("student_id", String(req.query["studentId"]));
  } else {
    q = q.eq("student_id", uid);
  }
  if (req.query["status"]) q = q.eq("status", String(req.query["status"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbPayment[]).map((p) => fmtPayment(p, um, cm)));
});

router.post("/payments", requireAuth, requireMgmt, async (req, res) => {
  const {
    studentId,
    courseId,
    enrollmentId,
    amount,
    method,
    reference,
    dueDate,
    notes,
  } = req.body as Record<string, string>;
  if (!studentId || !courseId || !amount) {
    res.status(400).json({ error: "studentId, courseId, and amount required" });
    return;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_payments")
    .insert({
      id: genId(),
      student_id: studentId,
      course_id: courseId,
      enrollment_id: enrollmentId || "",
      amount,
      status: "pending",
      method: method || "",
      reference: reference || "",
      due_date: dueDate || null,
      paid_at: null,
      notes: notes || "",
    })
    .select()
    .single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.status(201).json(fmtPayment(data as DbPayment, um, cm));
});

router.patch("/payments/:id", requireAuth, requireMgmt, async (req, res) => {
  const id = String(req.params["id"]);
  const { status, method, reference, paidAt, notes } = req.body as Record<
    string,
    string
  >;
  const upd: Record<string, string | null> = {};
  if (status) {
    upd["status"] = status;
    if (status === "paid" && !paidAt) upd["paid_at"] = new Date().toISOString();
  }
  if (method !== undefined) upd["method"] = method;
  if (reference !== undefined) upd["reference"] = reference;
  if (paidAt !== undefined) upd["paid_at"] = paidAt || null;
  if (notes !== undefined) upd["notes"] = notes;
  const db = getSupabase();
  const { data, error } = await db
    .from("school_payments")
    .update(upd)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(fmtPayment(data as DbPayment, um, cm));
});

/* ─── Grades ─────────────────────────────────────────────────── */
router.get("/grades", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const role = req.user!.role;
  const uid = String(req.user!.id);
  let q = db.from("school_grades").select("*");
  if (role === "student") {
    q = q.eq("student_id", uid);
  } else if (role === "instructor") {
    const { data: courses } = await db
      .from("school_courses")
      .select("id")
      .eq("instructor_id", uid);
    const courseIds = (courses ?? []).map(
      (course: { id: string }) => course.id,
    );
    if (courseIds.length === 0) {
      res.json([]);
      return;
    }
    q = q.in("course_id", courseIds);
  }
  if (req.query["studentId"] && role !== "student")
    q = q.eq("student_id", String(req.query["studentId"]));
  if (req.query["courseId"])
    q = q.eq("course_id", String(req.query["courseId"]));
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const { um, cm } = await getNameMaps(db);
  res.json(((data ?? []) as DbGrade[]).map((grade) => fmtGrade(grade, um, cm)));
});

router.post(
  "/grades",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const {
      studentId,
      courseId,
      assessment,
      score,
      maxScore,
      weight,
      grade,
      comment,
    } = req.body as Record<string, string>;
    if (!studentId || !courseId || !assessment) {
      res
        .status(400)
        .json({ error: "studentId, courseId, and assessment required" });
      return;
    }
    if (!(await assertCourseAccess(req, res, courseId))) return;
    const db = getSupabase();
    const { data, error } = await db
      .from("school_grades")
      .insert({
        id: genId(),
        student_id: studentId,
        course_id: courseId,
        assessment,
        score: score || "0",
        max_score: maxScore || "100",
        weight: weight || "",
        grade: grade || "",
        comment: comment || "",
        recorded_by: String(req.user!.id),
      })
      .select()
      .single();
    if (error) throw error;
    const { um, cm } = await getNameMaps(db);
    res.status(201).json(fmtGrade(data as DbGrade, um, cm));
  },
);

router.patch(
  "/grades/:id",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const id = String(req.params["id"]);
    const { assessment, score, maxScore, weight, grade, comment } =
      req.body as Record<string, string>;
    const upd: Record<string, string> = {};
    if (assessment) upd["assessment"] = assessment;
    if (score !== undefined) upd["score"] = score;
    if (maxScore !== undefined) upd["max_score"] = maxScore;
    if (weight !== undefined) upd["weight"] = weight;
    if (grade !== undefined) upd["grade"] = grade;
    if (comment !== undefined) upd["comment"] = comment;
    const db = getSupabase();
    const { data: row } = await db
      .from("school_grades")
      .select("course_id")
      .eq("id", id)
      .maybeSingle();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (
      !(await assertCourseAccess(
        req,
        res,
        String((row as { course_id: string }).course_id),
      ))
    )
      return;
    const { data, error } = await db
      .from("school_grades")
      .update(upd)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const { um, cm } = await getNameMaps(db);
    res.json(fmtGrade(data as DbGrade, um, cm));
  },
);

router.delete(
  "/grades/:id",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const db = getSupabase();
    const { data: row } = await db
      .from("school_grades")
      .select("course_id")
      .eq("id", String(req.params["id"]))
      .maybeSingle();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (
      !(await assertCourseAccess(
        req,
        res,
        String((row as { course_id: string }).course_id),
      ))
    )
      return;
    const { error } = await db
      .from("school_grades")
      .delete()
      .eq("id", String(req.params["id"]));
    if (error) throw error;
    res.status(204).send();
  },
);

/* ─── Reports ────────────────────────────────────────────────── */
router.get("/reports/overview", requireAuth, requireMgmt, async (_req, res) => {
  const db = getSupabase();
  const [
    { data: users },
    { data: courses },
    { data: enrollments },
    { data: quizzes },
    { data: grades },
    { data: payments },
  ] = await Promise.all([
    db.from("school_users").select("id, role, is_active"),
    db.from("school_courses").select("id, status"),
    db.from("school_enrollments").select("id, status"),
    db.from("school_quizzes").select("id, status"),
    db.from("school_grades").select("id"),
    db.from("school_payments").select("id, status"),
  ]);
  const u = (users ?? []) as { id: number; role: string; is_active: boolean }[];
  const c = (courses ?? []) as { id: string; status: string }[];
  const e = (enrollments ?? []) as { id: string; status: string }[];
  const q = (quizzes ?? []) as { id: string; status: string }[];
  const g = (grades ?? []) as { id: string }[];
  const p = (payments ?? []) as { id: string; status: string }[];
  const activeUsers = u.filter(
    (user) => user.is_active && SUPPORTED_ROLES.has(user.role),
  );
  res.json({
    totalUsers: activeUsers.length,
    totalStudents: activeUsers.filter((user) => user.role === "student").length,
    totalInstructors: activeUsers.filter((user) => user.role === "instructor")
      .length,
    totalManagement: activeUsers.filter((user) => MGMT.has(user.role)).length,
    totalCourses: c.length,
    activeCourses: c.filter((course) => course.status === "active").length,
    totalEnrollments: e.length,
    activeEnrollments: e.filter((enrollment) => enrollment.status === "active")
      .length,
    pendingEnrollments: e.filter(
      (enrollment) => enrollment.status === "pending",
    ).length,
    totalQuizzes: q.length,
    publishedQuizzes: q.filter((quiz) => quiz.status === "published").length,
    totalGrades: g.length,
    totalPayments: p.length,
    paidPayments: p.filter((payment) => payment.status === "paid").length,
    pendingPayments: p.filter(
      (payment) => payment.status === "pending" || payment.status === "overdue",
    ).length,
  });
});

const buildCourseMap = async (): Promise<
  Map<string, { title: string; instructorId: string }>
> => {
  const { data } = await getSupabase()
    .from("school_courses")
    .select("id, title, instructor_id");
  return new Map<string, { title: string; instructorId: string }>(
    (data ?? []).map(
      (course: { id: string; title: string; instructor_id: string }) => [
        course.id,
        { title: course.title, instructorId: String(course.instructor_id) },
      ],
    ),
  );
};

const buildUserMap = async (): Promise<Map<string, string>> => {
  const { data } = await getSupabase().from("school_users").select("id, name");
  return new Map<string, string>(
    (data ?? []).map((user: { id: number; name: string }) => [
      String(user.id),
      user.name,
    ]),
  );
};

/* ─── Quizzes ────────────────────────────────────────────────── */
interface DbQuestion {
  id: string;
  type: string;
  text: string;
  options?: string[];
  correct?: string;
}
interface DbQuiz {
  id: string;
  course_id: string;
  title: string;
  instructions: string;
  due_date: string | null;
  time_limit_mins: number;
  status: string;
  questions: DbQuestion[];
  created_by: string;
  created_at: string;
}
interface DbQuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, string>;
  score: number;
  max_score: number;
  submitted_at: string;
  created_at: string;
}

const fmtQuiz = (
  q: DbQuiz,
  cm: Map<string, { title: string; instructorId: string }>,
  stripAnswers = false,
) => ({
  id: q.id,
  courseId: q.course_id,
  courseTitle: cm.get(q.course_id)?.title || "",
  title: q.title,
  instructions: q.instructions,
  dueDate: q.due_date,
  timeLimitMins: q.time_limit_mins,
  status: q.status,
  questions: stripAnswers
    ? q.questions.map(({ correct: _c, ...rest }) => rest)
    : q.questions,
  createdBy: q.created_by,
  createdAt: q.created_at,
});

router.get("/quizzes", requireAuth, async (req: AuthRequest, res) => {
  const db = getSupabase();
  const role = req.user!.role;
  const uid = String(req.user!.id);
  let q = db.from("school_quizzes").select("*");
  if (!MGMT.has(role)) {
    if (role === "instructor") {
      const { data: courses } = await db
        .from("school_courses")
        .select("id")
        .eq("instructor_id", uid);
      const ids = (courses ?? []).map((c: { id: string }) => c.id);
      if (ids.length === 0) {
        res.json([]);
        return;
      }
      q = q.in("course_id", ids);
    } else {
      const { data: enrollments } = await db
        .from("school_enrollments")
        .select("course_id")
        .eq("student_id", uid)
        .neq("status", "withdrawn");
      const ids = (enrollments ?? []).map(
        (e: { course_id: string }) => e.course_id,
      );
      if (ids.length === 0) {
        res.json([]);
        return;
      }
      q = q.in("course_id", ids).eq("status", "published");
    }
  }
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  const cm = await buildCourseMap();
  const isStudent = role === "student";

  res.json(
    ((data ?? []) as DbQuiz[]).map((quiz) => fmtQuiz(quiz, cm, isStudent)),
  );
});

router.post(
  "/quizzes",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const {
      courseId,
      title,
      instructions,
      dueDate,
      timeLimitMins,
      status,
      questions,
    } = req.body as Record<string, unknown>;
    if (!courseId || !title) {
      res.status(400).json({ error: "courseId and title required" });
      return;
    }
    if (!(await assertCourseAccess(req, res, String(courseId)))) return;
    const db = getSupabase();
    const { data, error } = await db
      .from("school_quizzes")
      .insert({
        id: genId(),
        course_id: String(courseId),
        title: String(title),
        instructions: String(instructions || ""),
        due_date: dueDate || null,
        time_limit_mins: Number(timeLimitMins) || 0,
        status: String(status || "draft"),
        questions: questions || [],
        created_by: String(req.user!.id),
      })
      .select()
      .single();
    if (error) throw error;
    const cm = await buildCourseMap();
    res.status(201).json(fmtQuiz(data as DbQuiz, cm));
  },
);

router.patch(
  "/quizzes/:id",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const id = String(req.params["id"]);
    const db = getSupabase();
    const { data: existing, error: fetchErr } = await db
      .from("school_quizzes")
      .select("course_id")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    if (
      !(await assertCourseAccess(
        req,
        res,
        (existing as { course_id: string }).course_id,
      ))
    )
      return;
    const { title, instructions, dueDate, timeLimitMins, status, questions } =
      req.body as Record<string, unknown>;
    const upd: Record<string, unknown> = {};
    if (title !== undefined) upd["title"] = title;
    if (instructions !== undefined) upd["instructions"] = instructions;
    if (dueDate !== undefined) upd["due_date"] = dueDate || null;
    if (timeLimitMins !== undefined)
      upd["time_limit_mins"] = Number(timeLimitMins);
    if (status !== undefined) upd["status"] = status;
    if (questions !== undefined) upd["questions"] = questions;
    const { data, error } = await db
      .from("school_quizzes")
      .update(upd)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const cm = await buildCourseMap();
    res.json(fmtQuiz(data as DbQuiz, cm));
  },
);

router.delete(
  "/quizzes/:id",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const id = String(req.params["id"]);
    const db = getSupabase();
    const { data: existing, error: fetchErr } = await db
      .from("school_quizzes")
      .select("course_id")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    if (
      !(await assertCourseAccess(
        req,
        res,
        (existing as { course_id: string }).course_id,
      ))
    )
      return;
    const { error } = await db.from("school_quizzes").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  },
);

router.post(
  "/quizzes/:id/submit",
  requireAuth,
  async (req: AuthRequest, res) => {
    const quizId = String(req.params["id"]);
    const uid = String(req.user!.id);
    const role = req.user!.role;
    const answers = (req.body.answers || {}) as Record<string, string>;
    const db = getSupabase();
    const { data: quizData, error: qErr } = await db
      .from("school_quizzes")
      .select("*")
      .eq("id", quizId)
      .maybeSingle();
    if (qErr) throw qErr;
    if (!quizData) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    const quiz = quizData as DbQuiz;
    if (quiz.status !== "published") {
      res.status(403).json({ error: "Quiz is not published" });
      return;
    }
    if (role !== "student") {
      res.status(403).json({ error: "Only students can submit quizzes" });
      return;
    }
    const { data: enr } = await db
      .from("school_enrollments")
      .select("id")
      .eq("student_id", uid)
      .eq("course_id", quiz.course_id)
      .neq("status", "withdrawn")
      .limit(1)
      .maybeSingle();
    if (!enr) {
      res.status(403).json({ error: "Not enrolled in this course" });
      return;
    }
    let score = 0,
      maxScore = 0;
    for (const q of quiz.questions) {
      if (q.type === "mcq" || q.type === "true_false") {
        maxScore++;
        if (q.correct && answers[q.id] === q.correct) score++;
      }
    }
    const { data: sub, error: sErr } = await db
      .from("school_quiz_submissions")
      .insert({
        id: genId(),
        quiz_id: quizId,
        student_id: uid,
        answers,
        score,
        max_score: maxScore,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (sErr) throw sErr;
    if (maxScore > 0) {
      try {
        await db.from("school_grades").insert({
          id: genId(),
          student_id: uid,
          course_id: quiz.course_id,
          assessment: quiz.title,
          score: String(score),
          max_score: String(maxScore),
          weight: "",
          grade: "",
          comment: "Auto-graded quiz",
          recorded_by: "system",
        });
      } catch {}
    }
    const s = sub as DbQuizSubmission;
    res.status(201).json({
      id: s.id,
      quizId: s.quiz_id,
      studentId: s.student_id,
      answers: s.answers,
      score,
      maxScore,
      submittedAt: s.submitted_at,
      createdAt: s.created_at,
    });
  },
);

router.get(
  "/quizzes/:id/submissions",
  requireAuth,
  requireStaff,
  async (req: AuthRequest, res) => {
    const id = String(req.params["id"]);
    const db = getSupabase();
    const { data: existing, error: fetchErr } = await db
      .from("school_quizzes")
      .select("course_id")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    if (
      !(await assertCourseAccess(
        req,
        res,
        (existing as { course_id: string }).course_id,
      ))
    )
      return;
    const { data, error } = await db
      .from("school_quiz_submissions")
      .select("*")
      .eq("quiz_id", id)
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    const um = await buildUserMap();
    res.json(
      ((data ?? []) as DbQuizSubmission[]).map((s) => ({
        id: s.id,
        quizId: s.quiz_id,
        studentId: s.student_id,
        studentName: um.get(s.student_id) || "",
        answers: s.answers,
        score: s.score,
        maxScore: s.max_score,
        submittedAt: s.submitted_at,
        createdAt: s.created_at,
      })),
    );
  },
);

router.get(
  "/quizzes/:id/my-submission",
  requireAuth,
  async (req: AuthRequest, res) => {
    if (req.user!.role !== "student") {
      res.status(403).json({ error: "Student access required" });
      return;
    }
    const db = getSupabase();
    const { data, error } = await db
      .from("school_quiz_submissions")
      .select("*")
      .eq("quiz_id", String(req.params["id"]))
      .eq("student_id", String(req.user!.id))
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.json(null);
      return;
    }
    const s = data as DbQuizSubmission;
    res.json({
      id: s.id,
      quizId: s.quiz_id,
      studentId: s.student_id,
      answers: s.answers,
      score: s.score,
      maxScore: s.max_score,
      submittedAt: s.submitted_at,
      createdAt: s.created_at,
    });
  },
);

/* ─── Report: Academic ───────────────────────────────────────── */
router.get("/reports/academic", requireAuth, requireMgmt, async (_req, res) => {
  const db = getSupabase();
  const [{ data: enrollments }, { data: grades }, { data: courses }] =
    await Promise.all([
      db.from("school_enrollments").select("id, enrolled_at, created_at"),
      db.from("school_grades").select("id, course_id, score, max_score"),
      db.from("school_courses").select("id, title"),
    ]);
  const courseMap = new Map<string, string>(
    (courses ?? []).map((c: { id: string; title: string }) => [c.id, c.title]),
  );
  const now = new Date();
  const months: Record<string, { label: string; count: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[k] = {
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      count: 0,
    };
  }
  (enrollments ?? []).forEach(
    (e: { enrolled_at?: string; created_at: string }) => {
      const k = (e.enrolled_at || e.created_at || "").slice(0, 7);
      if (k in months) months[k].count++;
    },
  );
  const enrollmentTrend = Object.values(months).map((m) => ({
    month: m.label,
    count: m.count,
  }));
  const gradesBandCount: Record<string, number> = {
    "A (90-100)": 0,
    "B (75-89)": 0,
    "C (60-74)": 0,
    "D (50-59)": 0,
    "F (<50)": 0,
  };
  let pass = 0,
    fail = 0;
  const byCourse: Record<
    string,
    { total: number; count: number; title: string }
  > = {};
  (grades ?? []).forEach(
    (g: { course_id: string; score: string; max_score: string }) => {
      const pct =
        parseFloat(g.max_score) > 0
          ? (parseFloat(g.score) / parseFloat(g.max_score)) * 100
          : 0;
      if (pct >= 90) gradesBandCount["A (90-100)"]++;
      else if (pct >= 75) gradesBandCount["B (75-89)"]++;
      else if (pct >= 60) gradesBandCount["C (60-74)"]++;
      else if (pct >= 50) gradesBandCount["D (50-59)"]++;
      else gradesBandCount["F (<50)"]++;
      if (pct >= 50) pass++;
      else fail++;
      if (!byCourse[g.course_id])
        byCourse[g.course_id] = {
          total: 0,
          count: 0,
          title: courseMap.get(g.course_id) || g.course_id,
        };
      byCourse[g.course_id].total += pct;
      byCourse[g.course_id].count++;
    },
  );
  const gradeByBand = Object.entries(gradesBandCount).map(([band, count]) => ({
    band,
    count,
  }));
  const passFail = [
    { name: "Pass", value: pass },
    { name: "Fail", value: fail },
  ];
  const gradesByCourse = Object.values(byCourse)
    .map((c) => ({
      course: c.title.length > 22 ? c.title.slice(0, 20) + "…" : c.title,
      avg: Math.round(c.total / c.count),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);
  res.json({ enrollmentTrend, gradeByBand, passFail, gradesByCourse });
});

/* ─── Report: Finance ────────────────────────────────────────── */
router.get("/reports/finance", requireAuth, requireMgmt, async (_req, res) => {
  const db = getSupabase();
  const { data: payments } = await db
    .from("school_payments")
    .select("id, amount, status, paid_at, created_at");
  const numFn = (s: string) =>
    parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const now = new Date();
  const months: Record<string, { label: string; revenue: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months[k] = {
      label: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      revenue: 0,
    };
  }
  const all = (payments ?? []) as {
    status: string;
    amount: string;
    paid_at: string | null;
    created_at: string;
  }[];
  all
    .filter((p) => p.status === "paid" && p.paid_at)
    .forEach((p) => {
      const k = p.paid_at!.slice(0, 7);
      if (k in months) months[k].revenue += numFn(p.amount);
    });
  const revenueTrend = Object.values(months).map((m) => ({
    month: m.label,
    revenue: parseFloat(m.revenue.toFixed(2)),
  }));
  const statusCounts: Record<string, number> = {};
  all.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  const paymentStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));
  const totalCollected = all
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + numFn(p.amount), 0);
  const totalOutstanding = all
    .filter((p) => p.status === "pending" || p.status === "overdue")
    .reduce((s, p) => s + numFn(p.amount), 0);
  res.json({
    revenueTrend,
    paymentStatus,
    totalCollected: parseFloat(totalCollected.toFixed(2)),
    totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
  });
});

export default router;
