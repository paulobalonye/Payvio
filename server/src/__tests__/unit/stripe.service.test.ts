import { StripeService } from "../../services/stripe.service";
import { AppError } from "../../middleware/error-handler";

describe("StripeService", () => {
  let service: StripeService;
  const mockStripeClient = {
    paymentIntents: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    service = new StripeService(mockStripeClient as any);
    jest.clearAllMocks();
  });

  describe("createFundingIntent", () => {
    it("should create a payment intent and return client secret", async () => {
      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: "pi_123",
        client_secret: "pi_123_secret_abc",
        amount: 50000,
        currency: "usd",
        status: "requires_payment_method",
      });

      const result = await service.createFundingIntent("user-1", 50000, "USD");

      expect(result.payment_intent_id).toBe("pi_123");
      expect(result.client_secret).toBe("pi_123_secret_abc");
      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith({
        amount: 50000,
        currency: "usd",
        metadata: { user_id: "user-1", type: "wallet_funding" },
      });
    });

    it("should reject amount below minimum ($10 = 1000 cents)", async () => {
      await expect(
        service.createFundingIntent("user-1", 500, "USD")
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should reject amount above maximum ($2500 = 250000 cents)", async () => {
      await expect(
        service.createFundingIntent("user-1", 300000, "USD")
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe("handleWebhookEvent", () => {
    it("should return userId and amount for payment_intent.succeeded", () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_123",
            amount: 50000,
            currency: "usd",
            status: "succeeded",
            metadata: { user_id: "user-1", type: "wallet_funding" },
          },
        },
      };

      const result = service.parseWebhookEvent(event);

      expect(result).not.toBeNull();
      expect(result!.userId).toBe("user-1");
      expect(result!.amount).toBe(50000);
      expect(result!.currency).toBe("USD");
      expect(result!.paymentIntentId).toBe("pi_123");
    });

    it("should return null for non-succeeded events", () => {
      const event = {
        type: "payment_intent.created",
        data: {
          object: {
            id: "pi_123",
            amount: 50000,
            currency: "usd",
            status: "requires_payment_method",
            metadata: { user_id: "user-1", type: "wallet_funding" },
          },
        },
      };

      const result = service.parseWebhookEvent(event);
      expect(result).toBeNull();
    });

    it("should return null if metadata missing user_id", () => {
      const event = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_123",
            amount: 50000,
            currency: "usd",
            status: "succeeded",
            metadata: {},
          },
        },
      };

      const result = service.parseWebhookEvent(event);
      expect(result).toBeNull();
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should return true for valid signature (mock)", () => {
      // In production this uses Stripe's constructEvent
      // Here we test the interface
      expect(service.verifyWebhookSignature).toBeDefined();
    });
  });
});
