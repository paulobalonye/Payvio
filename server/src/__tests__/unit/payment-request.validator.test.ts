import { createPaymentRequestSchema } from "../../validators/payment-request.validator";

describe("Payment Request Validators", () => {
  describe("createPaymentRequestSchema", () => {
    it("should accept valid payment request", () => {
      const result = createPaymentRequestSchema.safeParse({
        amount: 50000,
        currency: "USD",
        note: "For rent",
      });
      expect(result.success).toBe(true);
    });

    it("should accept payment request without note", () => {
      const result = createPaymentRequestSchema.safeParse({
        amount: 10000,
        currency: "USD",
      });
      expect(result.success).toBe(true);
    });

    it("should reject amount over $2500 (250000 cents)", () => {
      const result = createPaymentRequestSchema.safeParse({
        amount: 300000,
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const result = createPaymentRequestSchema.safeParse({
        amount: 0,
        currency: "USD",
      });
      expect(result.success).toBe(false);
    });

    it("should reject note longer than 500 characters", () => {
      const result = createPaymentRequestSchema.safeParse({
        amount: 5000,
        currency: "USD",
        note: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });
  });
});
