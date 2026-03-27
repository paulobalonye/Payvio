import { Router, type Request, type Response, type NextFunction } from "express";
import { adminAuthenticate, requireRole } from "../middleware/admin-auth.middleware";
import { AdminAuthService } from "../services/admin-auth.service";
import { AdminAnalyticsService } from "../services/admin-analytics.service";
import { AdminUsersService } from "../services/admin-users.service";
import { AdminKycService } from "../services/admin-kyc.service";
import { AdminSettingsService } from "../services/admin-settings.service";

const adminRouter = Router();
const authService = new AdminAuthService();
const analyticsService = new AdminAnalyticsService();
const usersService = new AdminUsersService();
const kycService = new AdminKycService();
const settingsService = new AdminSettingsService();

function wrap(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

// === AUTH (public) ===
adminRouter.post("/auth/login", wrap(async (req, res) => {
  const { email, password, totp_code } = req.body;
  const result = await authService.login(email, password, totp_code, req.ip ?? "unknown");
  res.json({ success: true, data: result });
}));

adminRouter.post("/auth/mfa/setup", adminAuthenticate, wrap(async (req, res) => {
  const result = await authService.setupMfa(req.admin!.sub);
  res.json({ success: true, data: result });
}));

// === ANALYTICS ===
adminRouter.get("/analytics/overview", adminAuthenticate, wrap(async (_req, res) => {
  const data = await analyticsService.getOverview();
  res.json({ success: true, data });
}));

adminRouter.get("/analytics/volume", adminAuthenticate, wrap(async (req, res) => {
  const { from, to, group_by } = req.query as any;
  const data = await analyticsService.getVolumeTimeSeries(
    from ?? new Date(Date.now() - 30 * 86400000).toISOString(),
    to ?? new Date().toISOString(),
    group_by
  );
  res.json({ success: true, data });
}));

adminRouter.get("/analytics/corridors", adminAuthenticate, wrap(async (_req, res) => {
  const data = await analyticsService.getCorridors();
  res.json({ success: true, data });
}));

// === USER MANAGEMENT ===
adminRouter.get("/users", adminAuthenticate, wrap(async (req, res) => {
  const data = await usersService.searchUsers(req.query as any);
  res.json({ success: true, ...data });
}));

adminRouter.get("/users/:id", adminAuthenticate, wrap(async (req, res) => {
  const data = await usersService.getUserDetail(req.params.id);
  res.json({ success: true, data });
}));

adminRouter.patch("/users/:id/status", adminAuthenticate, requireRole("SUPER_ADMIN", "COMPLIANCE"), wrap(async (req, res) => {
  const { action, reason } = req.body;
  if (action === "suspend") {
    await usersService.suspendUser(req.params.id, reason, req.admin!.sub, req.ip ?? "unknown");
  } else {
    await usersService.unsuspendUser(req.params.id, reason, req.admin!.sub, req.ip ?? "unknown");
  }
  res.json({ success: true });
}));

adminRouter.post("/users/:id/notes", adminAuthenticate, wrap(async (req, res) => {
  const note = await usersService.addNote(req.params.id, req.body.content, req.admin!.sub);
  res.status(201).json({ success: true, data: note });
}));

// === KYC REVIEW ===
adminRouter.get("/kyc/queue", adminAuthenticate, requireRole("SUPER_ADMIN", "COMPLIANCE"), wrap(async (req, res) => {
  const data = await kycService.getQueue(req.query.status as string, req.query.cursor as string);
  res.json({ success: true, ...data });
}));

adminRouter.post("/kyc/:id/approve", adminAuthenticate, requireRole("SUPER_ADMIN", "COMPLIANCE"), wrap(async (req, res) => {
  await kycService.approve(req.params.id, req.admin!.sub, req.ip ?? "unknown");
  res.json({ success: true });
}));

adminRouter.post("/kyc/:id/reject", adminAuthenticate, requireRole("SUPER_ADMIN", "COMPLIANCE"), wrap(async (req, res) => {
  await kycService.reject(req.params.id, req.body.reason_code, req.admin!.sub, req.ip ?? "unknown");
  res.json({ success: true });
}));

// === TRANSFERS (admin view) ===
adminRouter.get("/transfers", adminAuthenticate, wrap(async (req, res) => {
  const { status, cursor } = req.query as any;
  const where: any = {};
  if (status) where.status = status.toUpperCase();

  const transfers = await (await import("../config/database")).prisma.transfer.findMany({
    where,
    orderBy: { createdAt: "desc" as const },
    take: 101,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = transfers.length > 100;
  const data = hasMore ? transfers.slice(0, 100) : transfers;

  res.json({ success: true, data, has_more: hasMore });
}));

adminRouter.post("/transfers/:id/refund", adminAuthenticate, requireRole("SUPER_ADMIN", "SUPPORT"), wrap(async (req, res) => {
  const { prisma } = await import("../config/database");
  const transfer = await prisma.transfer.findUnique({ where: { id: req.params.id } });
  if (!transfer) { res.status(404).json({ success: false, error: "Transfer not found" }); return; }

  const { WalletService } = await import("../services/wallet.service");
  const walletService = new WalletService();
  await walletService.creditWallet(transfer.userId, {
    amount: transfer.sendAmount,
    currency: transfer.sendCurrency,
    source: "transfer_refund",
    reference_id: transfer.id,
  });

  await prisma.transfer.update({ where: { id: transfer.id }, data: { status: "REFUNDED" } });

  await prisma.adminAuditLog.create({
    data: {
      adminId: req.admin!.sub, action: "MANUAL_REFUND", entity: "transfer",
      entityId: transfer.id, details: req.body.reason, ipAddress: req.ip ?? "unknown",
    },
  });

  res.json({ success: true });
}));

// === FX RATE CONFIG ===
adminRouter.get("/fx/rates", adminAuthenticate, requireRole("SUPER_ADMIN", "FINANCE"), wrap(async (_req, res) => {
  const { prisma } = await import("../config/database");
  const configs = await prisma.fxRateConfig.findMany();
  res.json({ success: true, data: configs });
}));

adminRouter.patch("/fx/rates/:corridor", adminAuthenticate, requireRole("SUPER_ADMIN", "FINANCE"), wrap(async (req, res) => {
  const { prisma } = await import("../config/database");
  const { spread, flat_fee } = req.body;
  const config = await prisma.fxRateConfig.upsert({
    where: { corridor: req.params.corridor },
    create: { corridor: req.params.corridor, spread, flatFee: flat_fee, updatedBy: req.admin!.sub },
    update: { spread, flatFee: flat_fee, updatedBy: req.admin!.sub },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminId: req.admin!.sub, action: "UPDATE_FX_CONFIG", entity: "fx_rate_config",
      entityId: req.params.corridor, details: JSON.stringify({ spread, flat_fee }), ipAddress: req.ip ?? "unknown",
    },
  });

  res.json({ success: true, data: config });
}));

// === PROMOTIONS ===
adminRouter.get("/promotions", adminAuthenticate, wrap(async (_req, res) => {
  const { prisma } = await import("../config/database");
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: promos });
}));

adminRouter.post("/promotions", adminAuthenticate, requireRole("SUPER_ADMIN", "FINANCE"), wrap(async (req, res) => {
  const { prisma } = await import("../config/database");
  const promo = await prisma.promotion.create({
    data: { ...req.body, createdBy: req.admin!.sub },
  });
  res.status(201).json({ success: true, data: promo });
}));

// === SYSTEM SETTINGS ===
adminRouter.get("/system/admins", adminAuthenticate, requireRole("SUPER_ADMIN"), wrap(async (_req, res) => {
  const data = await settingsService.listAdmins();
  res.json({ success: true, data });
}));

adminRouter.post("/system/admins", adminAuthenticate, requireRole("SUPER_ADMIN"), wrap(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.createAdmin(email, password, role, req.admin!.sub, req.ip ?? "unknown");
  res.status(201).json({ success: true, data: result });
}));

adminRouter.patch("/system/admins/:id/deactivate", adminAuthenticate, requireRole("SUPER_ADMIN"), wrap(async (req, res) => {
  await settingsService.deactivateAdmin(req.params.id, req.admin!.sub, req.ip ?? "unknown");
  res.json({ success: true });
}));

adminRouter.get("/system/limits", adminAuthenticate, wrap(async (_req, res) => {
  const data = await settingsService.getLimits();
  res.json({ success: true, data });
}));

adminRouter.patch("/system/limits/:key", adminAuthenticate, requireRole("SUPER_ADMIN", "FINANCE"), wrap(async (req, res) => {
  const data = await settingsService.updateLimit(req.params.key, req.body.value, req.admin!.sub);
  res.json({ success: true, data });
}));

adminRouter.get("/system/feature-flags", adminAuthenticate, wrap(async (_req, res) => {
  const data = await settingsService.getFeatureFlags();
  res.json({ success: true, data });
}));

adminRouter.patch("/system/feature-flags/:key", adminAuthenticate, requireRole("SUPER_ADMIN"), wrap(async (req, res) => {
  const data = await settingsService.toggleFeatureFlag(req.params.key, req.body.enabled, req.admin!.sub);
  res.json({ success: true, data });
}));

adminRouter.get("/system/audit-log", adminAuthenticate, requireRole("SUPER_ADMIN"), wrap(async (req, res) => {
  const data = await settingsService.getAuditLog(req.query.cursor as string);
  res.json({ success: true, ...data });
}));

// === SUPPORT ===
adminRouter.get("/lookup", adminAuthenticate, wrap(async (req, res) => {
  const q = req.query.q as string;
  if (!q) { res.json({ success: true, data: { users: [], transfers: [] } }); return; }

  const { prisma } = await import("../config/database");
  const [users, transfers] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { id: q },
          { referralCode: q.toUpperCase() },
        ],
      },
      take: 10,
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, kycStatus: true },
    }),
    prisma.transfer.findMany({
      where: { OR: [{ id: q }, { idempotencyKey: q }] },
      take: 10,
    }),
  ]);

  res.json({ success: true, data: { users, transfers } });
}));

export { adminRouter };
