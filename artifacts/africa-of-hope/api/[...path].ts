// Vercel serverless catch-all for the school API.
//
// This runs the existing Express app (artifacts/api-server) as a serverless
// function on the same Vercel domain as the SPA, so the frontend's same-origin
// `/api/*` requests are handled here — no separate API host is required.
//
// The Express app is imported from the api-server's prebuilt esbuild bundle
// (dist/app.mjs), which already handles CJS interop (express) and pino. The
// Vercel build runs `pnpm --filter @workspace/api-server build` first so this
// file exists at function-trace time. The app's `app.use("/api", router)`
// matches because Vercel passes the full original path (`/api/...`) as req.url.
//
// Note: this entry intentionally skips index.ts, so `app.listen()` and
// `seedSchoolData()` do not run on Vercel. Seed/demo data comes from the
// Supabase migrations, and the function is stateless by design.
import app from "../../api-server/dist/app.mjs";

export default app;
