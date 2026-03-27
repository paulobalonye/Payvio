import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";

export class AdminSettingsService {
  // Admin user CRUD
  async listAdmins() {
    return prisma.adminUser.findMany({
      select: { id: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async deactivateAdmin(adminId: string, actorId: string, ip: string) {
    if (adminId === actorId) throw new AppError(400, "Cannot deactivate yourself");

    await prisma.adminUser.update({ where: { id: adminId }, data: { isActive: false } });

    await prisma.adminAuditLog.create({
      data: { adminId: actorId, action: "DEACTIVATE_ADMIN", entity: "admin_user", entityId: adminId, ipAddress: ip },
    });
  }

  // Transfer limits
  async getLimits() {
    return prisma.transferLimit.findMany();
  }

  async updateLimit(key: string, value: number, adminId: string) {
    return prisma.transferLimit.upsert({
      where: { key },
      create: { key, value, description: key, updatedBy: adminId },
      update: { value, updatedBy: adminId },
    });
  }

  // Feature flags
  async getFeatureFlags() {
    return prisma.featureFlag.findMany();
  }

  async toggleFeatureFlag(key: string, enabled: boolean, adminId: string) {
    return prisma.featureFlag.upsert({
      where: { key },
      create: { key, label: key, enabled, updatedBy: adminId },
      update: { enabled, updatedBy: adminId },
    });
  }

  // Audit log
  async getAuditLog(cursor?: string, limit = 50) {
    const findArgs: any = {
      orderBy: { createdAt: "desc" as const },
      take: limit + 1,
      include: { admin: { select: { email: true, role: true } } },
    };

    if (cursor) {
      findArgs.cursor = { id: cursor };
      findArgs.skip = 1;
    }

    const logs = await prisma.adminAuditLog.findMany(findArgs);
    const hasMore = logs.length > limit;
    const data = hasMore ? logs.slice(0, limit) : logs;

    return { data, has_more: hasMore };
  }
}
