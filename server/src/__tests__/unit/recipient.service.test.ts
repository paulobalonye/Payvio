import { RecipientService } from "../../services/recipient.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    recipient: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

const mockRecipient = {
  id: "rec-1",
  userId: "user-1",
  country: "NG",
  currency: "NGN",
  firstName: "Amara",
  lastName: "Okafor",
  payoutMethod: "BANK_TRANSFER",
  bankName: "GTBank",
  accountNumber: "0123456789",
  routingNumber: null,
  mobileNumber: null,
  mobileProvider: null,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("RecipientService", () => {
  let service: RecipientService;

  beforeEach(() => {
    service = new RecipientService();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a bank transfer recipient", async () => {
      mockPrisma.recipient.count.mockResolvedValue(0);
      mockPrisma.recipient.create.mockResolvedValue(mockRecipient);

      const result = await service.create("user-1", {
        country: "NG",
        currency: "NGN",
        first_name: "Amara",
        last_name: "Okafor",
        payout_method: "bank_transfer",
        bank_name: "GTBank",
        account_number: "0123456789",
      });

      expect(result.first_name).toBe("Amara");
      expect(result.payout_method).toBe("bank_transfer");
    });

    it("should throw 400 if user has 50 recipients already", async () => {
      mockPrisma.recipient.count.mockResolvedValue(50);

      await expect(
        service.create("user-1", {
          country: "NG",
          currency: "NGN",
          first_name: "New",
          last_name: "Recipient",
          payout_method: "bank_transfer",
          account_number: "1234567890",
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("list", () => {
    it("should return non-archived recipients sorted by recent use", async () => {
      mockPrisma.recipient.findMany.mockResolvedValue([mockRecipient]);

      const result = await service.list("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].is_archived).toBe(false);
    });

    it("should return empty array if no recipients", async () => {
      mockPrisma.recipient.findMany.mockResolvedValue([]);

      const result = await service.list("user-1");
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return recipient by ID for correct user", async () => {
      mockPrisma.recipient.findFirst.mockResolvedValue(mockRecipient);

      const result = await service.getById("user-1", "rec-1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("rec-1");
    });

    it("should return null if recipient belongs to different user", async () => {
      mockPrisma.recipient.findFirst.mockResolvedValue(null);

      const result = await service.getById("other-user", "rec-1");
      expect(result).toBeNull();
    });
  });

  describe("softDelete", () => {
    it("should archive recipient instead of deleting", async () => {
      mockPrisma.recipient.findFirst.mockResolvedValue(mockRecipient);
      mockPrisma.recipient.update.mockResolvedValue({ ...mockRecipient, isArchived: true });

      await service.softDelete("user-1", "rec-1");

      expect(mockPrisma.recipient.update).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        data: { isArchived: true },
      });
    });

    it("should throw 404 if recipient not found", async () => {
      mockPrisma.recipient.findFirst.mockResolvedValue(null);

      await expect(
        service.softDelete("user-1", "nonexistent")
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
