import type { Request, Response, NextFunction } from "express";
import { WalletService } from "../services/wallet.service";
import { StripeService } from "../services/stripe.service";
import { FlutterwaveService } from "../services/flutterwave.service";
import { TransactionService } from "../services/transaction.service";
import { env } from "../config/env";
import type { ApiResponse, Wallet } from "../types";

const walletService = new WalletService();
const transactionService = new TransactionService();

// Real Stripe client using fetch (no SDK needed)
const stripeService = new StripeService({
  paymentIntents: {
    create: async (params: { amount: number; currency: string; metadata: Record<string, string> }) => {
      const res = await fetch("https://api.stripe.com/v1/payment_intents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          amount: params.amount.toString(),
          currency: params.currency.toLowerCase(),
          "metadata[user_id]": params.metadata.user_id,
          "metadata[type]": params.metadata.type,
        }).toString(),
      });
      if (!res.ok) {
        const err = await res.json() as any;
        throw new Error(err.error?.message ?? "Stripe error");
      }
      return res.json() as Promise<any>;
    },
  },
});
const flutterwaveService = new FlutterwaveService();

export class WalletController {
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const currency = (req.query.currency as string) ?? "USD";
      const wallet = await walletService.getOrCreateWallet(userId, currency);

      const response: ApiResponse<Wallet> = { success: true, data: wallet };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async getAllWallets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const wallets = await walletService.getAllWallets(userId);

      const response: ApiResponse<Wallet[]> = { success: true, data: wallets };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async initiateFunding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { amount, currency } = req.body;

      // Ensure wallet exists before funding
      await walletService.getOrCreateWallet(userId, currency ?? "USD");

      const result = await stripeService.createFundingIntent(userId, amount, currency ?? "USD");

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async creditAfterPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { amount, currency, payment_intent_id } = req.body;

      if (!amount || !payment_intent_id) {
        res.status(400).json({ success: false, error: "Missing amount or payment_intent_id" });
        return;
      }

      // Ensure wallet exists
      await walletService.getOrCreateWallet(userId, currency ?? "USD");

      // Credit the wallet
      const creditAmount = parseInt(amount);
      const creditCurrency = currency ?? "USD";
      const wallet = await walletService.creditWallet(userId, {
        amount: creditAmount,
        currency: creditCurrency,
        source: "card_funding",
        reference_id: payment_intent_id,
      });

      // Record transaction for history
      await transactionService.record({
        userId,
        type: "wallet_credit",
        amount: creditAmount,
        currency: creditCurrency,
        description: "Wallet funded via card",
        status: "completed",
        referenceId: payment_intent_id,
      });

      res.json({ success: true, data: wallet });
    } catch (err) {
      next(err);
    }
  }

  async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["stripe-signature"] as string;
      if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
        res.status(400).json({ success: false, error: "Missing signature" });
        return;
      }

      const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const verified = stripeService.verifyWebhookSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
      if (!verified) {
        res.status(400).json({ success: false, error: "Invalid signature" });
        return;
      }

      const parsed = stripeService.parseWebhookEvent(typeof req.body === "string" ? JSON.parse(req.body) : req.body);

      if (parsed) {
        await walletService.creditWallet(parsed.userId, {
          amount: parsed.amount,
          currency: parsed.currency,
          source: "card_funding",
          reference_id: parsed.paymentIntentId,
        });

        await transactionService.record({
          userId: parsed.userId,
          type: "wallet_credit",
          amount: parsed.amount,
          currency: parsed.currency,
          description: "Wallet funded via card",
          status: "completed",
          referenceId: parsed.paymentIntentId,
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      next(err);
    }
  }

  async verifyBankAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { account_number, bank_code, country } = req.body;
      const result = await flutterwaveService.verifyBankAccount(
        account_number,
        bank_code,
        country ?? "NG"
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getBankList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const country = (req.params.country as string ?? "NG").toUpperCase();
      const banks = await flutterwaveService.getBankList(country);

      res.json({ success: true, data: banks });
    } catch (err) {
      next(err);
    }
  }
}
