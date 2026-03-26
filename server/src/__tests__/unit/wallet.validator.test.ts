import { creditWalletSchema, debitWalletSchema } from "../../validators/wallet.validator";

describe("Wallet Validators", () => {
  describe("creditWalletSchema", () => {
    it("should accept valid credit request", () => {
      const result = creditWalletSchema.safeParse({
        amount: 50000,
        currency: "USD",
        source: "card_funding",
        reference_id: "stripe_pi_123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject zero amount", () => {
      const result = creditWalletSchema.safeParse({
        amount: 0,
        currency: "USD",
        source: "card_funding",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject negative amount", () => {
      const result = creditWalletSchema.safeParse({
        amount: -100,
        currency: "USD",
        source: "card_funding",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject float amount (must be integer cents)", () => {
      const result = creditWalletSchema.safeParse({
        amount: 100.5,
        currency: "USD",
        source: "card_funding",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid source type", () => {
      const result = creditWalletSchema.safeParse({
        amount: 5000,
        currency: "USD",
        source: "magic_money",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid currency code length", () => {
      const result = creditWalletSchema.safeParse({
        amount: 5000,
        currency: "US",
        source: "card_funding",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("debitWalletSchema", () => {
    it("should accept valid debit request", () => {
      const result = debitWalletSchema.safeParse({
        amount: 10000,
        currency: "USD",
        reason: "transfer_send",
        reference_id: "transfer_123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid debit reason", () => {
      const result = debitWalletSchema.safeParse({
        amount: 10000,
        currency: "USD",
        reason: "card_funding",
        reference_id: "ref_123",
      });
      expect(result.success).toBe(false);
    });
  });
});
