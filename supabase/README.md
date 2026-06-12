# Africa of Hope — Supabase Production Setup

## Quick Start

Run these SQL files **in order** in your Supabase project:
**Dashboard → SQL Editor → New Query → paste → Run**

| File | Purpose |
|------|---------|
| `migrations/001_initial_schema.sql` | Tables, indexes, triggers |
| `migrations/002_rls_policies.sql` | Row Level Security |
| `migrations/003_realtime.sql` | Realtime subscriptions |
| `migrations/004_storage.sql` | File storage buckets |
| `migrations/005_functions.sql` | Helper functions |
| `seed.sql` | Demo/default data |

## Backend Environment Variables

Set these in your Express server's environment:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=your-long-random-secret
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=4000
NODE_ENV=production
```

**Get `DATABASE_URL` from:**
Supabase Dashboard → Project Settings → Database → Connection string → Transaction pooler

## Frontend Environment Variables (Vercel)

Set in Vercel Project Settings → Environment Variables:

```env
VITE_API_URL=https://your-express-backend.com
```

## Realtime (School Portal)

Live session updates and announcements use Supabase Realtime.
Tables subscribed: `school_sessions`, `announcements`

## Storage Buckets

| Bucket | Public | Max Size | Purpose |
|--------|--------|----------|---------|
| `course-materials` | No | 50 MB | PDFs, slides, docs |
| `media-gallery` | Yes | 10 MB | Website gallery images |
| `avatars` | Yes | 2 MB | User profile pictures |

## Edge Functions (optional — for webhook integrations)

Create in Supabase Dashboard → Edge Functions:
- `notify-new-donation` — webhook when donation record created
- `send-welcome-email` — triggered after new school_user created

## Auth (Supabase Auth — optional upgrade)

The school portal currently uses **custom JWT auth** (username/password in `school_users`).

To upgrade to Supabase Auth:
1. Create a `supabase.auth.users` mapping table
2. Replace `POST /api/school/auth/login` with Supabase `signInWithPassword()`
3. Replace JWT middleware with Supabase session validation

The existing custom auth remains fully functional for the current system.
