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

// Stripe webhook (public — validated by signature)
walletRouter.post("/webhooks/stripe", controller.handleStripeWebhook);

// Bank verification (Flutterwave)
walletRouter.post("/banks/verify", authenticate, controller.verifyBankAccount);
walletRouter.get("/banks/:country", authenticate, controller.getBankList);

export { walletRouter };
