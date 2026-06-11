import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";

export const schoolUsersTable = pgTable("school_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  role: text("role").notNull().default("student"),
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

export type SchoolUser = typeof schoolUsersTable.$inferSelect;
export type SchoolCourse = typeof schoolCoursesTable.$inferSelect;
export type SchoolSession = typeof schoolSessionsTable.$inferSelect;
