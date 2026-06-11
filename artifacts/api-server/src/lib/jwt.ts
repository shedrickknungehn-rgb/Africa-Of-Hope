import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["SESSION_SECRET"] || "aoh-school-secret-2026";

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
