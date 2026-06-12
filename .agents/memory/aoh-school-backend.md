---
name: Africa of Hope — Architecture & Deployment Setup
description: Full stack architecture, Supabase migration, Vercel/Express deployment config.
---

## Architecture (Production-Ready)

### Frontend (Vercel)
- `artifacts/africa-of-hope` — Vite + React, base path `/`
- API URL via `VITE_API_URL` env var → `import.meta.env.VITE_API_URL`
- All school API calls in `src/pages/school/schoolApi.ts`
- `vercel.json` — SPA rewrite rule for client-side routing
- `vite.config.ts` — no PORT/BASE_PATH hard requirement; falls back to 3000
- Brochure image at `public/brochure.png`; `Education.tsx` references as `/brochure.png` (public URL, NOT `@assets` import)

### Backend (Node.js/Express → Supabase)
- `artifacts/api-server` — standalone Express server
- DB: `@supabase/supabase-js` with service_role key via `getSupabase()` lazy singleton
- **Critical:** `getSupabase()` throws at call-time (not module-load) if env vars missing — server starts fine in dev without credentials
- Routes: `src/routes/school.ts` — call `getSupabase()` inside each handler
- CORS: `ALLOWED_ORIGINS` env var (comma-separated list)
- JWT: `SESSION_SECRET` env var, 7-day expiry

### Supabase Schema Files
- `supabase/migrations/001_initial_schema.sql` — tables, indexes, triggers, enums
- `supabase/migrations/002_rls_policies.sql` — Row Level Security
- `supabase/migrations/003_realtime.sql` — realtime on school_sessions + announcements
- `supabase/migrations/004_storage.sql` — 3 buckets (course-materials, media-gallery, avatars)
- `supabase/migrations/005_functions.sql` — get_school_stats, enroll_student, cleanup
- `supabase/seed.sql` — default users + courses + welcome announcement
- `supabase/README.md` — deployment guide

## DB Tables (Supabase PostgreSQL)
- `school_users` — serial PK; passwords stored plaintext (intentional — admin-view feature); role is TEXT (not enum) after migration 006
- `school_courses` — text PK; students/materials as JSONB arrays; status is TEXT after migration 006
- `school_sessions` — text PK; status text (live/ended/scheduled)
- `school_enrollments` — text PK; student_id TEXT (string of user INT id); status: pending/active/completed/withdrawn
- `school_announcements` — text PK; priority text; target_roles JSONB array
- `school_events` — text PK; type text (academic/social/administrative/external)
- `school_payments` — text PK; status: pending/paid/overdue/waived
- `contact_submissions`, `donations` — existing tables unchanged

## Phase 3 Tables (migration 008)
- `school_messages` — messaging between users
- `school_timetable` — weekly timetable slots
- `school_exams` — exam schedule
- `school_quizzes` — online assessments (with questions JSONB)
- `school_quiz_submissions` — student submissions
- `school_parent_links` — parent↔student relationships
- `school_books` — library catalog
- `school_borrows` — library borrowing records

## 11 Roles (TEXT in DB — Phase 3 added parent)
Management → AdminDashboard: admin, super_admin, director, registrar, academic_coordinator, finance_officer, hr_officer
Non-management: instructor, assistant → InstructorDashboard; student, alumni → StudentDashboard; parent → ParentDashboard

## Auth Flow
- POST `/api/school/auth/login` → `{token, user}` → localStorage
- All endpoints: `Authorization: Bearer <token>`
- Management roles get full user list + all CRUD; others get limited access

## Demo Accounts (seeded by seed.ts)
- Roles seeded: admin, super_admin, director, registrar, academic_coordinator, finance_officer, hr_officer, instructor, assistant, student (x2), alumni
- Credentials are visible to admins via the Users tab (show/hide password feature); not stored in memory.
- Run `artifacts/api-server/src/seed.ts` or `supabase/seed.sql` to populate; see `supabase/README.md` for steps.

**Why plaintext passwords in DB:** AdminDashboard Users tab has show/hide password for admins to share credentials with enrolled students. Internal portal only.

## CRITICAL: Migrations must be run in Supabase before tables work
- Migration 006: role/status ENUMs to TEXT + Phase 1 tables
- Migration 007: Phase 2 tables (attendance, grades, staff, leave, payroll)
- Migration 008: Phase 3 tables (messaging, timetable, exams, quizzes, parent_links, books, borrows)
Run all in: Supabase Dashboard → SQL Editor → paste entire file → Run

## Phase 2 access-control convention (school.ts) — KEEP CONSISTENT
**Why:** academic records and payroll are sensitive; an early version let any logged-in user read/write any student's data (IDOR).
**How to apply:**
- `GET /attendance` and `GET /grades`: if `!STAFF.has(role)` (i.e. student/alumni/parent), force `student_id = req.user.id` — they only ever see their own rows. Staff may filter by studentId/courseId.
- Parent role: GET /attendance and /grades also support parentId query param — API resolves children via school_parent_links and returns all children's data.
- Staff writes to attendance/grades/materials must pass `assertCourseAccess(req,res,courseId)`: management + assistant → any class; instructor → only courses where `instructor_id === user.id`. For PATCH/DELETE, look up the row's course_id first, then assert.
- Instructor materials editing uses dedicated `PATCH /courses/:id/materials` (requireStaff + assertCourseAccess), NOT `PATCH /courses/:id` (requireMgmt). Frontend: `apiUpdateCourseMaterials`.
- Leave/payroll: non-management constrained to their own rows; staff records + payroll create/update are requireMgmt.

## PDF Export (jspdf + jspdf-autotable, in @workspace/africa-of-hope)
- Utility: `src/pages/school/pdf/exportPdf.ts`
- Functions: exportTranscriptPdf, exportAttendancePdf, exportReceiptPdf, exportAllReceiptsPdf, exportPayslipPdf
- All dynamically imported (lazy) to avoid bloating the initial bundle
- Header uses GREEN (#0d3d1a) + GOLD (#d4a017) branding; school name + address
- Added to: StudentDashboard (transcript + finance tabs), ParentDashboard (grades + finance tabs), HRTab (payslip per payroll row)

## Advanced Reports & Analytics (ReportsTab, recharts)
- `artifacts/africa-of-hope/src/pages/school/admin/ReportsTab.tsx` — fully rewritten
- 5 sections: Overview, Enrollment, Finance, Academic, HR & Payroll
- Charts: AreaChart (enrollment trend), BarChart (revenue, grade dist, enrollments by course), PieChart (status breakdowns, roles), LineChart (payroll trend)
- All analytics data lazy-loaded on first Reports tab visit (attendance, grades, payroll, staff)
- "Export PDF" button generates a multi-section analytics report via jspdf
- jsPDF used via dynamic import in ReportsTab; type-cast via `as unknown as { lastAutoTable: ... }`

## Env Variables Required
### Backend
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (bypasses RLS)
- `SESSION_SECRET` — JWT signing secret
- `ALLOWED_ORIGINS` — comma-separated CORS origins
- `PORT` — server port (default 4000)

### Frontend
- `VITE_API_URL` — backend URL (no trailing slash)

## Branding
- Public site: primary `#F03800` / `#2492FF`
- School portal: `#0d3d1a` dark green + `#d4a017` gold
