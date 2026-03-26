import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { User, UpdateProfileRequest } from "../types";

export class ProfileService {
  async updateProfile(userId: string, input: UpdateProfileRequest): Promise<User> {
    // Check for duplicate email (different user)
    if (input.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existing && existing.id !== userId) {
        throw new AppError(409, "This email is already registered to another account");
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: input.first_name,
        lastName: input.last_name,
        email: input.email,
      },
    });

    return this.toApiUser(updated);
  }

  async getProfile(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? this.toApiUser(user) : null;
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
