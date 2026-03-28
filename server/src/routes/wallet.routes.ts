import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { WalletController } from "../controllers/wallet.controller";
import {
  initiateFundingSchema,
  creditAfterPaymentSchema,
  verifyBankSchema,
} from "../validators/wallet.validator";

const walletRouter = Router();
const controller = new WalletController();

// Authenticated wallet endpoints
walletRouter.get("/", authenticate, controller.getWallet);
walletRouter.get("/all", authenticate, controller.getAllWallets);

// Funding
walletRouter.post("/fund", authenticate, validate(initiateFundingSchema), controller.initiateFunding);

// Credit wallet after successful Stripe payment (called by mobile app)
walletRouter.post("/credit-after-payment", authenticate, validate(creditAfterPaymentSchema), controller.creditAfterPayment);

// Stripe webhook (public — validated by signature)
walletRouter.post("/webhooks/stripe", controller.handleStripeWebhook);

// Bank verification (Flutterwave for NG, YellowCard for others)
walletRouter.post("/banks/verify", authenticate, validate(verifyBankSchema), controller.verifyBankAccount);
walletRouter.get("/banks/:country", authenticate, controller.getBankList);

// Mobile money verification (YellowCard)
walletRouter.post("/momo/verify", authenticate, controller.verifyMomoAccount);

// YellowCard channels per country
walletRouter.get("/channels/:country", authenticate, controller.getChannels);

export { walletRouter };
