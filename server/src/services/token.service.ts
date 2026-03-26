import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
import type { JwtPayload, AuthTokens } from "../types";

export class TokenService {
  generateAccessToken(userId: string, phone: string): string {
    return jwt.sign(
      { sub: userId, phone } as Omit<JwtPayload, "iat" | "exp">,
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_TTL }
    );
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(48).toString("hex");
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  generateTokenPair(userId: string, phone: string): AuthTokens {
    return {
      access_token: this.generateAccessToken(userId, phone),
      refresh_token: this.generateRefreshToken(),
    };
  }

  decodeWithoutVerify(token: string): JwtPayload | null {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") return null;
    return decoded as JwtPayload;
  }
}
