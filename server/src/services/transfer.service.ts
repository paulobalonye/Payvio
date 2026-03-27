import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { Transfer, CreateTransferRequest } from "../types";
import type { WalletService } from "./wallet.service";
import type { FxRateService } from "./fx-rate.service";

type YellowCardClient = {
  submitTransfer(params: {
    amount: number;
    currency: string;
    recipientId: string;
    rateId: string;
  }): Promise<{ reference: string }>;
};

export class TransferService {
  constructor(
    private readonly walletService: WalletService,
    private readonly fxRateService: FxRateService,
    private readonly yellowCardClient: YellowCardClient
  ) {}

  async createTransfer(userId: string, input: CreateTransferRequest): Promise<Transfer> {
    // Idempotency check
    const existing = await prisma.transfer.findFirst({
      where: { idempotencyKey: input.idempotency_key, userId },
    });

    if (existing) {
      return this.toApi(existing);
    }

    // Validate FX rate
    const rate = await this.fxRateService.getRateById(input.rate_id);
    if (!rate) {
      throw new AppError(404, "FX rate not found. Please request a new quote.");
    }

    if (new Date(rate.expires_at) < new Date()) {
      throw new AppError(400, "FX rate has expired. Please request a new quote.");
    }

    // Calculate receive amount
    const receiveAmount = Math.round(input.send_amount * rate.our_rate);

    // Debit sender wallet
    await this.walletService.debitWallet(userId, {
      amount: input.send_amount + rate.fee,
      currency: input.send_currency,
      reason: "transfer_send",
      reference_id: input.idempotency_key,
    });

    // Create transfer record
    const transfer = await prisma.transfer.create({
      data: {
        userId,
        recipientId: input.recipient_id,
        sendAmount: input.send_amount,
        sendCurrency: input.send_currency,
        receiveAmount,
        receiveCurrency: input.receive_currency,
        fxRate: rate.our_rate,
        fee: rate.fee,
        status: "INITIATED",
        rateId: input.rate_id,
        idempotencyKey: input.idempotency_key,
      },
    });

    // Submit to YellowCard
    try {
      const partnerResult = await this.yellowCardClient.submitTransfer({
        amount: receiveAmount,
        currency: input.receive_currency,
        recipientId: input.recipient_id,
        rateId: input.rate_id,
      });

      // Update with partner reference
      const updated = await prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: "PROCESSING",
          partnerReference: partnerResult.reference,
        },
      });

      return this.toApi(updated);
    } catch {
      // If partner submission fails, mark as failed (refund handled separately)
      const failed = await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: "FAILED" },
      });
      return this.toApi(failed);
    }
  }

  async handlePartnerWebhook(
    partnerReference: string,
    status: "completed" | "failed"
  ): Promise<void> {
    const transfer = await prisma.transfer.findFirst({
      where: { partnerReference },
    });

    if (!transfer) return;

    if (status === "completed") {
      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
    } else if (status === "failed") {
      // Refund the sender
      await this.walletService.creditWallet(transfer.userId, {
        amount: transfer.sendAmount,
        currency: transfer.sendCurrency,
        source: "transfer_refund",
        reference_id: transfer.id,
      });

      await prisma.transfer.update({
        where: { id: transfer.id },
        data: { status: "REFUNDED" },
      });
    }
  }

  async getTransfer(userId: string, transferId: string): Promise<Transfer | null> {
    const transfer = await prisma.transfer.findFirst({
      where: { id: transferId, userId },
    });
    return transfer ? this.toApi(transfer) : null;
  }

  async listTransfers(userId: string): Promise<Transfer[]> {
    const transfers = await prisma.transfer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return transfers.map((t) => this.toApi(t));
  }

  private toApi(t: any): Transfer {
    return {
      id: t.id,
      user_id: t.userId,
      recipient_id: t.recipientId,
      send_amount: t.sendAmount,
      send_currency: t.sendCurrency,
      receive_amount: t.receiveAmount,
      receive_currency: t.receiveCurrency,
      fx_rate: t.fxRate,
      fee: t.fee,
      status: t.status.toLowerCase() as Transfer["status"],
      rate_id: t.rateId,
      idempotency_key: t.idempotencyKey,
      partner_reference: t.partnerReference,
      created_at: t.createdAt.toISOString(),
      updated_at: t.updatedAt.toISOString(),
    };
  }
}
