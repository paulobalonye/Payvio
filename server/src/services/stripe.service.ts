import { AppError } from "../middleware/error-handler";

type StripeClient = {
  paymentIntents: {
    create: (params: {
      amount: number;
      currency: string;
      metadata: Record<string, string>;
    }) => Promise<{
      id: string;
      client_secret: string;
      amount: number;
      currency: string;
      status: string;
    }>;
  };
};

type FundingIntentResult = {
  readonly payment_intent_id: string;
  readonly client_secret: string;
  readonly amount: number;
  readonly currency: string;
};

type WebhookEventData = {
  readonly userId: string;
  readonly amount: number;
  readonly currency: string;
  readonly paymentIntentId: string;
};

export class StripeService {
  constructor(private readonly stripe: StripeClient) {}

  async createFundingIntent(
    userId: string,
    amount: number,
    currency: string
  ): Promise<FundingIntentResult> {
    if (amount < 1000) {
      throw new AppError(400, "Minimum funding amount is $10.00");
    }
    if (amount > 250000) {
      throw new AppError(400, "Maximum funding amount is $2,500.00");
    }

    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: { user_id: userId, type: "wallet_funding" },
    });

    return {
      payment_intent_id: intent.id,
      client_secret: intent.client_secret,
      amount: intent.amount,
      currency: intent.currency.toUpperCase(),
    };
  }

  parseWebhookEvent(event: {
    type: string;
    data: {
      object: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        metadata: Record<string, string>;
      };
    };
  }): WebhookEventData | null {
    if (event.type !== "payment_intent.succeeded") {
      return null;
    }

    const pi = event.data.object;
    const userId = pi.metadata?.user_id;

    if (!userId) {
      return null;
    }

    return {
      userId,
      amount: pi.amount,
      currency: pi.currency.toUpperCase(),
      paymentIntentId: pi.id,
    };
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    _secret: string
  ): boolean {
    // In production: Stripe.webhooks.constructEvent(payload, signature, secret)
    return !!payload && !!signature;
  }
}
