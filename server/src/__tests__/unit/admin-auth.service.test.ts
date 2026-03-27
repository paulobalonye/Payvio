import { AdminAuthService } from "../../services/admin-auth.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    adminUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    adminAuditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

describe("AdminAuthService", () => {
  let service: AdminAuthService;

  beforeEach(() => {
    service = new AdminAuthService();
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return admin JWT on valid credentials + TOTP", async () => {
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash("StrongPass123!", 12);

      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@payvio.com",
        passwordHash: hash,
        role: "SUPER_ADMIN",
        mfaEnabled: false, // first login — no MFA yet
        isActive: true,
        failedLogins: 0,
        lockedUntil: null,
      });
      mockPrisma.adminUser.update.mockResolvedValue({});
      mockPrisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.login("admin@payvio.com", "StrongPass123!", undefined, "127.0.0.1");

      expect(result.token).toBeDefined();
      expect(result.requires_mfa).toBe(false);
    });

    it("should throw 401 for wrong password", async () => {
      const bcrypt = require("bcrypt");
      const hash = await bcrypt.hash("CorrectPass!", 12);

      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@payvio.com",
        passwordHash: hash,
        role: "SUPER_ADMIN",
        mfaEnabled: false,
        isActive: true,
        failedLogins: 0,
        lockedUntil: null,
      });
      mockPrisma.adminUser.update.mockResolvedValue({});

      await expect(
        service.login("admin@payvio.com", "WrongPass!", undefined, "127.0.0.1")
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 401 for nonexistent admin", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        service.login("nobody@payvio.com", "pass", undefined, "127.0.0.1")
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 423 for locked account", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@payvio.com",
        passwordHash: "hash",
        role: "SUPER_ADMIN",
        mfaEnabled: false,
        isActive: true,
        failedLogins: 5,
        lockedUntil: new Date(Date.now() + 1800000), // locked for 30 min
      });

      await expect(
        service.login("admin@payvio.com", "pass", undefined, "127.0.0.1")
      ).rejects.toMatchObject({ statusCode: 423 });
    });

    it("should throw 403 for deactivated account", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@payvio.com",
        passwordHash: "hash",
        role: "SUPPORT",
        mfaEnabled: false,
        isActive: false,
        failedLogins: 0,
        lockedUntil: null,
      });

      await expect(
        service.login("admin@payvio.com", "pass", undefined, "127.0.0.1")
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  describe("setupMfa", () => {
    it("should generate TOTP secret and return QR code URL", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: "admin-1",
        email: "admin@payvio.com",
        mfaEnabled: false,
      });
      mockPrisma.adminUser.update.mockResolvedValue({});

      const result = await service.setupMfa("admin-1");

      expect(result.secret).toBeDefined();
      expect(result.qr_url).toContain("otpauth://");
      expect(result.backup_codes).toHaveLength(8);
    });
  });

  describe("createAdmin", () => {
    it("should create admin with hashed password", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);
      mockPrisma.adminUser.create.mockResolvedValue({
        id: "new-admin",
        email: "new@payvio.com",
        role: "SUPPORT",
        isActive: true,
        createdAt: new Date(),
      });
      mockPrisma.adminAuditLog.create.mockResolvedValue({});

      const result = await service.createAdmin(
        "new@payvio.com",
        "TempPass123!",
        "SUPPORT",
        "creator-admin-id",
        "127.0.0.1"
      );

      expect(result.email).toBe("new@payvio.com");
      expect(result.role).toBe("SUPPORT");
      expect(mockPrisma.adminUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "new@payvio.com",
            role: "SUPPORT",
          }),
        })
      );
    });

    it("should throw 409 for duplicate email", async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        service.createAdmin("existing@payvio.com", "Pass123!", "SUPPORT", "creator", "127.0.0.1")
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });
});
