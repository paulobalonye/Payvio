import { TransferService } from "../../services/transfer.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    transfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => fn({
      transfer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      wallet: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      walletAudit: { create: jest.fn() },
      transaction: { create: jest.fn() },
    })),
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

// Mock dependencies
const mockWalletService = {
  debitWallet: jest.fn(),
  creditWallet: jest.fn(),
  getOrCreateWallet: jest.fn(),
};

const mockFxRateService = {
  getRateById: jest.fn(),
};

const mockYellowCardClient = {
  submitTransfer: jest.fn(),
};

describe("TransferService", () => {
  let service: TransferService;

  beforeEach(() => {
    service = new TransferService(
      mockWalletService as any,
      mockFxRateService as any,
      mockYellowCardClient as any
    );
    jest.clearAllMocks();
  });

  describe("createTransfer", () => {
    const validRequest = {
      recipient_id: "rec-1",
      send_amount: 50000,
      send_currency: "USD",
      receive_currency: "NGN",
      rate_id: "rate-123",
      idempotency_key: "idem-123",
    };

    it("should create a transfer successfully", async () => {
      mockFxRateService.getRateById.mockResolvedValue({
        rate_id: "rate-123",
        our_rate: 1560.0,
        fee: 299,
        expires_at: new Date(Date.now() + 30000).toISOString(),
      });

      mockWalletService.debitWallet.mockResolvedValue({ balance: 0 });
      mockWalletService.getOrCreateWallet.mockResolvedValue({ id: "w1" });

      const mockTransfer = {
        id: "transfer-1",
        userId: "user-1",
        recipientId: "rec-1",
        sendAmount: 50000,
        sendCurrency: "USD",
        receiveAmount: 78000000,
        receiveCurrency: "NGN",
        fxRate: 1560.0,
        fee: 299,
        status: "INITIATED",
        rateId: "rate-123",
        idempotencyKey: "idem-123",
        partnerReference: null,
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(null); // no duplicate
      mockPrisma.transfer.create.mockResolvedValue(mockTransfer);
      mockYellowCardClient.submitTransfer.mockResolvedValue({
        reference: "yc-ref-123",
      });
      mockPrisma.transfer.update.mockResolvedValue({
        ...mockTransfer,
        status: "PROCESSING",
        partnerReference: "yc-ref-123",
      });

      const result = await service.createTransfer("user-1", validRequest);

      expect(result.status).toBe("processing");
      expect(result.send_amount).toBe(50000);
    });

    it("should return existing transfer for duplicate idempotency key", async () => {
      const existingTransfer = {
        id: "transfer-1",
        userId: "user-1",
        recipientId: "rec-1",
        sendAmount: 50000,
        sendCurrency: "USD",
        receiveAmount: 78000000,
        receiveCurrency: "NGN",
        fxRate: 1560.0,
        fee: 299,
        status: "PROCESSING",
        rateId: "rate-123",
        idempotencyKey: "idem-123",
        partnerReference: "yc-ref-123",
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(existingTransfer);

      const result = await service.createTransfer("user-1", validRequest);
      expect(result.id).toBe("transfer-1");
      // Should NOT call debit or YellowCard again
      expect(mockWalletService.debitWallet).not.toHaveBeenCalled();
    });

    it("should throw 400 if FX rate is expired", async () => {
      mockFxRateService.getRateById.mockResolvedValue({
        rate_id: "rate-123",
        our_rate: 1560.0,
        fee: 299,
        expires_at: new Date(Date.now() - 5000).toISOString(), // expired
      });

      mockPrisma.transfer.findFirst.mockResolvedValue(null);

      await expect(
        service.createTransfer("user-1", validRequest)
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should throw 404 if rate_id not found", async () => {
      mockFxRateService.getRateById.mockResolvedValue(null);
      mockPrisma.transfer.findFirst.mockResolvedValue(null);

      await expect(
        service.createTransfer("user-1", validRequest)
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("handlePartnerWebhook", () => {
    it("should update status to DELIVERED on success", async () => {
      const transfer = {
        id: "transfer-1",
        userId: "user-1",
        status: "PROCESSING",
        partnerReference: "yc-ref-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        sendAmount: 50000,
        sendCurrency: "USD",
        receiveAmount: 78000000,
        receiveCurrency: "NGN",
        fxRate: 1560.0,
        fee: 299,
        rateId: "rate-123",
        idempotencyKey: "idem-1",
        recipientId: "rec-1",
        deliveredAt: null,
      };
      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.transfer.update.mockResolvedValue({
        ...transfer,
        status: "DELIVERED",
        deliveredAt: new Date(),
      });

      await service.handlePartnerWebhook("yc-ref-123", "completed");

      expect(mockPrisma.transfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "DELIVERED" }),
        })
      );
    });

    it("should trigger refund on failure", async () => {
      const transfer = {
        id: "transfer-1",
        userId: "user-1",
        status: "PROCESSING",
        partnerReference: "yc-ref-123",
        sendAmount: 50000,
        sendCurrency: "USD",
        receiveAmount: 78000000,
        receiveCurrency: "NGN",
        fxRate: 1560.0,
        fee: 299,
        rateId: "rate-123",
        idempotencyKey: "idem-1",
        recipientId: "rec-1",
        deliveredAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.transfer.update.mockResolvedValue({
        ...transfer,
        status: "REFUNDED",
      });

      await service.handlePartnerWebhook("yc-ref-123", "failed");

      expect(mockWalletService.creditWallet).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          amount: 50000,
          source: "transfer_refund",
        })
      );
      expect(mockPrisma.transfer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "REFUNDED" }),
        })
      );
    });
  });

  describe("getTransfer", () => {
    it("should return transfer by ID for correct user", async () => {
      const transfer = {
        id: "transfer-1",
        userId: "user-1",
        recipientId: "rec-1",
        sendAmount: 50000,
        sendCurrency: "USD",
        receiveAmount: 78000000,
        receiveCurrency: "NGN",
        fxRate: 1560.0,
        fee: 299,
        status: "DELIVERED",
        rateId: "rate-123",
        idempotencyKey: "idem-1",
        partnerReference: "yc-ref-123",
        deliveredAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);

      const result = await service.getTransfer("user-1", "transfer-1");
      expect(result).not.toBeNull();
      expect(result!.status).toBe("delivered");
    });
  });
});
