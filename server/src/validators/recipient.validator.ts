import { z } from "zod/v4";

export const createRecipientSchema = z.object({
  country: z.string().length(2),
  currency: z.string().length(3),
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  payout_method: z.enum(["bank_transfer", "mobile_money", "cash_pickup"]),
  bank_name: z.string().max(200).optional(),
  account_number: z.string().max(34).optional(),
  routing_number: z.string().max(20).optional(),
  mobile_number: z.string().max(15).optional(),
  mobile_provider: z.string().max(50).optional(),
}).refine(
  (data) => {
    if (data.payout_method === "bank_transfer") {
      return !!data.account_number;
    }
    if (data.payout_method === "mobile_money") {
      return !!data.mobile_number;
    }
    return true;
  },
  { message: "Bank transfer requires account_number, mobile money requires mobile_number" }
);

export const updateRecipientSchema = z.object({
  country: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
  first_name: z.string().min(1).max(100).trim().optional(),
  last_name: z.string().min(1).max(100).trim().optional(),
  payout_method: z.enum(["bank_transfer", "mobile_money", "cash_pickup"]).optional(),
  bank_name: z.string().max(200).optional(),
  account_number: z.string().max(34).optional(),
  routing_number: z.string().max(20).optional(),
  mobile_number: z.string().max(15).optional(),
  mobile_provider: z.string().max(50).optional(),
});
