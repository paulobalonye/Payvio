import { SettingsService } from "../../services/settings.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

describe("SettingsService", () => {
  let service: SettingsService;

  beforeEach(() => {
    service = new SettingsService();
    jest.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should return user settings", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        phone: "1234567890",
        countryCode: "+1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        kycStatus: "APPROVED",
        referralCode: "ABCD1234",
        referredBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.getSettings("user-1");

      expect(result).not.toBeNull();
      expect(result!.email).toBe("john@example.com");
      expect(result!.kyc_status).toBe("approved");
    });

    it("should return null for nonexistent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getSettings("nonexistent");
      expect(result).toBeNull();
    });
  });

  describe("updateEmail", () => {
    it("should update email successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // no conflict
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        email: "new@example.com",
        phone: "1234567890",
        countryCode: "+1",
        firstName: "John",
        lastName: "Doe",
        kycStatus: "APPROVED",
        referralCode: "ABCD1234",
        referredBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.updateEmail("user-1", "new@example.com");
      expect(result.email).toBe("new@example.com");
    });

    it("should throw 409 if email taken by another user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "other-user",
        email: "taken@example.com",
      });

      await expect(
        service.updateEmail("user-1", "taken@example.com")
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("deleteAccount", () => {
    it("should soft-delete user account", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });
      mockPrisma.user.update.mockResolvedValue({});

      await service.deleteAccount("user-1");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: expect.objectContaining({
          email: expect.stringContaining("deleted-"),
          firstName: "Deleted",
          lastName: "User",
        }),
      });
    });

    it("should throw 404 for nonexistent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteAccount("nonexistent")
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
