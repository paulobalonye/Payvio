import { Router } from "express";
import { validate } from "../middleware/validate";
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from "../validators/auth.validator";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();
const controller = new AuthController();

authRouter.post("/send-otp", validate(sendOtpSchema), controller.sendOtp);
authRouter.post("/verify-otp", validate(verifyOtpSchema), controller.verifyOtp);
authRouter.post("/refresh", validate(refreshTokenSchema), controller.refresh);

export { authRouter };
