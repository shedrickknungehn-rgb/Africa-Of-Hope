import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const schoolUsersTable = pgTable("school_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  role: text("role").notNull().default("student"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  phone: text("phone").notNull().default(""),
});

export const schoolCoursesTable = pgTable("school_courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  instructorId: text("instructor_id").notNull().default(""),
  duration: text("duration").notNull().default("1 month"),
  fee: text("fee").notNull().default(""),
  students: jsonb("students").$type<string[]>().notNull().default([]),
  materials: jsonb("materials")
    .$type<{ title: string; url: string }[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("active"),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  category: text("category").notNull().default(""),
});

export const schoolEnrollmentsTable = pgTable("school_enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  status: text("status").notNull().default("pending"),
  fee: text("fee").notNull().default(""),
  notes: text("notes").notNull().default(""),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
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
  dueDate: timestamp("due_date", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const schoolGradesTable = pgTable("school_grades", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull(),
  courseId: text("course_id").notNull(),
  assessment: text("assessment").notNull(),
  score: text("score").notNull().default("0"),
  maxScore: text("max_score").notNull().default("100"),
  weight: text("weight").notNull().default(""),
  grade: text("grade").notNull().default(""),
  comment: text("comment").notNull().default(""),
  recordedBy: text("recorded_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const schoolQuizzesTable = pgTable("school_quizzes", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull().default(""),
  dueDate: timestamp("due_date", { withTimezone: true }),
  timeLimitMins: integer("time_limit_mins").default(0),
  status: text("status").notNull().default("draft"),
  questions: jsonb("questions")
    .$type<
      {
        id: string;
        type: string;
        text: string;
        options?: string[];
        correct?: string;
      }[]
    >()
    .notNull()
    .default([]),
  createdBy: text("created_by").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const schoolQuizSubmissionsTable = pgTable("school_quiz_submissions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull(),
  studentId: text("student_id").notNull(),
  answers: jsonb("answers")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const passwordResetCodesTable = pgTable("password_reset_codes", {
  usernameKey: text("username_key").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => schoolUsersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  attempts: integer("attempts").notNull().default(0),
});

export const contactSubmissionsTable = pgTable("contact_submissions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const donationsTable = pgTable("donations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  paymentRef: text("payment_ref"),
  paymentMethod: text("payment_method"),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SchoolUser = typeof schoolUsersTable.$inferSelect;
export type SchoolCourse = typeof schoolCoursesTable.$inferSelect;
export type SchoolEnrollment = typeof schoolEnrollmentsTable.$inferSelect;
export type SchoolPayment = typeof schoolPaymentsTable.$inferSelect;
export type SchoolGrade = typeof schoolGradesTable.$inferSelect;
export type SchoolQuiz = typeof schoolQuizzesTable.$inferSelect;
export type SchoolQuizSubmission =
  typeof schoolQuizSubmissionsTable.$inferSelect;
export type PasswordResetCode = typeof passwordResetCodesTable.$inferSelect;
export type ContactSubmission = typeof contactSubmissionsTable.$inferSelect;
export type Donation = typeof donationsTable.$inferSelect;
