import type { Request, Response, NextFunction } from "express";
import { TokenService } from "../services/token.service";
import { AppError } from "./error-handler";
import type { JwtPayload } from "../types";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const tokenService = new TokenService();

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError(401, "Missing or invalid authorization header"));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}
