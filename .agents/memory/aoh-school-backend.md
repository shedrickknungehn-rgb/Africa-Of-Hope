---
name: Africa of Hope — Architecture & Deployment Setup
description: Full stack architecture, Supabase migration, Vercel/Express deployment config.
---

## Architecture (Production-Ready)

### Deployment model: ONE Vercel project (Vercel + Supabase only)
- The SPA AND the Express API deploy together to a single Vercel project; the API runs as a serverless function on the SAME origin (no separate API host).
- `artifacts/africa-of-hope/api/[...path].ts` is the Vercel catch-all: it re-exports the Express `app` from `@workspace/api-server/app` (the prebuilt `dist/app.mjs`). `app.use("/api", router)` matches because Vercel passes the full `/api/...` path as req.url.
- `vercel.json` buildCommand builds the api-server FIRST (`pnpm --filter @workspace/api-server build`) then the web; rewrite `/((?!api/|assets/).*)` sends everything except `/api` + assets to the SPA.
- Frontend is same-origin by default: `API_BASE = (VITE_API_URL ?? "")` → `/api/school/...`. Do NOT set `VITE_API_URL` on Vercel. Local dev uses the Vite proxy (`/api` → `:8080`).
- All school API calls in `src/pages/school/schoolApi.ts`.

### Frontend
- `artifacts/africa-of-hope` — Vite + React, base path `/`
- `vite.config.ts` — no PORT/BASE_PATH hard requirement; falls back to 3000
- Brochure image at `public/brochure.png`; `Education.tsx` references as `/brochure.png` (public URL, NOT `@assets` import)

### Backend (Node.js/Express → Supabase)
- `artifacts/api-server` — Express server. `src/app.ts` exports the bare `app` (CORS, json, `/health`, `app.use("/api", router)`, error handler); `src/index.ts` is the local-dev entry (app.listen + seedSchoolData). The Vercel function imports `app.ts` ONLY, so `seedSchoolData()` does NOT run on Vercel — seed data comes from migrations.
- esbuild (`build.mjs`) bundles BOTH entries: `index.ts`→`dist/index.mjs` and `app.ts`→`dist/app.mjs` (ESM, CJS-interop banner so express works, `esbuild-plugin-pino` sidecars). pino transports load only in dev (NODE_ENV≠production); the serverless prod path is plain-stdout pino, so the bundle boots cleanly on Vercel.
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
- `supabase/migrations/006..008` — phase 1/2/3 schema + table expansions
- `supabase/migrations/009_remove_demo_data.sql` — one-time wipe of all school_* rows
- `supabase/migrations/010_superadmin.sql` — seeds the one super_admin login
- `supabase/migrations/011_demo_users.sql` — RETIRED no-op (used to seed demo logins; demo accounts removed for launch)
- `supabase/migrations/012_password_reset_codes.sql` — `password_reset_codes` table (forgot-password store) + service_role-only RLS
- `supabase/migrations/013_reset_code_attempts.sql` — adds `attempts INT` to `password_reset_codes` for brute-force lockout
- `supabase/migrations/014_remove_demo_users.sql` — deletes any already-seeded demo logins (keeps the super_admin)
- `supabase/README.md` — deployment guide
- NOTE: the old `supabase/seed.sql` was DELETED (it re-added demo credentials, contradicting the clean-slate model; nothing runs it)

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

## Login security (HARDENED for go-live — pre-launch relaxations are now removed)
**Why:** the demo-phase shortcuts (on-screen reset codes, demo logins, no lockout, ignored `is_active`) were deliberately removed before public launch. Do NOT reintroduce them.
**How to apply:**
- Remember-me: `storeSession(token,user,remember)` in schoolApi.ts → localStorage (persist) when checked, sessionStorage (clears on browser close) when unchecked, and it clears the other store. getToken/getSession read both stores; clearSession wipes both.
- Forgot password (ALL users): `POST /auth/forgot-password {identifier}` resolves the user by username OR email, EMAILS the 6-digit code via Resend, and ALWAYS returns generic `{ok:true}` (anti-enumeration — never reveals whether the account/email exists, never returns the code). In prod it 500s if email is unconfigured; in dev it logs the code. Deactivated (`is_active===false`) or email-less accounts silently get the generic ok with no email sent.
- Email delivery: `artifacts/api-server/src/lib/mailer.ts` calls the Resend REST API directly with `RESEND_API_KEY` (NOT the Replit connector — connector proxy is unavailable on Vercel prod). Optional `RESET_EMAIL_FROM` overrides the sender; until a domain is verified in Resend, the shared onboarding sender only delivers to the Resend account's own email. Both `RESEND_API_KEY` and `RESET_EMAIL_FROM` must also be set in Vercel env.
- Reset: `POST /auth/reset-password {identifier,code,newPassword}` resolves user by username/email, rejects `is_active===false` (403), and LOCKS OUT after `MAX_RESET_ATTEMPTS=5` wrong guesses (429), deleting the row on success or lockout. The check+increment MUST stay atomic: it calls the `claim_password_reset_attempt(username_key,code,max)` SQL function (migration 015) which locks the row with `SELECT ... FOR UPDATE`. **Why:** a plain read-then-write increment races under concurrent requests — parallel wrong guesses read the same count and overwrite each other, letting an attacker exceed the limit. Do NOT revert to incrementing the `attempts` column (migration 013) from JS.
- Login: rejects `is_active===false` with 403.
- Demo logins fully removed: no `DEMO_ACCOUNTS`/demo panel in the UI, `011_demo_users.sql` retired to a no-op, `014_remove_demo_users.sql` deletes any seeded demo rows (super_admin from 010 is kept).

## Applying migrations to Supabase from Replit (use the Management API)
- **Method that works:** POST `https://api.supabase.com/v1/projects/<ref>/database/query`, header `Authorization: Bearer $SUPABASE_ACCESS_TOKEN`, body `{"query":"<sql>"}`. `<ref>` = subdomain of `SUPABASE_URL`. Supabase SQL Editor is the manual fallback.
- **Why not `psql`/`pg` from Replit:** direct host `db.<ref>.supabase.co` is **IPv6-only → ENOTFOUND**. The session pooler (`aws-0-<region>.pooler.supabase.com`, user `postgres.<ref>`) is reachable but auth failed `28P01` (stored DB password was wrong, user-side). The Management API (PAT) sidesteps both.
- **Each API call wraps the whole file's SQL in ONE transaction** — any single error rolls back the entire file. (006's enum ALTER failing reverted ALL of 006's tables/columns.)
- **Enum→TEXT + RLS gotcha:** Postgres refuses `ALTER COLUMN ... TYPE` while an RLS policy references that column. 002 creates `anon_read_active_courses` on `school_courses.status`; 006 now DROPs it before the ALTER and recreates it after. Any future enum→text conversion must drop dependent policies first.
- **Order:** 001 schema, 002 rls, 003 realtime, 004 storage, 005 functions, 006 phase1 (schema only now), 007 phase2, 008 phase3, 009 clears demo data, 010 seeds the superadmin, 011 seeds demo logins (one per role, pw Demo2026).

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
### Vercel (server-side, for the /api function) — set in the Vercel project
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (bypasses RLS)
- `SESSION_SECRET` — JWT signing secret. REQUIRED in production: `jwt.ts` throws on boot when NODE_ENV=production and it's unset (no insecure hardcoded fallback), so a missing value makes every `/api` call 500 while the SPA still renders.
- Do NOT set `ALLOWED_ORIGINS` on Vercel (same origin → no CORS; a wrong value makes the cors callback throw). Still used for the separate-host/dev case (comma-separated).
- `PORT` — local dev only (default 4000; Vite proxy targets :8080).

### Frontend
- `VITE_API_URL` — leave EMPTY/unset for the Vercel deploy (same-origin). Only set it to point the SPA at a separately-hosted API.

## Vercel deploy checklist & failure modes (single-project, API-as-function)
- The old "deploy the Express API to a separate host + set VITE_API_URL" model is GONE — the API now ships as the Vercel serverless function `api/[...path].ts` on the same origin. Leave `VITE_API_URL` empty on Vercel.
- **Vercel project settings:** Root Directory = `artifacts/africa-of-hope`, with "Include source files outside of Root Directory" ENABLED (so the pnpm workspace install + nft tracing of `../api-server/dist/app.mjs` work). The `@workspace/api-server` `workspace:*` dep fails install loudly if misconfigured — a useful early signal.
- **Most likely "login broken" cause:** `SESSION_SECRET` (or the SUPABASE_* vars) not set in Vercel → the function 500s on cold start while the SPA still renders. Set all three server-side vars.
- `schoolApi.ts` degrades to a clear "Unable to reach the school server" message instead of a raw JSON error when the API is unreachable.

## Branding
- Public site: primary `#F03800` / `#2492FF`
- School portal: `#0d3d1a` dark green + `#d4a017` gold
