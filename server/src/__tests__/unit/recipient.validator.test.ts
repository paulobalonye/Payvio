import { createRecipientSchema } from "../../validators/recipient.validator";

describe("Recipient Validators", () => {
  describe("createRecipientSchema", () => {
    it("should accept valid bank transfer recipient", () => {
      const result = createRecipientSchema.safeParse({
        country: "NG",
        currency: "NGN",
        first_name: "Amara",
        last_name: "Okafor",
        payout_method: "bank_transfer",
        bank_name: "GTBank",
        account_number: "0123456789",
      });
      expect(result.success).toBe(true);
    });

    it("should accept valid mobile money recipient", () => {
      const result = createRecipientSchema.safeParse({
        country: "KE",
        currency: "KES",
        first_name: "David",
        last_name: "Kamau",
        payout_method: "mobile_money",
        mobile_number: "254712345678",
        mobile_provider: "M-Pesa",
      });
      expect(result.success).toBe(true);
    });

    it("should reject bank transfer without account number", () => {
      const result = createRecipientSchema.safeParse({
        country: "NG",
        currency: "NGN",
        first_name: "Amara",
        last_name: "Okafor",
        payout_method: "bank_transfer",
        bank_name: "GTBank",
      });
      expect(result.success).toBe(false);
    });

    it("should reject mobile money without mobile number", () => {
      const result = createRecipientSchema.safeParse({
        country: "KE",
        currency: "KES",
        first_name: "David",
        last_name: "Kamau",
        payout_method: "mobile_money",
        mobile_provider: "M-Pesa",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid country code length", () => {
      const result = createRecipientSchema.safeParse({
        country: "NGA",
        currency: "NGN",
        first_name: "Test",
        last_name: "User",
        payout_method: "bank_transfer",
        account_number: "0123456789",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty first name", () => {
      const result = createRecipientSchema.safeParse({
        country: "NG",
        currency: "NGN",
        first_name: "",
        last_name: "Okafor",
        payout_method: "bank_transfer",
        account_number: "0123456789",
      });
      expect(result.success).toBe(false);
    });

    it("should accept cash pickup without bank/mobile details", () => {
      const result = createRecipientSchema.safeParse({
        country: "GH",
        currency: "GHS",
        first_name: "Kwame",
        last_name: "Asante",
        payout_method: "cash_pickup",
      });
      expect(result.success).toBe(true);
    });
  });
});
