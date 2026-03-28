import type { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { ReceiptService } from "../services/receipt.service";
import { NotificationService } from "../services/notification.service";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
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
      const userId = req.user!.sub;
      const transferId = req.params.id as string;

      const transfer = await prisma.transfer.findFirst({
        where: { id: transferId, userId },
        include: {
          user: { select: { firstName: true, lastName: true } },
          recipient: { select: { firstName: true, lastName: true } },
        },
      });

      if (!transfer) {
        throw new AppError(404, "Transfer not found");
      }

      const senderName = [transfer.user.firstName, transfer.user.lastName].filter(Boolean).join(" ") || "Unknown";
      const recipientName = [transfer.recipient.firstName, transfer.recipient.lastName].filter(Boolean).join(" ") || "Unknown";
      const fmt = (cents: number, currency: string) => `${currency === "USD" ? "$" : ""}${(cents / 100).toFixed(2)}${currency !== "USD" ? ` ${currency}` : ""}`;

      const html = receiptService.generateHtml({
        transferId: transfer.id,
        senderName,
        recipientName,
        sendAmount: fmt(transfer.sendAmount, transfer.sendCurrency),
        receiveAmount: fmt(transfer.receiveAmount, transfer.receiveCurrency),
        fxRate: `1 ${transfer.sendCurrency} = ${transfer.fxRate.toFixed(4)} ${transfer.receiveCurrency}`,
        fee: fmt(transfer.fee, transfer.sendCurrency),
        status: transfer.status,
        date: transfer.createdAt.toISOString(),
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
