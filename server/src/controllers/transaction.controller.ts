import type { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { ReceiptService } from "../services/receipt.service";
import { NotificationService } from "../services/notification.service";
import type { ApiResponse, Transaction } from "../types";

const transactionService = new TransactionService();
const receiptService = new ReceiptService();
const notificationService = new NotificationService();

export class TransactionController {
  async listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const result = await transactionService.list(userId, ((req as any).validated ?? req.query) as any);

      const response: ApiResponse<Transaction[]> = {
        success: true,
        data: result.data,
        meta: result.meta,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const html = receiptService.generateHtml({
        transferId: req.params.id as string,
        senderName: "User",
        recipientName: "Recipient",
        sendAmount: "$0.00",
        receiveAmount: "0.00",
        fxRate: "N/A",
        fee: "$0.00",
        status: "N/A",
        date: new Date().toISOString(),
      });

      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (err) {
      next(err);
    }
  }

  async registerDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const { token, platform } = req.body;
      await notificationService.registerDevice(userId, token, platform);

      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
