import { Router, type Request, type Response, type NextFunction } from "express";
import { getSupabase } from "../lib/db";
import { signToken, verifyToken, type JwtPayload } from "../lib/jwt";

const router = Router();

type AuthRequest = Request & { user?: JwtPayload };

function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.user = payload;
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface DbUser {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface DbCourse {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  duration: string;
  fee: string;
  schedule: string;
  students: string[];
  materials: { title: string; url: string }[];
  status: string;
  created_at: string;
}

interface DbSession {
  id: string;
  course_id: string;
  course_title: string;
  instructor_id: string;
  room_id: string;
  title: string;
  started_at: string;
  status: string;
}

function formatUser(u: DbUser, includePassword = true) {
  return {
    id: String(u.id),
    username: u.username,
    password: includePassword ? u.password : "",
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.created_at,
  };
}

function formatCourse(c: DbCourse) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    instructorId: c.instructor_id,
    duration: c.duration,
    fee: c.fee,
    schedule: c.schedule,
    students: Array.isArray(c.students) ? c.students : [],
    materials: Array.isArray(c.materials) ? c.materials : [],
    status: c.status,
    createdAt: c.created_at,
  };
}

function formatSession(s: DbSession) {
  return {
    id: s.id,
    courseId: s.course_id,
    courseTitle: s.course_title,
    instructorId: s.instructor_id,
    roomId: s.room_id,
    title: s.title,
    startedAt: s.started_at,
    status: s.status,
  };
}

/* ─── Auth ─────────────────────────────────────────────────── */

router.post("/auth/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
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
  const user = data as DbUser;
  const token = signToken({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_users").select("*").eq("id", req.user!.id).single();
  if (error || !data) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(data as DbUser));
});

/* ─── Users ─────────────────────────────────────────────────── */

router.get("/users", requireAuth, async (req: AuthRequest, res: Response) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_users").select("*").order("id", { ascending: true });
  if (error) throw error;
  const users = (data ?? []) as DbUser[];
  if (req.user!.role === "admin") {
    res.json(users.map((u) => formatUser(u, true)));
  } else {
    res.json(users.filter((u) => u.role === "student").map((u) => formatUser(u, false)));
  }
});

router.post("/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { username, password, name, email, role } = req.body as Record<string, string>;
  if (!username || !password || !name) {
    res.status(400).json({ error: "Username, password, and name are required" });
    return;
  }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_users")
    .insert({ username: username.trim(), password, name, email: email || "", role: role || "student" })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" || error.message?.includes("unique")) {
      res.status(409).json({ error: "Username already exists" });
    } else {
      throw error;
    }
    return;
  }
  res.status(201).json(formatUser(data as DbUser));
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params["id"]);
  if (id === req.user!.id) { res.status(400).json({ error: "Cannot delete your own account" }); return; }
  const db = getSupabase();
  const { error } = await db.from("school_users").delete().eq("id", id);
  if (error) throw error;
  res.status(204).send();
});

/* ─── Courses ────────────────────────────────────────────────── */

router.get("/courses", requireAuth, async (_req: Request, res: Response) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_courses").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  res.json(((data ?? []) as DbCourse[]).map(formatCourse));
});

router.post("/courses", requireAuth, async (req: Request, res: Response) => {
  const { title, description, instructorId, duration, fee, schedule, status } = req.body as Record<string, string>;
  if (!title) { res.status(400).json({ error: "Title is required" }); return; }
  const db = getSupabase();
  const { data, error } = await db
    .from("school_courses")
    .insert({
      id: genId(), title,
      description: description || "",
      instructor_id: instructorId || "",
      duration: duration || "1 month",
      fee: fee || "",
      schedule: schedule || "",
      students: [],
      materials: [],
      status: status || "active",
    })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(formatCourse(data as DbCourse));
});

router.delete("/courses/:id", requireAuth, async (req: Request, res: Response) => {
  const db = getSupabase();
  const { error } = await db.from("school_courses").delete().eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

/* ─── Sessions ───────────────────────────────────────────────── */

router.get("/sessions", requireAuth, async (_req: Request, res: Response) => {
  const db = getSupabase();
  const { data, error } = await db.from("school_sessions").select("*").order("started_at", { ascending: true });
  if (error) throw error;
  res.json(((data ?? []) as DbSession[]).map(formatSession));
});

router.post("/sessions", requireAuth, async (req: Request, res: Response) => {
  const { courseId, courseTitle, instructorId, roomId, title } = req.body as Record<string, string>;
  const id = genId();
  const db = getSupabase();
  const { data, error } = await db
    .from("school_sessions")
    .insert({
      id,
      course_id: courseId || "",
      course_title: courseTitle || "",
      instructor_id: instructorId || "",
      room_id: roomId || id,
      title: title || "Live Class",
      status: "live",
    })
    .select()
    .single();
  if (error) throw error;
  res.status(201).json(formatSession(data as DbSession));
});

router.patch("/sessions/:id/end", requireAuth, async (req: Request, res: Response) => {
  const db = getSupabase();
  const { error } = await db
    .from("school_sessions")
    .update({ status: "ended" })
    .eq("id", String(req.params["id"]));
  if (error) throw error;
  res.status(204).send();
});

export default router;
