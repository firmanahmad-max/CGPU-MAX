import { z } from 'zod';

export const adviceBody = z.object({
  budgetUsd: z.coerce.number().int().min(200).max(20000),
  purpose: z.enum(['gaming', 'streaming', 'workstation', 'budget', 'content_creation']),
  resolution: z.enum(['1080p', '1440p', '4K']),
  preferences: z.string().max(500).optional(),
});

export const shareSlugParam = z.object({
  shareSlug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
});
