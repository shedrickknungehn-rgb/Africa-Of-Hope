# Africa of Hope — Supabase Production Setup

## Applying migrations

Run the SQL files in `migrations/` **in numeric order**. Two ways:

- **Supabase Dashboard → SQL Editor:** open each file, paste, Run.
- **Management API (works from any host, including Replit):**
  `POST https://api.supabase.com/v1/projects/<project-ref>/database/query`
  with header `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>` and body `{"query": "<file contents>"}`.
  `<project-ref>` is the subdomain of your `SUPABASE_URL`.

> Note: the direct connection host `db.<ref>.supabase.co` is IPv6-only and is not reachable
> from some networks (e.g. Replit). Use the SQL Editor or the Management API instead.

| File | Purpose |
|------|---------|
| `migrations/001_initial_schema.sql` | Core tables, indexes, triggers, enums |
| `migrations/002_rls_policies.sql` | Row Level Security policies |
| `migrations/003_realtime.sql` | Realtime on `school_sessions` + `announcements` |
| `migrations/004_storage.sql` | Storage buckets |
| `migrations/005_functions.sql` | Helper functions (stats, enrollment, cleanup) |
| `migrations/006_phase1_expansion.sql` | role/status enum → TEXT; enrollments, announcements, events, payments |
| `migrations/007_phase2_expansion.sql` | attendance, grades, staff records, leave, payroll |
| `migrations/008_phase3.sql` | messaging, timetable, exams, quizzes, parent links, library |
| `migrations/009_remove_demo_data.sql` | **One-time bootstrap** — clears all `school_*` rows for a clean slate |
| `migrations/010_superadmin.sql` | Seeds the Super Administrator login |

> ⚠️ **Do NOT re-run `009_remove_demo_data.sql` on a production database that has real data.**
> There is no migration-tracking table; running 009 again will DELETE every row in all
> `school_*` tables (students, grades, payments, etc.). It is only meant for first-time setup.

## Default login

`010_superadmin.sql` creates one Super Administrator account:

- **Username:** `superadmin`
- **Password:** `SuperAdmin2026`

🔐 **Change this password immediately after first login** (Admin Dashboard → Users), since the
default is committed to the repository. If no `super_admin` row exists, the login screen instead
shows a one-time "Create Super Administrator" form (`POST /api/school/auth/setup`).

## Backend Environment Variables

The Express API (`artifacts/api-server`) connects with the Supabase **service role** key
(bypasses RLS). Set:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SESSION_SECRET=your-long-random-secret
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=4000
```

Get the URL and service role key from: Supabase Dashboard → Project Settings → API.

## Frontend Environment Variables (Vercel)

```env
VITE_API_URL=https://your-express-backend.com
```

`VITE_API_URL` must point to the deployed Express API (no trailing slash), and that origin
must be listed in the backend's `ALLOWED_ORIGINS` for CORS.

## Realtime (School Portal)

Live session updates and announcements use Supabase Realtime.
Tables subscribed: `school_sessions`, `announcements`.

## Storage Buckets

| Bucket | Public | Max Size | Purpose |
|--------|--------|----------|---------|
| `course-materials` | No | 50 MB | PDFs, slides, docs |
| `media-gallery` | Yes | 10 MB | Website gallery images |
| `avatars` | Yes | 2 MB | User profile pictures |
