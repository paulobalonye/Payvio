import type { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";
import type { ApiResponse, User } from "../types";

const profileService = new ProfileService();

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const user = await profileService.getProfile(userId);

      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      const response: ApiResponse<User> = { success: true, data: user };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const user = await profileService.updateProfile(userId, req.body);

      const response: ApiResponse<User> = { success: true, data: user };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
}
