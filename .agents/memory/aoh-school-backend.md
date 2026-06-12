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

## 9 Roles (TEXT in DB — Phase 1 expanded from 4 to 9)
Management → AdminDashboard: admin, super_admin, director, registrar, academic_coordinator, finance_officer, hr_officer
Non-management: instructor, assistant → InstructorDashboard; student, alumni → StudentDashboard

## Auth Flow
- POST `/api/school/auth/login` → `{token, user}` → localStorage
- All endpoints: `Authorization: Bearer <token>`
- Management roles get full user list + all CRUD; others get limited access

## Demo Credentials (seeded by seed.ts)
- admin / AfroAdmin2026, superadmin / SuperAdmin2026, director / Director2026
- registrar / Registrar2026, coordinator / Coordinator2026, finance / Finance2026, hr / HR2026
- instructor1 / Instructor2026, assistant1 / Assistant2026
- student1 / Student2026, student2 / Student2026, alumni1 / Alumni2026

**Why plaintext passwords:** AdminDashboard Users tab has show/hide password for admins to share credentials. Internal portal only.

## CRITICAL: Migration 006 must be run in Supabase before Phase 1 tables work
File: `supabase/migrations/006_phase1_expansion.sql`
Run in: Supabase Dashboard → SQL Editor → paste entire file → Run
This converts role/status ENUMs to TEXT and creates enrollments/announcements/events/payments tables.

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
