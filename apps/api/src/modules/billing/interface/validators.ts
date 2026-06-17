import { z } from 'zod';

export const checkoutBody = z.object({
  plan: z.enum(['pro_monthly', 'pro_yearly']),
});
