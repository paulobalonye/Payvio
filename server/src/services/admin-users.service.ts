import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";

export class AdminUsersService {
  async searchUsers(query: {
    search?: string;
    status?: string;
    cursor?: string;
    limit?: number;
  }) {
    const limit = query.limit ?? 50;
    const where: any = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } },
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { id: query.search },
      ];
    }

    if (query.status === "suspended") {
      where.kycStatus = "REJECTED";
    } else if (query.status === "pending_kyc") {
      where.kycStatus = "PENDING";
    }

    const findArgs: any = {
      where,
      orderBy: { createdAt: "desc" as const },
      take: limit + 1,
    };

    if (query.cursor) {
      findArgs.cursor = { id: query.cursor };
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
        phone: u.phone,
        kyc_status: u.kycStatus.toLowerCase(),
        referral_code: u.referralCode,
        created_at: u.createdAt.toISOString(),
      })),
      has_more: hasMore,
      cursor: data.length > 0 ? data[data.length - 1].id : null,
    };
  }

  async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
        transfersSent: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!user) throw new AppError(404, "User not found");

    const notes = await prisma.adminNote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { user, notes };
  }

  async suspendUser(userId: string, reason: string, adminId: string, ip: string) {
    if (reason.length < 20) throw new AppError(400, "Reason must be at least 20 characters");

    await prisma.user.update({ where: { id: userId }, data: { kycStatus: "REJECTED" } });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "SUSPEND_USER",
        entity: "user",
        entityId: userId,
        details: reason,
        ipAddress: ip,
      },
    });
  }

  async unsuspendUser(userId: string, reason: string, adminId: string, ip: string) {
    if (reason.length < 20) throw new AppError(400, "Reason must be at least 20 characters");

    await prisma.user.update({ where: { id: userId }, data: { kycStatus: "APPROVED" } });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action: "UNSUSPEND_USER",
        entity: "user",
        entityId: userId,
        details: reason,
        ipAddress: ip,
      },
    });
  }

  async addNote(userId: string, content: string, adminId: string) {
    return prisma.adminNote.create({
      data: { userId, adminId, content },
    });
  }
}
