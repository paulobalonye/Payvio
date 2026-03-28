import type { Request, Response, NextFunction } from "express";
import { FxRateService } from "../services/fx-rate.service";
import { RecipientService } from "../services/recipient.service";
import { TransferService } from "../services/transfer.service";
import { TransactionService } from "../services/transaction.service";
import { WalletService } from "../services/wallet.service";
import { YellowCardClient } from "../services/yellowcard.client";
import type { ApiResponse, FxRate, Recipient, Transfer } from "../types";

const fxRateService = new FxRateService();
const recipientService = new RecipientService();
const walletService = new WalletService();
const transactionService = new TransactionService();
const yellowCardClient = new YellowCardClient();
const transferService = new TransferService(
  walletService,
  fxRateService,
  yellowCardClient,
  transactionService
);

export class TransferController {
  // FX Rates
  async getRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { from, to } = ((req as any).validated ?? req.query) as { from: string; to: string };
      const rate = await fxRateService.getRate(from, to);

      const response: ApiResponse<FxRate> = { success: true, data: rate };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  // Recipients
  async createRecipient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const recipient = await recipientService.create(userId, req.body);

      const response: ApiResponse<Recipient> = { success: true, data: recipient };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async listRecipients(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const recipients = await recipientService.list(userId);

      const response: ApiResponse<Recipient[]> = { success: true, data: recipients };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async getRecipient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const recipient = await recipientService.getById(userId, req.params.id as string as string);

      if (!recipient) {
        res.status(404).json({ success: false, error: "Recipient not found" });
        return;
      }

      const response: ApiResponse<Recipient> = { success: true, data: recipient };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async deleteRecipient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      await recipientService.softDelete(userId, req.params.id as string as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Transfers
  async createTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const transfer = await transferService.createTransfer(userId, req.body);

      const response: ApiResponse<Transfer> = { success: true, data: transfer };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  async getTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const transfer = await transferService.getTransfer(userId, req.params.id as string as string);

      if (!transfer) {
        res.status(404).json({ success: false, error: "Transfer not found" });
        return;
      }

      const response: ApiResponse<Transfer> = { success: true, data: transfer };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async listTransfers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.sub;
      const transfers = await transferService.listTransfers(userId);

      const response: ApiResponse<Transfer[]> = { success: true, data: transfers };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  // YellowCard webhook
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reference, status } = req.body;
      await transferService.handlePartnerWebhook(reference, status);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
