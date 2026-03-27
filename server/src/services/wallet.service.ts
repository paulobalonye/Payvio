import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { Wallet, CreditWalletRequest, DebitWalletRequest } from "../types";

export class WalletService {
  async getWallet(userId: string, currency: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });
    return wallet ? this.toApiWallet(wallet) : null;
  }

  async getAllWallets(userId: string): Promise<Wallet[]> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return wallets.map((w) => this.toApiWallet(w));
  }

  async createWallet(userId: string, currency: string): Promise<Wallet> {
    const wallet = await prisma.wallet.create({
      data: { userId, currency, balance: 0 },
    });
    return this.toApiWallet(wallet);
  }

  async getOrCreateWallet(userId: string, currency: string): Promise<Wallet> {
    const existing = await this.getWallet(userId, currency);
    if (existing) return existing;
    return this.createWallet(userId, currency);
  }

  async creditWallet(userId: string, input: CreditWalletRequest): Promise<Wallet> {
    if (input.amount <= 0) {
      throw new AppError(400, "Credit amount must be positive");
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId_currency: { userId, currency: input.currency } },
      });

      if (!wallet) {
        throw new AppError(404, "Wallet not found");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance + input.amount },
      });

      await tx.walletAudit.create({
        data: {
          walletId: wallet.id,
          type: "credit",
          amount: input.amount,
          source: input.source,
          referenceId: input.reference_id,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
        },
      });

      return updatedWallet;
    });

    return this.toApiWallet(result);
  }

  async debitWallet(userId: string, input: DebitWalletRequest): Promise<Wallet> {
    if (input.amount <= 0) {
      throw new AppError(400, "Debit amount must be positive");
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId_currency: { userId, currency: input.currency } },
      });

      if (!wallet) {
        throw new AppError(404, "Wallet not found");
      }

      if (wallet.balance < input.amount) {
        throw new AppError(400, "Insufficient balance");
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - input.amount },
      });

      await tx.walletAudit.create({
        data: {
          walletId: wallet.id,
          type: "debit",
          amount: input.amount,
          source: input.reason,
          referenceId: input.reference_id,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
        },
      });

      return updatedWallet;
    });

    return this.toApiWallet(result);
  }

  private toApiWallet(wallet: any): Wallet {
    return {
      id: wallet.id,
      user_id: wallet.userId,
      currency: wallet.currency,
      balance: wallet.balance,
      created_at: wallet.createdAt.toISOString(),
      updated_at: wallet.updatedAt.toISOString(),
    };
  }
}
