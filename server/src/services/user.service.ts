import crypto from "crypto";
import { prisma } from "../config/database";
import type { User } from "../types";

export class UserService {
  async findOrCreateByPhone(phone: string, countryCode: string, referredBy?: string): Promise<User> {
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      const referralCode = this.generateReferralCode();
      user = await prisma.user.create({
        data: {
          phone,
          countryCode,
          referralCode,
          referredBy: referredBy ?? null,
        },
      });
    }

    return this.toApiUser(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toApiUser(user) : null;
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  private toApiUser(user: any): User {
    return {
      id: user.id,
      phone: user.phone,
      country_code: user.countryCode,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      kyc_status: user.kycStatus.toLowerCase() as User["kyc_status"],
      referral_code: user.referralCode,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
    };
  }
}
