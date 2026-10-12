---
name: Africa of Hope — Self-Paced Academy Architecture
description: Retained academy modules, Supabase migrations, authorization, and deployment safeguards.
---

## Deployment model

- The Vite SPA and Express API deploy together in one Vercel project.
- `artifacts/africa-of-hope/api/[...path].ts` exports the built Express app.
- The frontend uses same-origin `/api/school` by default. Local Vite proxies `/api` to the API server.
- `artifacts/api-server/src/app.ts` exports the app. `src/index.ts` is the local server entry point.
- `getSupabase()` creates a lazy service-role client from `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `SESSION_SECRET` is required in production.

## Retained self-paced academy modules

The active backend retains only:

- Accounts and authentication
- Courses and course materials
- Enrollments
- Quizzes and quiz submissions
- Grades
- Payment records
- Core overview, enrollment, academic, and finance reports

The active roles are `student`, `instructor`, `admin`, and `super_admin`. Every authenticated request reloads the account role and `is_active` state from PostgreSQL. Legacy roles remain as inactive identity rows until an administrator converts them.

Retired modules are absent from active API, schema, and dashboards: live sessions, attendance, announcements/events, parent access, HR/leave/payroll, direct messages, timetable/scheduled exams, and physical library records.

## Authorization rules

- Students can access only their own enrollments, grades, payments, and quiz submissions.
- Instructors can manage materials, grades, enrollments, and quizzes only for their own courses.
- Admin and super-admin accounts manage academy records.
- Only a super-admin can create, promote, demote, deactivate, or delete a super-admin.
- The API prevents removal or deactivation of the last active super-admin.
- Quiz answer keys are not returned to students.

## Database migrations

- Apply numbered files in `supabase/migrations/` in order.
- Migration `016_self_paced_backend_cleanup.sql` permanently removes retired module tables and course scheduling columns.
- Migration 016 uses one transaction, bounded timeouts, table locks, dependency checks, and explicit `RESTRICT` drops.
- `supabase/verification/016_self_paced_backend_cleanup.sql` verifies retained and removed objects after migration.
- Do not use `drizzle-kit push` or schema push. The repository intentionally has no schema-push script or configuration.
- Historical migrations remain unchanged as the database audit trail.

For migration 016, deploy the retained API first. Stop writes before the migration. Verify the target project, create an encrypted backup, and restore-test the backup in isolation. Apply migration 016 only after these checks. Rollback requires the backup and previous application version.

## Retained database data

Migration 016 preserves:

- `school_users`
- `school_courses`
- `school_enrollments`
- `school_quizzes`
- `school_quiz_submissions`
- `school_grades`
- `school_payments`
- `password_reset_codes`
- `contact_submissions`
- `donations`
- Storage buckets and retained enrollment/password-reset functions

## Password reset

- Forgot-password codes live in `password_reset_codes` for stateless serverless execution.
- The API sends codes through Resend and never returns a code in an API response.
- `claim_password_reset_attempt` performs atomic attempt counting and lockout.
- Inactive accounts cannot complete password reset.

## PDF and report exports

- `src/pages/school/pdf/exportPdf.ts` contains retained transcript and payment receipt exports.
- Core reports cover overview, enrollment, academic, and finance information.
- Attendance, HR, payroll, parent, and library exports are retired.

## Required environment variables

Server-side:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `RESEND_API_KEY` and optional `RESET_EMAIL_FROM` for password reset email
- Optional `ALLOWED_ORIGINS` for separate-host development

Frontend:

- Leave `VITE_API_URL` unset for same-origin Vercel deployment.
- Set `VITE_API_URL` only when the frontend uses a separate API host.
