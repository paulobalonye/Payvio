import { TransactionService } from "../../services/transaction.service";

jest.mock("../../config/database", () => ({
  prisma: {
    transaction: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const { prisma: mockPrisma } = require("../../config/database");

const mockTx = (overrides: Partial<any> = {}) => ({
  id: "tx-1",
  userId: "user-1",
  type: "TRANSFER",
  amount: 50000,
  currency: "USD",
  description: "Sent $500 to Amara Okafor",
  status: "delivered",
  referenceId: "transfer-1",
  createdAt: new Date("2025-06-01T12:00:00Z"),
  ...overrides,
});

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should return paginated transactions sorted descending by date", async () => {
      const txs = [
        mockTx({ id: "tx-2", createdAt: new Date("2025-06-02") }),
        mockTx({ id: "tx-1", createdAt: new Date("2025-06-01") }),
      ];
      mockPrisma.transaction.findMany.mockResolvedValue(txs);

      const result = await service.list("user-1", {});

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe("tx-2"); // most recent first
    });

    it("should default to 20 items per page", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.list("user-1", {});

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 21 }) // fetch 21 to determine has_more
      );
    });

    it("should filter by transaction type", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTx()]);

      await service.list("user-1", { type: "transfer" });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: "TRANSFER" }),
        })
      );
    });

    it("should filter by date range", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.list("user-1", {
        from: "2025-01-01T00:00:00Z",
        to: "2025-12-31T23:59:59Z",
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it("should support cursor-based pagination", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTx()]);

      await service.list("user-1", { cursor: "tx-prev", limit: 10 });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "tx-prev" },
          skip: 1,
          take: 11,
        })
      );
    });

    it("should set has_more=true when more items exist", async () => {
      // Return 21 items (limit 20 + 1 extra)
      const txs = Array.from({ length: 21 }, (_, i) =>
        mockTx({ id: `tx-${i}` })
      );
      mockPrisma.transaction.findMany.mockResolvedValue(txs);

      const result = await service.list("user-1", { limit: 20 });

      expect(result.meta.has_more).toBe(true);
      expect(result.data).toHaveLength(20); // returns only 20, not 21
    });

    it("should set has_more=false when no more items", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTx()]);

      const result = await service.list("user-1", { limit: 20 });

      expect(result.meta.has_more).toBe(false);
    });

    it("should return empty data array for user with no transactions", async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.list("user-1", {});

      expect(result.data).toEqual([]);
      expect(result.meta.has_more).toBe(false);
    });
  });

  describe("record", () => {
    it("should create a transaction record", async () => {
      const created = mockTx();
      mockPrisma.transaction.create.mockResolvedValue(created);

      const result = await service.record({
        userId: "user-1",
        type: "transfer",
        amount: 50000,
        currency: "USD",
        description: "Sent $500 to Amara Okafor",
        status: "delivered",
        referenceId: "transfer-1",
      });

      expect(result.id).toBe("tx-1");
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });
  });
});
