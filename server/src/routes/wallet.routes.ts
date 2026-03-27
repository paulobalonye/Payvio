import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { WalletController } from "../controllers/wallet.controller";

const walletRouter = Router();
const controller = new WalletController();

// Authenticated wallet endpoints
walletRouter.get("/", authenticate, controller.getWallet);
walletRouter.get("/all", authenticate, controller.getAllWallets);

// Funding
walletRouter.post("/fund", authenticate, controller.initiateFunding);

// Credit wallet after successful Stripe payment (called by mobile app)
walletRouter.post("/credit-after-payment", authenticate, controller.creditAfterPayment);

// Stripe webhook (public — validated by signature)
walletRouter.post("/webhooks/stripe", controller.handleStripeWebhook);

// Bank verification (Flutterwave)
walletRouter.post("/banks/verify", authenticate, controller.verifyBankAccount);
walletRouter.get("/banks/:country", authenticate, controller.getBankList);

export { walletRouter };
