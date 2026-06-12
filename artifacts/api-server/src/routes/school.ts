import { Router, type Request, type Response, type NextFunction } from "express";
import { query } from "../lib/db";
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
  created_at: Date;
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
  created_at: Date;
}

interface DbSession {
  id: string;
  course_id: string;
  course_title: string;
  instructor_id: string;
  room_id: string;
  title: string;
  started_at: Date;
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
    createdAt: u.created_at.toISOString(),
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
    createdAt: c.created_at.toISOString(),
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
    startedAt: s.started_at.toISOString(),
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
  const result = await query<DbUser>(
    "SELECT * FROM school_users WHERE username = $1 LIMIT 1",
    [username.trim()]
  );
  const user = result.rows[0];
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }
  const token = signToken({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await query<DbUser>("SELECT * FROM school_users WHERE id = $1 LIMIT 1", [req.user!.id]);
  const user = result.rows[0];
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

/* ─── Users ─────────────────────────────────────────────────── */

router.get("/users", requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await query<DbUser>("SELECT * FROM school_users ORDER BY id ASC");
  if (req.user!.role === "admin") {
    res.json(result.rows.map((u) => formatUser(u, true)));
  } else {
    res.json(result.rows.filter((u) => u.role === "student").map((u) => formatUser(u, false)));
  }
});

router.post("/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { username, password, name, email, role } = req.body as Record<string, string>;
  if (!username || !password || !name) {
    res.status(400).json({ error: "Username, password, and name are required" });
    return;
  }
  try {
    const result = await query<DbUser>(
      `INSERT INTO school_users (username, password, name, email, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username.trim(), password, name, email || "", role || "student"]
    );
    res.status(201).json(formatUser(result.rows[0]));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("23505")) {
      res.status(409).json({ error: "Username already exists" });
    } else {
      throw err;
    }
  }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params["id"]);
  if (id === req.user!.id) { res.status(400).json({ error: "Cannot delete your own account" }); return; }
  await query("DELETE FROM school_users WHERE id = $1", [id]);
  res.status(204).send();
});

/* ─── Courses ────────────────────────────────────────────────── */

router.get("/courses", requireAuth, async (_req: Request, res: Response) => {
  const result = await query<DbCourse>("SELECT * FROM school_courses ORDER BY created_at ASC");
  res.json(result.rows.map(formatCourse));
});

router.post("/courses", requireAuth, async (req: Request, res: Response) => {
  const { title, description, instructorId, duration, fee, schedule, status } = req.body as Record<string, string>;
  if (!title) { res.status(400).json({ error: "Title is required" }); return; }
  const result = await query<DbCourse>(
    `INSERT INTO school_courses (id, title, description, instructor_id, duration, fee, schedule, students, materials, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10) RETURNING *`,
    [genId(), title, description || "", instructorId || "", duration || "1 month", fee || "", schedule || "", "[]", "[]", status || "active"]
  );
  res.status(201).json(formatCourse(result.rows[0]));
});

router.delete("/courses/:id", requireAuth, async (req: Request, res: Response) => {
  await query("DELETE FROM school_courses WHERE id = $1", [String(req.params["id"])]);
  res.status(204).send();
});

/* ─── Sessions ───────────────────────────────────────────────── */

router.get("/sessions", requireAuth, async (_req: Request, res: Response) => {
  const result = await query<DbSession>("SELECT * FROM school_sessions ORDER BY started_at ASC");
  res.json(result.rows.map(formatSession));
});

router.post("/sessions", requireAuth, async (req: Request, res: Response) => {
  const { courseId, courseTitle, instructorId, roomId, title } = req.body as Record<string, string>;
  const id = genId();
  const result = await query<DbSession>(
    `INSERT INTO school_sessions (id, course_id, course_title, instructor_id, room_id, title, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'live') RETURNING *`,
    [id, courseId || "", courseTitle || "", instructorId || "", roomId || id, title || "Live Class"]
  );
  res.status(201).json(formatSession(result.rows[0]));
});

router.patch("/sessions/:id/end", requireAuth, async (req: Request, res: Response) => {
  await query("UPDATE school_sessions SET status = 'ended' WHERE id = $1", [String(req.params["id"])]);
  res.status(204).send();
});

export default router;
