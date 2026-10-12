# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database changes

The numbered SQL files in `supabase/migrations/` are the only schema-change path. Do not use Drizzle schema push or `drizzle-kit push`: it can bypass destructive forward-only migrations such as `016_self_paced_backend_cleanup.sql`. Follow the deployment order in `supabase/README.md`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
