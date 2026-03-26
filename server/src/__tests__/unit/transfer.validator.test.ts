import { createTransferSchema, fxRateQuerySchema } from "../../validators/transfer.validator";

describe("Transfer Validators", () => {
  describe("createTransferSchema", () => {
    const validTransfer = {
      recipient_id: "550e8400-e29b-41d4-a716-446655440000",
      send_amount: 50000, // $500 in cents
      send_currency: "USD",
      receive_currency: "NGN",
      rate_id: "660e8400-e29b-41d4-a716-446655440000",
      idempotency_key: "770e8400-e29b-41d4-a716-446655440000",
    };

    it("should accept valid transfer request", () => {
      const result = createTransferSchema.safeParse(validTransfer);
      expect(result.success).toBe(true);
    });

    it("should reject amount below minimum ($10 = 1000 cents)", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        send_amount: 500,
      });
      expect(result.success).toBe(false);
    });

    it("should reject amount above maximum ($2500 = 250000 cents)", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        send_amount: 300000,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID for recipient_id", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        recipient_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID for rate_id", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        rate_id: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUID for idempotency_key", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        idempotency_key: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-integer amount", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        send_amount: 500.5,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid currency code", () => {
      const result = createTransferSchema.safeParse({
        ...validTransfer,
        send_currency: "US",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fxRateQuerySchema", () => {
    it("should accept valid FX rate query", () => {
      const result = fxRateQuerySchema.safeParse({
        from: "USD",
        to: "NGN",
      });
      expect(result.success).toBe(true);
    });

    it("should accept query with optional amount", () => {
      const result = fxRateQuerySchema.safeParse({
        from: "USD",
        to: "NGN",
        amount: "500",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid currency code length", () => {
      const result = fxRateQuerySchema.safeParse({
        from: "US",
        to: "NGN",
      });
      expect(result.success).toBe(false);
    });
  });
});
