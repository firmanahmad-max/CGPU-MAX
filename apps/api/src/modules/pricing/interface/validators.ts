import { z } from 'zod';

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/);

export const historyQuery = z.object({
  days: z.coerce.number().int().min(1).max(730).default(365),
});

export const slugParam = z.object({ slug });

export const createAlertBody = z.object({
  slug,
  targetPriceUsd: z.coerce.number().positive().max(100000),
  direction: z.enum(['BELOW', 'ABOVE']).default('BELOW'),
});

export const alertIdParam = z.object({ id: z.string().uuid() });
