import { prisma } from "../config/database";
import { AppError } from "../middleware/error-handler";
import type { Recipient, CreateRecipientRequest } from "../types";

const MAX_RECIPIENTS = 50;

export class RecipientService {
  async create(userId: string, input: CreateRecipientRequest): Promise<Recipient> {
    const count = await prisma.recipient.count({
      where: { userId, isArchived: false },
    });

    if (count >= MAX_RECIPIENTS) {
      throw new AppError(400, `Maximum of ${MAX_RECIPIENTS} saved recipients reached`);
    }

    const recipient = await prisma.recipient.create({
      data: {
        userId,
        country: input.country,
        currency: input.currency,
        firstName: input.first_name,
        lastName: input.last_name,
        payoutMethod: input.payout_method.toUpperCase() as any,
        bankName: input.bank_name ?? null,
        accountNumber: input.account_number ?? null,
        routingNumber: input.routing_number ?? null,
        mobileNumber: input.mobile_number ?? null,
        mobileProvider: input.mobile_provider ?? null,
      },
    });

    return this.toApi(recipient);
  }

  async list(userId: string): Promise<Recipient[]> {
    const recipients = await prisma.recipient.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
    });
    return recipients.map((r) => this.toApi(r));
  }

  async getById(userId: string, recipientId: string): Promise<Recipient | null> {
    const recipient = await prisma.recipient.findFirst({
      where: { id: recipientId, userId, isArchived: false },
    });
    return recipient ? this.toApi(recipient) : null;
  }

  async softDelete(userId: string, recipientId: string): Promise<void> {
    const recipient = await prisma.recipient.findFirst({
      where: { id: recipientId, userId },
    });

    if (!recipient) {
      throw new AppError(404, "Recipient not found");
    }

    await prisma.recipient.update({
      where: { id: recipientId },
      data: { isArchived: true },
    });
  }

  private toApi(r: any): Recipient {
    return {
      id: r.id,
      user_id: r.userId,
      country: r.country,
      currency: r.currency,
      first_name: r.firstName,
      last_name: r.lastName,
      payout_method: r.payoutMethod.toLowerCase() as Recipient["payout_method"],
      bank_name: r.bankName,
      account_number: r.accountNumber,
      routing_number: r.routingNumber,
      mobile_number: r.mobileNumber,
      mobile_provider: r.mobileProvider,
      is_archived: r.isArchived,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    };
  }
}
