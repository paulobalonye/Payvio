import type { Request, Response, NextFunction } from "express";
import { WalletService } from "../services/wallet.service";
import { StripeService } from "../services/stripe.service";
import { FlutterwaveService } from "../services/flutterwave.service";
import type { ApiResponse, Wallet } from "../types";

const walletService = new WalletService();
const stripeService = new StripeService({
  paymentIntents: {
    create: async () => {
      throw new Error("Stripe not configured — set STRIPE_SECRET_KEY");
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

      const result = await stripeService.createFundingIntent(userId, amount, currency ?? "USD");

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = stripeService.parseWebhookEvent(req.body);

      if (parsed) {
        await walletService.creditWallet(parsed.userId, {
          amount: parsed.amount,
          currency: parsed.currency,
          source: "card_funding",
          reference_id: parsed.paymentIntentId,
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
