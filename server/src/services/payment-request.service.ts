import crypto from "crypto";
import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { PaymentRequest, CreatePaymentRequestInput } from "../types";
import type { WalletService } from "./wallet.service";

const EXPIRY_DAYS = 7;

export class PaymentRequestService {
  constructor(private readonly walletService: WalletService) {}

  async create(userId: string, input: CreatePaymentRequestInput): Promise<PaymentRequest> {
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 3600_000);

    const pr = await prisma.paymentRequest.create({
      data: {
        userId,
        token,
        amount: input.amount,
        currency: input.currency,
        note: input.note ?? null,
        expiresAt,
      },
    });

    return this.toApi(pr);
  }

  async fulfill(token: string, payerId: string): Promise<PaymentRequest> {
    const pr = await prisma.paymentRequest.findUnique({
      where: { token },
    });

    if (!pr) {
      throw new AppError(404, "Payment request not found");
    }

    if (pr.status !== "PENDING") {
      throw new AppError(410, "Payment request is no longer available");
    }

    if (pr.expiresAt < new Date()) {
      throw new AppError(410, "Payment request has expired");
    }

    if (pr.userId === payerId) {
      throw new AppError(400, "You cannot pay your own payment request");
    }

    // Debit payer
    await this.walletService.debitWallet(payerId, {
      amount: pr.amount,
      currency: pr.currency,
      reason: "payment_request",
      reference_id: pr.id,
    });

    // Credit requester
    await this.walletService.creditWallet(pr.userId, {
      amount: pr.amount,
      currency: pr.currency,
      source: "payment_request",
      reference_id: pr.id,
    });

    // Update status
    const updated = await prisma.paymentRequest.update({
      where: { id: pr.id },
      data: { status: "PAID", paidBy: payerId },
    });

    return this.toApi(updated);
  }

  async getByToken(token: string): Promise<PaymentRequest | null> {
    const pr = await prisma.paymentRequest.findUnique({ where: { token } });
    return pr ? this.toApi(pr) : null;
  }

  async listForUser(userId: string): Promise<PaymentRequest[]> {
    const prs = await prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return prs.map((pr: any) => this.toApi(pr));
  }

  private toApi(pr: any): PaymentRequest {
    return {
      id: pr.id,
      user_id: pr.userId,
      token: pr.token,
      amount: pr.amount,
      currency: pr.currency,
      note: pr.note,
      status: pr.status.toLowerCase() as PaymentRequest["status"],
      paid_by: pr.paidBy,
      expires_at: pr.expiresAt.toISOString(),
      created_at: pr.createdAt.toISOString(),
    };
  }
}
