import crypto from "crypto";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { TokenService } from "./token.service";
import type { AuthTokens, User } from "../types";

export class EmailAuthService {
  private readonly tokenService = new TokenService();

  async handleVerifiedEmail(email: string): Promise<{ tokens: AuthTokens; user: User }> {
    const normalizedEmail = email.trim().toLowerCase();

    // Find or create user by email
    let dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!dbUser) {
      const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
      dbUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
          referralCode,
        },
      });
    }

    const tokens = this.tokenService.generateTokenPair(dbUser.id, normalizedEmail);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: dbUser.id,
        token: tokens.refresh_token,
        expiresAt: new Date(Date.now() + env.JWT_REFRESH_TTL * 1000),
      },
    });

    const user: User = {
      id: dbUser.id,
      phone: dbUser.phone ?? "",
      country_code: dbUser.countryCode ?? "",
      first_name: dbUser.firstName,
      last_name: dbUser.lastName,
      email: dbUser.email,
      kyc_status: dbUser.kycStatus.toLowerCase() as User["kyc_status"],
      referral_code: dbUser.referralCode,
      created_at: dbUser.createdAt.toISOString(),
      updated_at: dbUser.updatedAt.toISOString(),
    };

    return { tokens, user };
  }
}
