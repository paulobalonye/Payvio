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

export const initiateFundingSchema = z.object({
  amount: z.number().int().min(1000, "Minimum funding amount is $10.00").max(250000, "Maximum funding amount is $2,500.00"),
  currency: z.string().length(3).optional(),
});

export const creditAfterPaymentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).optional(),
  payment_intent_id: z.string().min(1, "payment_intent_id is required"),
});

export const verifyBankSchema = z.object({
  account_number: z.string().min(1, "Account number is required"),
  bank_code: z.string().optional(),
  network_id: z.string().optional(),
  country: z.string().length(2).optional(),
});
