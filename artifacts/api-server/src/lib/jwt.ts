import jwt from "jsonwebtoken";

const isProduction = process.env["NODE_ENV"] === "production";
const sessionSecret = process.env["SESSION_SECRET"];

// In production (e.g. Vercel) refuse to fall back to the hardcoded secret —
// otherwise anyone with the source could forge admin JWTs.
if (isProduction && !sessionSecret) {
  throw new Error(
    "SESSION_SECRET must be set in production. Refusing to start with the insecure default secret."
  );
}

const JWT_SECRET = sessionSecret || "aoh-school-secret-2026";

export interface JwtPayload {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
