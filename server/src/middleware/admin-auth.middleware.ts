import type { Request, Response, NextFunction } from "express";
import { AdminAuthService } from "../services/admin-auth.service";
import { AppError } from "./error-handler";

const adminAuth = new AdminAuthService();

declare global {
  namespace Express {
    interface Request {
      admin?: { sub: string; email: string; role: string };
    }
  }
}

export function adminAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Missing admin authorization"));
    return;
  }

  try {
    const payload = adminAuth.verifyAdminToken(authHeader.slice(7));
    req.admin = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid admin token"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      next(new AppError(401, "Not authenticated"));
      return;
    }
    if (!roles.includes(req.admin.role)) {
      next(new AppError(403, `Access denied. Required role: ${roles.join(" or ")}`));
      return;
    }
    next();
  };
}
