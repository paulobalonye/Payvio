import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../validators/user.validator";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();
const controller = new UserController();

userRouter.get("/profile", authenticate, controller.getProfile);
userRouter.patch("/profile", authenticate, validate(updateProfileSchema), controller.updateProfile);

export { userRouter };
