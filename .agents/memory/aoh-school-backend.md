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

## Auth model: seeded Super Admin + first-run setup fallback
- `010_superadmin.sql` seeds exactly ONE `super_admin` login (runs AFTER 009 so it survives the wipe). The demo credential lives in that migration file (intentional — user asked for a superadmin demo login). Because a super_admin exists, `setup-status` returns `needsSetup:false` → normal login screen.
- The earlier "remove demo data" seed block was deleted from 006; user seeding now lives ONLY in 010. `seed.ts` is still a no-op.
- `009_remove_demo_data.sql` clears all school_* rows + parent_student_links (leaves contact_submissions/donations). Guarded by `to_regclass`, so it safely skips tables that don't exist yet.
- `SchoolLogin.tsx` calls `GET /api/school/auth/setup-status` on mount → `{needsSetup}` (true when no super_admin row). True → "Create Super Administrator" form → `POST /api/school/auth/setup` (creates first super_admin only; 403 if one already exists). False → normal login.
- Login = `username` + plaintext `password` compare. To force the first-run setup flow instead: run 009 and skip 010 (leave no super_admin row).

**Why plaintext passwords in DB:** AdminDashboard Users tab has show/hide password for admins to share credentials with enrolled students. Internal portal only.

## Applying migrations to Supabase from Replit (use the Management API)
- **Method that works:** POST `https://api.supabase.com/v1/projects/<ref>/database/query`, header `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`, body `{"query":"<sql>"}`. `<ref>` = subdomain of `SUPABASE_URL`. Supabase SQL Editor is the manual fallback.
- **Why not `psql`/`pg` from Replit:** direct host `db.<ref>.supabase.co` is **IPv6-only → ENOTFOUND**. The session pooler (`aws-0-<region>.pooler.supabase.com`, user `postgres.<ref>`) is reachable but auth failed `28P01` (stored DB password was wrong, user-side). The Management API (PAT) sidesteps both.
- **Each API call wraps the whole file's SQL in ONE transaction** — any single error rolls back the entire file. (006's enum ALTER failing reverted ALL of 006's tables/columns.)
- **Enum→TEXT + RLS gotcha:** Postgres refuses `ALTER COLUMN ... TYPE` while an RLS policy references that column. 002 creates `anon_read_active_courses` on `school_courses.status`; 006 now DROPs it before the ALTER and recreates it after. Any future enum→text conversion must drop dependent policies first.
- **Order:** 001 schema, 002 rls, 003 realtime, 004 storage, 005 functions, 006 phase1 (schema only now), 007 phase2, 008 phase3, 009 clears demo data, 010 seeds the superadmin.

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

## Production login pitfall (Vercel) — root cause of "Unexpected end of JSON input"
- Frontend (Vercel) and the Express API are SEPARATE hosts. If `VITE_API_URL` is unset/empty on Vercel, login POSTs to a relative `/api/...` on the Vercel domain (no backend) → empty body → `res.json()` throws "Unexpected end of JSON input".
- **Why:** the Express backend was never deployed to a host reachable from Vercel.
- **How to fix:** (a) deploy `artifacts/api-server` somewhere reachable (e.g. a Replit deployment → stable `.replit.app` URL), (b) set `VITE_API_URL` on Vercel to that URL and redeploy, (c) add the Vercel origin to `ALLOWED_ORIGINS` (CORS). `schoolApi.ts` now degrades to a clear "Unable to reach the school server" message instead of the raw JSON error.

## Branding
- Public site: primary `#F03800` / `#2492FF`
- School portal: `#0d3d1a` dark green + `#d4a017` gold
