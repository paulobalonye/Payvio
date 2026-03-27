import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";

export class AdminKycService {
  async getQueue(status = "PENDING", cursor?: string, limit = 50) {
    const where: any = { kycStatus: status };

    const findArgs: any = {
      where,
      orderBy: { createdAt: "asc" as const },
      take: limit + 1,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        createdAt: true,
      },
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const users = await prisma.user.findMany(findArgs);
    const hasMore = users.length > limit;
    const data = hasMore ? users.slice(0, limit) : users;

    return {
      data: data.map((u: any) => ({
        id: u.id,
        first_name: u.firstName,
        last_name: u.lastName,
        email: u.email,
        kyc_status: u.kycStatus.toLowerCase(),
        submitted_at: u.createdAt.toISOString(),
        hours_in_queue: Math.round((Date.now() - u.createdAt.getTime()) / 3600000),
      })),
      has_more: hasMore,
    };
  }

  async approve(userId: string, adminId: string, ip: string) {
    await prisma.user.update({ where: { id: userId }, data: { kycStatus: "APPROVED" } });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "KYC_APPROVE",
        entity: "user",
        entityId: userId,
        ipAddress: ip,
      },
    });
  }

  async reject(userId: string, reasonCode: string, adminId: string, ip: string) {
    await prisma.user.update({ where: { id: userId }, data: { kycStatus: "REJECTED" } });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "KYC_REJECT",
        entity: "user",
        entityId: userId,
        details: reasonCode,
        ipAddress: ip,
      },
    });
  }
}
