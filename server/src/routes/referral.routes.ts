import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { ReferralController } from "../controllers/referral.controller";

const referralRouter = Router();
const controller = new ReferralController();

referralRouter.get("/", authenticate, controller.getStats);

export { referralRouter };
