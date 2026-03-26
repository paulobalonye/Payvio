import { z } from "zod/v4";

export const createTransferSchema = z.object({
  recipient_id: z.uuid(),
  send_amount: z.number().int().positive().min(1000).max(250000), // $10 min, $2500 max in cents
  send_currency: z.string().length(3),
  receive_currency: z.string().length(3),
  rate_id: z.uuid(),
  idempotency_key: z.uuid(),
});

export const fxRateQuerySchema = z.object({
  from: z.string().length(3),
  to: z.string().length(3),
  amount: z.coerce.number().positive().optional(),
});
