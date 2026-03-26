import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import { TokenService } from "./token.service";
import { UserService } from "./user.service";
import type { AuthTokens, VerifyOtpResponse } from "../types";

export class AuthService {
  private readonly tokenService = new TokenService();
  private readonly userService = new UserService();

  async handleVerifiedOtp(phone: string, countryCode: string): Promise<VerifyOtpResponse> {
    const user = await this.userService.findOrCreateByPhone(phone, countryCode);
    const tokens = this.tokenService.generateTokenPair(user.id, phone);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refresh_token,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL * 1000),
      },
    });

    return { tokens, user };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    // Find refresh token in DB
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) {
      throw new AppError(401, "Invalid refresh token");
    }

    if (stored.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new AppError(401, "Refresh token expired");
    }

    // Rotate: delete old token, create new pair
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const newTokens = this.tokenService.generateTokenPair(
      stored.user.id,
      stored.user.phone
    );

    await prisma.refreshToken.create({
      data: {
        userId: stored.user.id,
        token: newTokens.refresh_token,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL * 1000),
      },
    });

    return newTokens;
  }
}
