import { prisma } from "../config/database";
import type { Transaction, TransactionQuery, TransactionType, PaginationMeta } from "../types";

type TransactionListResult = {
  readonly data: Transaction[];
  readonly meta: PaginationMeta;
};

type RecordInput = {
  readonly userId: string;
  readonly type: TransactionType;
  readonly amount: number;
  readonly currency: string;
  readonly description: string;
  readonly status: string;
  readonly referenceId: string;
};

export class TransactionService {
  async list(userId: string, query: TransactionQuery): Promise<TransactionListResult> {
    const limit = query.limit ?? 20;
    const where: any = { userId };

    if (query.type) {
      where.type = query.type.toUpperCase();
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const findArgs: any = {
      where,
      orderBy: { createdAt: "desc" as const },
      take: limit + 1, // fetch 1 extra to check has_more
    };

    if (query.cursor) {
      findArgs.cursor = { id: query.cursor };
      findArgs.skip = 1; // skip the cursor item itself
    }

    const rows = await prisma.transaction.findMany(findArgs);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    return {
      data: data.map((t: any) => this.toApi(t)),
      meta: {
        total: data.length,
        has_more: hasMore,
        cursor: data.length > 0 ? data[data.length - 1].id : undefined,
      },
    };
  }

  async record(input: RecordInput): Promise<Transaction> {
    const created = await prisma.transaction.create({
      data: {
        userId: input.userId,
        type: input.type.toUpperCase() as any,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        status: input.status,
        referenceId: input.referenceId,
      },
    });
    return this.toApi(created);
  }

  private toApi(t: any): Transaction {
    return {
      id: t.id,
      user_id: t.userId,
      type: t.type.toLowerCase() as TransactionType,
      amount: t.amount,
      currency: t.currency,
      description: t.description,
      status: t.status,
      reference_id: t.referenceId,
      created_at: t.createdAt.toISOString(),
    };
  }
}
