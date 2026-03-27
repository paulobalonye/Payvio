import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createTransferSchema, fxRateQuerySchema } from "../validators/transfer.validator";
import { createRecipientSchema } from "../validators/recipient.validator";
import { TransferController } from "../controllers/transfer.controller";

const transferRouter = Router();
const controller = new TransferController();

// FX rates (authenticated)
transferRouter.get("/fx/rate", authenticate, validate(fxRateQuerySchema, "query"), controller.getRate);

// Recipients CRUD (authenticated)
transferRouter.post("/recipients", authenticate, validate(createRecipientSchema), controller.createRecipient);
transferRouter.get("/recipients", authenticate, controller.listRecipients);
transferRouter.get("/recipients/:id", authenticate, controller.getRecipient);
transferRouter.delete("/recipients/:id", authenticate, controller.deleteRecipient);

// Transfers (authenticated)
transferRouter.post("/transfers", authenticate, validate(createTransferSchema), controller.createTransfer);
transferRouter.get("/transfers", authenticate, controller.listTransfers);
transferRouter.get("/transfers/:id", authenticate, controller.getTransfer);

// YellowCard webhook (public — validated by signature)
transferRouter.post("/webhooks/yellowcard", controller.handleWebhook);

export { transferRouter };
