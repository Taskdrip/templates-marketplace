import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET ?? "fallback-secret-change-in-prod";

export interface JwtPayload {
  userId: number;
  role: string;
  pending2fa?: boolean;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function signPendingToken(payload: { userId: number; role: string }): string {
  return jwt.sign({ ...payload, pending2fa: true }, JWT_SECRET, { expiresIn: "10m" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
