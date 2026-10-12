# Africa of Hope — Supabase Production Setup

## Applying migrations

Run the SQL files in `migrations/` **once and in numeric order**. Use one of:

- **Supabase Dashboard → SQL Editor:** open each file, paste, and run it.
- **Management API:** `POST https://api.supabase.com/v1/projects/<project-ref>/database/query` with header `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>` and body `{"query": "<file contents>"}`. `<project-ref>` is the subdomain of `SUPABASE_URL`.

> The direct connection host `db.<ref>.supabase.co` is IPv6-only and may not be reachable from every network. Use the SQL Editor or Management API when it is unavailable.

| File                                            | Purpose                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `migrations/001_initial_schema.sql`             | Historical core tables, indexes, triggers, and enums                                    |
| `migrations/002_rls_policies.sql`               | Row Level Security policies                                                             |
| `migrations/003_realtime.sql`                   | Historical realtime setup; its retired table entries are removed by 016                 |
| `migrations/004_storage.sql`                    | Storage buckets and policies                                                            |
| `migrations/005_functions.sql`                  | Enrollment helpers and historical stats/session/announcement functions                  |
| `migrations/006_phase1_expansion.sql`           | Historical role/status expansion plus enrollments, payments, and retired tables         |
| `migrations/007_phase2_expansion.sql`           | Grades plus retired attendance/HR tables                                                |
| `migrations/008_phase3.sql`                     | Quizzes/submissions plus retired messaging, timetable, exam, parent, and library tables |
| `migrations/009_remove_demo_data.sql`           | One-time bootstrap data cleanup; never rerun against real data                          |
| `migrations/010_superadmin.sql`                 | Bootstrap super-administrator seed                                                      |
| `migrations/011-015`                            | Historical demo-user and password-reset migrations                                      |
| `migrations/016_self_paced_backend_cleanup.sql` | **Destructive forward-only self-paced academy cleanup**                                 |

Do not use `drizzle-kit push`, schema push, or replay the bootstrap cleanup migrations as a production deletion strategy. Drizzle push scripts and configuration are intentionally absent so schema push cannot bypass migration 016. Historical migration files are an audit trail and must remain unchanged.

## Retained schema

The active academy schema retains:

- `school_users` and `password_reset_codes`
- `school_courses` (including materials and estimated `duration`, but not classroom `schedule` or `capacity`)
- `school_enrollments`
- `school_quizzes` and `school_quiz_submissions`
- `school_grades`
- `school_payments`
- Public-site `contact_submissions`, `donations`, and existing storage buckets

The cleanup removes live sessions, attendance, announcements/events, parent links, staff/leave/payroll, messages, timetables, scheduled exams, and physical-library tables. Active academy access is limited to `student`, `instructor`, `admin`, and `super_admin`; the migration deactivates unsupported legacy roles without deleting user rows.

## Production upgrade to 016

`016_self_paced_backend_cleanup.sql` permanently deletes retired data. Reverting application code does not restore it.

1. Deploy the retained-only API first. Do not apply 016 while an older API can still write retired tables or course `schedule`/`capacity` columns.
2. Stop application writes (for example, enable maintenance mode and pause background jobs).
3. Confirm the Supabase project identity and migration history. Inspect row counts, role distribution, publication membership, functions, policies, and dependencies before changing anything.
4. Create an encrypted database backup **outside this repository**. Restore it to an isolated environment and confirm both retained and retired representative records are present before proceeding.
5. Confirm at least one active `admin` or `super_admin` exists. The migration refuses to proceed otherwise.
6. Run `migrations/016_self_paced_backend_cleanup.sql` once. It runs in one transaction with bounded lock and statement timeouts. Named `RESTRICT` drops abort and roll back the whole transaction if an unknown dependency exists.
7. Run `verification/016_self_paced_backend_cleanup.sql`. It is read-only and confirms retained objects, retired tables/functions/type, statistics-function access, and the active-role invariant.
8. Keep the encrypted backup and the matching previous application version for recovery. Restoring deleted rows requires that backup in an isolated database before any controlled production restoration.

## Backend environment variables

The Express API (`artifacts/api-server`) connects with the Supabase **service role** key, which bypasses RLS. Set:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SESSION_SECRET=your-long-random-secret
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=4000
```

Get the URL and service role key from Supabase Dashboard → Project Settings → API.

## Frontend environment variables

```env
VITE_API_URL=https://your-express-backend.com
```

`VITE_API_URL` must point to the deployed Express API (no trailing slash), and that origin must be listed in the backend's `ALLOWED_ORIGINS` for CORS.

## Storage buckets

| Bucket             | Public | Max Size | Purpose                            |
| ------------------ | ------ | -------- | ---------------------------------- |
| `course-materials` | No     | 50 MB    | Course PDFs, slides, and documents |
| `media-gallery`    | Yes    | 10 MB    | Public website gallery images      |
| `avatars`          | Yes    | 2 MB     | User profile pictures              |
