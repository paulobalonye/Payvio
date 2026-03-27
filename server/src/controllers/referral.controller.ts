import type { Request, Response, NextFunction } from "express";
import { ReferralService } from "../services/referral.service";
import { WalletService } from "../services/wallet.service";
import type { ApiResponse, ReferralStats } from "../types";

const walletService = new WalletService();
const service = new ReferralService(walletService);

export class ReferralController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const stats = await service.getStats(userId);

      const response: ApiResponse<ReferralStats> = { success: true, data: stats };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
}
