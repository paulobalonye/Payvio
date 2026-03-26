import { z } from "zod/v4";

export const transactionQuerySchema = z.object({
  type: z.enum(["transfer", "wallet_credit", "wallet_debit", "payment_request"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
