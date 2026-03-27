import type { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service";
import type { ApiResponse, User } from "../types";

const service = new SettingsService();

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const settings = await service.getSettings(userId);

      if (!settings) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { email } = req.body;
      const result = await service.updateEmail(userId, email);

      const response: ApiResponse<User> = { success: true, data: result };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      await service.deleteAccount(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
