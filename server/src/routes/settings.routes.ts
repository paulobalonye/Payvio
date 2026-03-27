import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { SettingsController } from "../controllers/settings.controller";

const settingsRouter = Router();
const controller = new SettingsController();

settingsRouter.get("/", authenticate, controller.getSettings);
settingsRouter.patch("/email", authenticate, controller.updateEmail);
settingsRouter.delete("/account", authenticate, controller.deleteAccount);

export { settingsRouter };
