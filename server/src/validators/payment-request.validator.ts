import { z } from "zod/v4";

export const createPaymentRequestSchema = z.object({
  amount: z.number().int().positive().max(250000), // $2500 max in cents
  currency: z.string().length(3),
  note: z.string().max(500).optional(),
});
