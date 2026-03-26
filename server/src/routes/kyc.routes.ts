import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { KycController } from "../controllers/kyc.controller";

const kycRouter = Router();
const controller = new KycController();

// Authenticated: create KYC session
kycRouter.post("/session", authenticate, controller.createSession);

// Public: Veriff webhook (validated by signature)
kycRouter.post("/webhook", controller.handleWebhook);

export { kycRouter };
