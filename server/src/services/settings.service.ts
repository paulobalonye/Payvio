import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { User } from "../types";

export class SettingsService {
  async getSettings(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? this.toApi(user) : null;
  }

  async updateEmail(userId: string, email: string): Promise<User> {
    // Check for duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new AppError(409, "Email already registered to another account");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    return this.toApi(updated);
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Soft delete: anonymize PII but keep record for compliance
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: null,
        firstName: "Deleted",
        lastName: "User",
      },
    });
  }

  private toApi(user: any): User {
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
