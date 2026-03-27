import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createPaymentRequestSchema } from "../validators/payment-request.validator";
import { PaymentRequestController } from "../controllers/payment-request.controller";

const paymentRequestRouter = Router();
const controller = new PaymentRequestController();

paymentRequestRouter.post("/", authenticate, validate(createPaymentRequestSchema), controller.create);
paymentRequestRouter.get("/", authenticate, controller.list);
paymentRequestRouter.get("/:token", controller.getByToken); // public — for payer landing page
paymentRequestRouter.post("/:token/pay", authenticate, controller.fulfill);

export { paymentRequestRouter };
