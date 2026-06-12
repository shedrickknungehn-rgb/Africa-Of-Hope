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

### Backend (Node.js/Express → connects to Supabase PostgreSQL)
- `artifacts/api-server` — standalone Express server
- DB: raw `pg` Pool connecting to Supabase via `DATABASE_URL` env var
- DB layer: `src/lib/db.ts` — `query()` helper using pg Pool
- Routes: `src/routes/school.ts` — all endpoints using raw SQL
- CORS: `ALLOWED_ORIGINS` env var (comma-separated list)
- JWT: `SESSION_SECRET` env var, 7-day expiry
- No workspace DB dependencies — fully standalone

### Supabase Schema Files
- `supabase/migrations/001_initial_schema.sql` — tables, indexes, triggers, enums
- `supabase/migrations/002_rls_policies.sql` — Row Level Security
- `supabase/migrations/003_realtime.sql` — realtime on school_sessions + announcements
- `supabase/migrations/004_storage.sql` — 3 buckets (course-materials, media-gallery, avatars)
- `supabase/migrations/005_functions.sql` — get_school_stats, enroll_student, cleanup
- `supabase/seed.sql` — default users + courses + welcome announcement
- `supabase/README.md` — deployment guide

## DB Tables (Supabase PostgreSQL)
- `school_users` — serial PK; passwords stored plaintext (intentional — admin-view feature)
- `school_courses` — text PK; students/materials as JSONB arrays
- `school_sessions` — text PK; status enum (live/ended/scheduled)
- `contact_submissions` — uuid PK; contact form data
- `donations` — uuid PK; donation tracking
- `announcements` — uuid PK; with audience targeting + expiry

## Auth Flow
- POST `/api/school/auth/login` → `{token, user}` → localStorage
- All endpoints: `Authorization: Bearer <token>`
- Admin gets full user list including passwords; others get students only (no passwords)

## Default Credentials (seeded)
- admin / AfroAdmin2026
- instructor1 / Instructor2026
- assistant1 / Assistant2026
- student1 / Student2026

**Why plaintext passwords:** AdminDashboard has "show password" feature for admins to share credentials. Internal school portal only.

## Env Variables Required
### Backend
- `DATABASE_URL` — Supabase transaction pooler connection string
- `SESSION_SECRET` — JWT signing secret
- `ALLOWED_ORIGINS` — comma-separated CORS origins
- `PORT` — server port (default 4000)

### Frontend
- `VITE_API_URL` — backend URL (no trailing slash)
