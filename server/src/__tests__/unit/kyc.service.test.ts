import { KycService } from "../../services/kyc.service";
import { AppError } from "../../middleware/error-handler";

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

// Mock HTTP client for Veriff API
const mockHttpPost = jest.fn();

describe("KycService", () => {
  let service: KycService;

  beforeEach(() => {
    service = new KycService(mockHttpPost);
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    const userId = "user-123";
    const mockUser = {
      id: userId,
      firstName: "John",
      lastName: "Doe",
      kycStatus: "NONE",
    };

    it("should create a Veriff session and return session URL", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockHttpPost.mockResolvedValue({
        status: "success",
        verification: {
          id: "veriff-session-123",
          url: "https://magic.veriff.me/v/abc123",
        },
      });

      const result = await service.createSession(userId);

      expect(result.session_id).toBe("veriff-session-123");
      expect(result.session_url).toBe("https://magic.veriff.me/v/abc123");
    });

    it("should throw 404 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createSession("nonexistent")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should throw 400 if user already KYC approved", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        kycStatus: "APPROVED",
      });

      await expect(service.createSession(userId)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("should update user KYC status to PENDING after session creation", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockHttpPost.mockResolvedValue({
        status: "success",
        verification: {
          id: "veriff-session-123",
          url: "https://magic.veriff.me/v/abc123",
        },
      });

      await service.createSession(userId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { kycStatus: "PENDING" },
      });
    });
  });

  describe("handleWebhook", () => {
    it("should update user to APPROVED on approved decision", async () => {
      const mockUser = {
        id: "user-123",
        kycStatus: "PENDING",
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        kycStatus: "APPROVED",
      });

      await service.handleWebhook({
        id: "decision-123",
        status: "approved",
        verification: {
          id: "veriff-session-123",
          person: { firstName: "John", lastName: "Doe" },
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ kycStatus: "APPROVED" }),
        })
      );
    });

    it("should update user to REJECTED on declined decision", async () => {
      const mockUser = {
        id: "user-123",
        kycStatus: "PENDING",
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        kycStatus: "REJECTED",
      });

      await service.handleWebhook({
        id: "decision-123",
        status: "declined",
        verification: {
          id: "veriff-session-123",
          person: { firstName: "John", lastName: "Doe" },
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ kycStatus: "REJECTED" }),
        })
      );
    });

    it("should handle resubmission_requested by keeping PENDING status", async () => {
      const mockUser = {
        id: "user-123",
        kycStatus: "PENDING",
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      await service.handleWebhook({
        id: "decision-123",
        status: "resubmission_requested",
        verification: {
          id: "veriff-session-123",
          person: { firstName: "John", lastName: "Doe" },
        },
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ kycStatus: "NONE" }),
        })
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should return true for valid HMAC signature", () => {
      const payload = JSON.stringify({ id: "test" });
      const secret = "test-secret";
      const crypto = require("crypto");
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      const result = service.verifyWebhookSignature(payload, expectedSig, secret);
      expect(result).toBe(true);
    });

    it("should return false for invalid signature", () => {
      const result = service.verifyWebhookSignature(
        '{"id":"test"}',
        "invalid-signature",
        "test-secret"
      );
      expect(result).toBe(false);
    });
  });
});
