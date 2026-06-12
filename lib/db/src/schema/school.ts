import { pgTable, text, serial, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";

export const schoolUsersTable = pgTable("school_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  role: text("role").notNull().default("student"),
  phone: text("phone").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolCoursesTable = pgTable("school_courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  instructorId: text("instructor_id").notNull().default(""),
  duration: text("duration").notNull().default("1 month"),
  fee: text("fee").notNull().default(""),
  schedule: text("schedule").notNull().default(""),
  students: jsonb("students").$type<string[]>().notNull().default([]),
  materials: jsonb("materials").$type<{ title: string; url: string }[]>().notNull().default([]),
  status: text("status").notNull().default("active"),
  capacity: integer("capacity").default(30),
  category: text("category").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolSessionsTable = pgTable("school_sessions", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  courseTitle: text("course_title").notNull().default(""),
  instructorId: text("instructor_id").notNull().default(""),
  roomId: text("room_id").notNull(),
  title: text("title").notNull().default(""),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  status: text("status").notNull().default("live"),
});

export const schoolEnrollmentsTable = pgTable("school_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  status: text("status").notNull().default("pending"),
  fee: text("fee").notNull().default(""),
  notes: text("notes").notNull().default(""),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolAnnouncementsTable = pgTable("school_announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").notNull(),
  priority: text("priority").notNull().default("normal"),
  targetRoles: jsonb("target_roles").$type<string[]>().notNull().default(["all"]),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolEventsTable = pgTable("school_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  date: timestamp("date").notNull(),
  location: text("location").notNull().default(""),
  type: text("type").notNull().default("academic"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolPaymentsTable = pgTable("school_payments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  enrollmentId: text("enrollment_id").notNull().default(""),
  amount: text("amount").notNull(),
  status: text("status").notNull().default("pending"),
  method: text("method").notNull().default(""),
  reference: text("reference").notNull().default(""),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SchoolUser = typeof schoolUsersTable.$inferSelect;
export type SchoolCourse = typeof schoolCoursesTable.$inferSelect;
export type SchoolSession = typeof schoolSessionsTable.$inferSelect;
export type SchoolEnrollment = typeof schoolEnrollmentsTable.$inferSelect;
export type SchoolAnnouncement = typeof schoolAnnouncementsTable.$inferSelect;
export type SchoolEvent = typeof schoolEventsTable.$inferSelect;
export type SchoolPayment = typeof schoolPaymentsTable.$inferSelect;
