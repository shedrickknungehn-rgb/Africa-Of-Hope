import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
  students: jsonb("students").$type<string[]>().notNull().default([]),
  materials: jsonb("materials")
    .$type<{ title: string; url: string }[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("active"),
  category: text("category").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const schoolQuizzesTable = pgTable("school_quizzes", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  title: text("title").notNull(),
  instructions: text("instructions").notNull().default(""),
  dueDate: timestamp("due_date"),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SchoolUser = typeof schoolUsersTable.$inferSelect;
export type SchoolCourse = typeof schoolCoursesTable.$inferSelect;
export type SchoolEnrollment = typeof schoolEnrollmentsTable.$inferSelect;
export type SchoolPayment = typeof schoolPaymentsTable.$inferSelect;
export type SchoolGrade = typeof schoolGradesTable.$inferSelect;
export type SchoolQuiz = typeof schoolQuizzesTable.$inferSelect;
export type SchoolQuizSubmission =
  typeof schoolQuizSubmissionsTable.$inferSelect;
