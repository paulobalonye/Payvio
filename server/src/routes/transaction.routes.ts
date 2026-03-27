import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { transactionQuerySchema } from "../validators/transaction.validator";
import { TransactionController } from "../controllers/transaction.controller";

const transactionRouter = Router();
const controller = new TransactionController();

// Transaction history (authenticated)
transactionRouter.get("/", authenticate, validate(transactionQuerySchema, "query"), controller.listTransactions);

// Receipt (authenticated)
transactionRouter.get("/:id/receipt", authenticate, controller.getReceipt);

// Device registration (authenticated)
transactionRouter.post("/devices/register", authenticate, controller.registerDevice);

export { transactionRouter };
