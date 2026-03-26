import { transactionQuerySchema } from "../../validators/transaction.validator";

describe("Transaction Validators", () => {
  describe("transactionQuerySchema", () => {
    it("should accept empty query (all defaults)", () => {
      const result = transactionQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid type filter", () => {
      const result = transactionQuerySchema.safeParse({
        type: "transfer",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid type filter", () => {
      const result = transactionQuerySchema.safeParse({
        type: "unknown_type",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid date range", () => {
      const result = transactionQuerySchema.safeParse({
        from: "2025-01-01T00:00:00Z",
        to: "2025-12-31T23:59:59Z",
      });
      expect(result.success).toBe(true);
    });

    it("should reject limit above 100", () => {
      const result = transactionQuerySchema.safeParse({
        limit: "150",
      });
      expect(result.success).toBe(false);
    });

    it("should reject limit below 1", () => {
      const result = transactionQuerySchema.safeParse({
        limit: "0",
      });
      expect(result.success).toBe(false);
    });

    it("should coerce string limit to number", () => {
      const result = transactionQuerySchema.safeParse({
        limit: "50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });
  });
});
