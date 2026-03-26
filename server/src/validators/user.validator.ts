import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).trim(),
  last_name: z.string().min(1).max(100).trim(),
  email: z.email(),
});
