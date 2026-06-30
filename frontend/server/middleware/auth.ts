import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-production";

export interface AuthRequest extends Request {
  userId?: string;
  userType?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Nicht autorisiert" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as { userId: string; type: string };
    req.userId = payload.userId;
    req.userType = payload.type;
    next();
  } catch {
    res.status(401).json({ error: "Token ungültig" });
  }
}

export function signToken(userId: string, type: string) {
  return jwt.sign({ userId, type }, SECRET, { expiresIn: "30d" });
}
