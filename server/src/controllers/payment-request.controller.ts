import type { Request, Response, NextFunction } from "express";
import { PaymentRequestService } from "../services/payment-request.service";
import { WalletService } from "../services/wallet.service";
import type { ApiResponse, PaymentRequest } from "../types";

const walletService = new WalletService();
const service = new PaymentRequestService(walletService);

export class PaymentRequestController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const result = await service.create(userId, req.body);

      const response: ApiResponse<PaymentRequest> = { success: true, data: result };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await service.getByToken(req.params.token as string as string);

      if (!result) {
        res.status(404).json({ success: false, error: "Payment request not found" });
        return;
      }

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async fulfill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payerId = req.user!.sub;
      const result = await service.fulfill(req.params.token as string as string, payerId);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const results = await service.listForUser(userId);

      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }
}
