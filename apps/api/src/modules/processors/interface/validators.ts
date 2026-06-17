import { z } from 'zod';

export const listProcessorsQuery = z.object({
  type: z.enum(['CPU', 'GPU']).optional(),
  manufacturer: z.enum(['INTEL', 'AMD', 'NVIDIA']).optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const slugParam = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
});
