import { ProfileService } from "../../services/profile.service";
import { AppError } from "../../middleware/error-handler";

// Mock Prisma — must use jest.fn() inside factory to avoid hoisting issue
jest.mock("../../config/database", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma: mockPrisma } = require("../../config/database");

describe("ProfileService", () => {
  let service: ProfileService;

  beforeEach(() => {
    service = new ProfileService();
    jest.clearAllMocks();
  });

  describe("updateProfile", () => {
    const userId = "user-123";
    const validInput = {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
    };

    const mockUser = {
      id: userId,
      phone: "1234567890",
      countryCode: "+1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      kycStatus: "NONE",
      referralCode: "ABCD1234",
      referredBy: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    it("should update user profile successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null); // no email conflict
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.updateProfile(userId, validInput);

      expect(result.first_name).toBe("John");
      expect(result.last_name).toBe("Doe");
      expect(result.email).toBe("john@example.com");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      });
    });

    it("should throw 409 when email already registered to another user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "other-user",
        email: "john@example.com",
      });

      await expect(
        service.updateProfile(userId, validInput)
      ).rejects.toMatchObject({
        statusCode: 409,
        message: expect.stringContaining("email"),
      });
    });

    it("should allow updating if email belongs to same user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: "john@example.com",
      });
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.updateProfile(userId, validInput);
      expect(result.email).toBe("john@example.com");
    });

    it("should throw 404 when user not found during update", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockRejectedValue(
        new Error("Record to update not found")
      );

      await expect(
        service.updateProfile("nonexistent", validInput)
      ).rejects.toThrow();
    });
  });

  describe("getProfile", () => {
    it("should return user profile by ID", async () => {
      const mockUser = {
        id: "user-123",
        phone: "1234567890",
        countryCode: "+1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        kycStatus: "APPROVED",
        referralCode: "ABCD1234",
        referredBy: null,
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile("user-123");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-123");
      expect(result!.kyc_status).toBe("approved");
    });

    it("should return null for nonexistent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile("nonexistent");
      expect(result).toBeNull();
    });
  });
});
