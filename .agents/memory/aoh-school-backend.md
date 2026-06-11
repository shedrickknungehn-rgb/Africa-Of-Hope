---
name: Africa of Hope — School Backend Integration
description: How the school management system is wired to the Express backend and PostgreSQL DB.
---

## Architecture
- Frontend: `artifacts/africa-of-hope/src/pages/school/schoolApi.ts` — all API calls, JWT stored in `aoh_school_token` + `aoh_school_user` localStorage keys.
- Backend routes: `artifacts/api-server/src/routes/school.ts` mounted at `/api/school`
- JWT helpers: `artifacts/api-server/src/lib/jwt.ts` — uses `SESSION_SECRET` env var
- DB seed: `artifacts/api-server/src/lib/seed.ts` — runs at startup, inserts defaults only if admin doesn't exist

## DB Tables
- `school_users` — serial PK; passwords stored plaintext (intentional for admin-view feature)
- `school_courses` — text PK (generated ID); students/materials stored as jsonb
- `school_sessions` — text PK

## Auth Flow
- POST `/api/school/auth/login` → `{token, user}` → stored in localStorage
- All other endpoints require `Authorization: Bearer <token>`
- Admin role gets full user list with passwords; others only see students without passwords

## Default Credentials (seeded)
- admin / AfroAdmin2026
- instructor1 / Instructor2026
- assistant1 / Assistant2026
- student1 / Student2026

**Why plaintext passwords:** The AdminDashboard has an existing "show password" feature for admins to view/share credentials with users. This is an internal school portal, not a public internet app.
