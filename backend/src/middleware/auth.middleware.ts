import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "CLIENT" | "SUPPLIER" | "ADMIN";

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

    res.locals.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthPayload;

    if (!user || user.role !== role) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
}
