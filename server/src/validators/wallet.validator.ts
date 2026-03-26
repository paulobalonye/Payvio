import { z } from "zod/v4";

export const creditWalletSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  source: z.enum(["card_funding", "ach_funding", "transfer_refund", "referral_reward", "payment_request"]),
  reference_id: z.string().min(1),
});

export const debitWalletSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3),
  reason: z.enum(["transfer_send", "payment_request"]),
  reference_id: z.string().min(1),
});
