import type { Request, Response, NextFunction } from "express";
import { KycService } from "../services/kyc.service";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import type { ApiResponse, CreateKycSessionResponse } from "../types";

const kycService = new KycService();

export class KycController {
  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const result = await kycService.createSession(userId);

      const response: ApiResponse<CreateKycSessionResponse> = {
        success: true,
        data: result,
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers["x-hmac-signature"] as string;
      const rawBody = JSON.stringify(req.body);

      if (!signature) {
        throw new AppError(401, "Missing webhook signature");
      }

      const isValid = kycService.verifyWebhookSignature(
        rawBody,
        signature,
        env.VERIFF_SHARED_SECRET
      );

      if (!isValid) {
        throw new AppError(401, "Invalid webhook signature");
      }

      await kycService.handleWebhook(req.body);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
