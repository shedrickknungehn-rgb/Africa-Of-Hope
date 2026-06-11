import { Router, type Request, type Response, type NextFunction } from "express";
import { db, schoolUsersTable, schoolCoursesTable, schoolSessionsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
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

function formatUser(u: { id: number; username: string; password: string; name: string; email: string; role: string; createdAt: Date }, includePassword = true) {
  return {
    id: String(u.id),
    username: u.username,
    password: includePassword ? u.password : "",
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

function formatCourse(c: typeof schoolCoursesTable.$inferSelect) {
  return {
    ...c,
    students: (c.students as string[]) || [],
    materials: (c.materials as { title: string; url: string }[]) || [],
    createdAt: c.createdAt.toISOString(),
  };
}

function formatSession(s: typeof schoolSessionsTable.$inferSelect) {
  return { ...s, startedAt: s.startedAt.toISOString() };
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ─── Auth ─────────────────────────────────────────────────── */

router.post("/auth/login", async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [user] = await db
    .select()
    .from(schoolUsersTable)
    .where(eq(schoolUsersTable.username, username.trim()))
    .limit(1);

  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const token = signToken({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
  res.json({ token, user: formatUser(user) });
});

router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  const [user] = await db.select().from(schoolUsersTable).where(eq(schoolUsersTable.id, req.user!.id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

/* ─── Users ─────────────────────────────────────────────────── */

router.get("/users", requireAuth, async (req: AuthRequest, res: Response) => {
  const users = await db.select().from(schoolUsersTable).orderBy(asc(schoolUsersTable.id));
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
  try {
    const [user] = await db
      .insert(schoolUsersTable)
      .values({ username: username.trim(), password, name, email: email || "", role: role || "student" })
      .returning();
    res.status(201).json(formatUser(user));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      res.status(409).json({ error: "Username already exists" });
    } else {
      throw err;
    }
  }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params["id"]);
  if (id === req.user!.id) { res.status(400).json({ error: "Cannot delete your own account" }); return; }
  await db.delete(schoolUsersTable).where(eq(schoolUsersTable.id, id));
  res.status(204).send();
});

/* ─── Courses ────────────────────────────────────────────────── */

router.get("/courses", requireAuth, async (_req: Request, res: Response) => {
  const courses = await db.select().from(schoolCoursesTable).orderBy(asc(schoolCoursesTable.createdAt));
  res.json(courses.map(formatCourse));
});

router.post("/courses", requireAuth, async (req: Request, res: Response) => {
  const { title, description, instructorId, duration, fee, schedule, status } = req.body as Record<string, string>;
  if (!title) { res.status(400).json({ error: "Title is required" }); return; }
  const [course] = await db
    .insert(schoolCoursesTable)
    .values({
      id: genId(),
      title,
      description: description || "",
      instructorId: instructorId || "",
      duration: duration || "1 month",
      fee: fee || "",
      schedule: schedule || "",
      students: [],
      materials: [],
      status: status || "active",
    })
    .returning();
  res.status(201).json(formatCourse(course));
});

router.delete("/courses/:id", requireAuth, async (req: Request, res: Response) => {
  await db.delete(schoolCoursesTable).where(eq(schoolCoursesTable.id, String(req.params["id"])));
  res.status(204).send();
});

/* ─── Sessions ───────────────────────────────────────────────── */

router.get("/sessions", requireAuth, async (_req: Request, res: Response) => {
  const sessions = await db.select().from(schoolSessionsTable).orderBy(asc(schoolSessionsTable.startedAt));
  res.json(sessions.map(formatSession));
});

router.post("/sessions", requireAuth, async (req: Request, res: Response) => {
  const { courseId, courseTitle, instructorId, roomId, title } = req.body as Record<string, string>;
  const id = genId();
  const [session] = await db
    .insert(schoolSessionsTable)
    .values({
      id,
      courseId: courseId || "",
      courseTitle: courseTitle || "",
      instructorId: instructorId || "",
      roomId: roomId || id,
      title: title || "Live Class",
      status: "live",
    })
    .returning();
  res.status(201).json(formatSession(session));
});

router.patch("/sessions/:id/end", requireAuth, async (req: Request, res: Response) => {
  await db
    .update(schoolSessionsTable)
    .set({ status: "ended" })
    .where(eq(schoolSessionsTable.id, String(req.params["id"])));
  res.status(204).send();
});

export default router;
