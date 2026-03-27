import { PaymentRequestService } from "../../services/payment-request.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    paymentRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

const mockWalletService = {
  creditWallet: jest.fn(),
  debitWallet: jest.fn(),
};

const basePR = {
  id: "pr-1",
  userId: "user-1",
  token: "abc123token",
  amount: 50000,
  currency: "USD",
  note: "For rent",
  status: "PENDING",
  paidBy: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
  createdAt: new Date(),
};

describe("PaymentRequestService", () => {
  let service: PaymentRequestService;

  beforeEach(() => {
    service = new PaymentRequestService(mockWalletService as any);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a payment request with unique token and 7-day expiry", async () => {
      mockPrisma.paymentRequest.create.mockResolvedValue(basePR);

      const result = await service.create("user-1", {
        amount: 50000,
        currency: "USD",
        note: "For rent",
      });

      expect(result.token).toBeDefined();
      expect(result.status).toBe("pending");
      expect(result.amount).toBe(50000);
      expect(mockPrisma.paymentRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            amount: 50000,
            currency: "USD",
          }),
        })
      );
    });

    it("should create request without note", async () => {
      mockPrisma.paymentRequest.create.mockResolvedValue({ ...basePR, note: null });

      const result = await service.create("user-1", {
        amount: 10000,
        currency: "USD",
      });

      expect(result.note).toBeNull();
    });
  });

  describe("fulfill", () => {
    it("should pay a pending request and credit requester wallet", async () => {
      const pendingPR = { ...basePR, status: "PENDING" };
      mockPrisma.paymentRequest.findUnique.mockResolvedValue(pendingPR);
      mockPrisma.paymentRequest.update.mockResolvedValue({
        ...pendingPR,
        status: "PAID",
        paidBy: "payer-1",
      });
      mockWalletService.debitWallet.mockResolvedValue({});
      mockWalletService.creditWallet.mockResolvedValue({});

      const result = await service.fulfill("abc123token", "payer-1");

      expect(result.status).toBe("paid");
      expect(mockWalletService.creditWallet).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ amount: 50000, source: "payment_request" })
      );
    });

    it("should throw 404 for invalid token", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue(null);

      await expect(
        service.fulfill("invalid-token", "payer-1")
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should throw 410 for already paid request", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue({
        ...basePR,
        status: "PAID",
      });

      await expect(
        service.fulfill("abc123token", "payer-1")
      ).rejects.toMatchObject({ statusCode: 410 });
    });

    it("should throw 410 for expired request", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue({
        ...basePR,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.fulfill("abc123token", "payer-1")
      ).rejects.toMatchObject({ statusCode: 410 });
    });

    it("should prevent requester from paying own request", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue(basePR);

      await expect(
        service.fulfill("abc123token", "user-1")
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("getByToken", () => {
    it("should return payment request by token", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue(basePR);

      const result = await service.getByToken("abc123token");
      expect(result).not.toBeNull();
      expect(result!.token).toBe("abc123token");
    });

    it("should return null for nonexistent token", async () => {
      mockPrisma.paymentRequest.findUnique.mockResolvedValue(null);

      const result = await service.getByToken("nonexistent");
      expect(result).toBeNull();
    });
  });
});
