import { WalletService } from "../../services/wallet.service";
import { AppError } from "../../middleware/error-handler";

jest.mock("../../config/database", () => ({
  prisma: {
    wallet: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    walletAudit: {
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: any) => Promise<any>) =>
      fn({
        wallet: {
          findUnique: jest.fn(),
          update: jest.fn(),
        },
        walletAudit: {
          create: jest.fn(),
        },
      })
    ),
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

describe("WalletService", () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
    jest.clearAllMocks();
  });

  describe("getWallet", () => {
    it("should return wallet for user and currency", async () => {
      const mockWallet = {
        id: "wallet-1",
        userId: "user-1",
        currency: "USD",
        balance: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getWallet("user-1", "USD");

      expect(result).not.toBeNull();
      expect(result!.balance).toBe(50000);
      expect(result!.currency).toBe("USD");
    });

    it("should return null if wallet not found", async () => {
      mockPrisma.wallet.findUnique.mockResolvedValue(null);

      const result = await service.getWallet("user-1", "USD");
      expect(result).toBeNull();
    });
  });

  describe("getAllWallets", () => {
    it("should return all wallets for a user", async () => {
      const wallets = [
        { id: "w1", userId: "user-1", currency: "USD", balance: 50000, createdAt: new Date(), updatedAt: new Date() },
        { id: "w2", userId: "user-1", currency: "NGN", balance: 780000, createdAt: new Date(), updatedAt: new Date() },
      ];
      mockPrisma.wallet.findMany.mockResolvedValue(wallets);

      const result = await service.getAllWallets("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].currency).toBe("USD");
      expect(result[1].currency).toBe("NGN");
    });

    it("should return empty array for user with no wallets", async () => {
      mockPrisma.wallet.findMany.mockResolvedValue([]);

      const result = await service.getAllWallets("user-1");
      expect(result).toEqual([]);
    });
  });

  describe("createWallet", () => {
    it("should create a wallet with zero balance", async () => {
      const mockWallet = {
        id: "wallet-1",
        userId: "user-1",
        currency: "USD",
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.wallet.create.mockResolvedValue(mockWallet);

      const result = await service.createWallet("user-1", "USD");

      expect(result.balance).toBe(0);
      expect(mockPrisma.wallet.create).toHaveBeenCalledWith({
        data: { userId: "user-1", currency: "USD", balance: 0 },
      });
    });
  });

  describe("creditWallet", () => {
    it("should credit wallet and create audit log", async () => {
      const existingWallet = { id: "w1", userId: "user-1", currency: "USD", balance: 10000 };
      const updatedWallet = { ...existingWallet, balance: 60000, updatedAt: new Date(), createdAt: new Date() };

      // Mock the $transaction to simulate credit
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          wallet: {
            findUnique: jest.fn().mockResolvedValue(existingWallet),
            update: jest.fn().mockResolvedValue(updatedWallet),
          },
          walletAudit: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return fn(tx);
      });

      const result = await service.creditWallet("user-1", {
        amount: 50000,
        currency: "USD",
        source: "card_funding",
        reference_id: "stripe_pi_123",
      });

      expect(result.balance).toBe(60000);
    });

    it("should reject credit with non-positive amount", async () => {
      await expect(
        service.creditWallet("user-1", {
          amount: 0,
          currency: "USD",
          source: "card_funding",
          reference_id: "ref_1",
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should throw if wallet not found", async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          wallet: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
          walletAudit: { create: jest.fn() },
        };
        return fn(tx);
      });

      await expect(
        service.creditWallet("user-1", {
          amount: 5000,
          currency: "USD",
          source: "card_funding",
          reference_id: "ref_1",
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("debitWallet", () => {
    it("should debit wallet when sufficient balance", async () => {
      const existingWallet = { id: "w1", userId: "user-1", currency: "USD", balance: 60000 };
      const updatedWallet = { ...existingWallet, balance: 10000, updatedAt: new Date(), createdAt: new Date() };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          wallet: {
            findUnique: jest.fn().mockResolvedValue(existingWallet),
            update: jest.fn().mockResolvedValue(updatedWallet),
          },
          walletAudit: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      const result = await service.debitWallet("user-1", {
        amount: 50000,
        currency: "USD",
        reason: "transfer_send",
        reference_id: "transfer_123",
      });

      expect(result.balance).toBe(10000);
    });

    it("should throw 400 on insufficient balance (overdraft protection)", async () => {
      const existingWallet = { id: "w1", userId: "user-1", currency: "USD", balance: 1000 };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          wallet: {
            findUnique: jest.fn().mockResolvedValue(existingWallet),
            update: jest.fn(),
          },
          walletAudit: { create: jest.fn() },
        };
        return fn(tx);
      });

      await expect(
        service.debitWallet("user-1", {
          amount: 50000,
          currency: "USD",
          reason: "transfer_send",
          reference_id: "transfer_123",
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should throw if wallet not found", async () => {
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          wallet: {
            findUnique: jest.fn().mockResolvedValue(null),
            update: jest.fn(),
          },
          walletAudit: { create: jest.fn() },
        };
        return fn(tx);
      });

      await expect(
        service.debitWallet("user-1", {
          amount: 5000,
          currency: "USD",
          reason: "transfer_send",
          reference_id: "ref_1",
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("getOrCreateWallet", () => {
    it("should return existing wallet if found", async () => {
      const mockWallet = {
        id: "w1", userId: "user-1", currency: "USD", balance: 5000,
        createdAt: new Date(), updatedAt: new Date(),
      };
      mockPrisma.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getOrCreateWallet("user-1", "USD");
      expect(result.balance).toBe(5000);
      expect(mockPrisma.wallet.create).not.toHaveBeenCalled();
    });

    it("should create wallet if not found", async () => {
      const newWallet = {
        id: "w1", userId: "user-1", currency: "NGN", balance: 0,
        createdAt: new Date(), updatedAt: new Date(),
      };
      mockPrisma.wallet.findUnique.mockResolvedValue(null);
      mockPrisma.wallet.create.mockResolvedValue(newWallet);

      const result = await service.getOrCreateWallet("user-1", "NGN");
      expect(result.balance).toBe(0);
      expect(mockPrisma.wallet.create).toHaveBeenCalled();
    });
  });
});
