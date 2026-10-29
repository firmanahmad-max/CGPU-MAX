import { z } from 'zod';

export const adviceBody = z.object({
  budgetUsd: z.coerce.number().int().min(200).max(20000),
  purpose: z.enum(['gaming', 'streaming', 'workstation', 'budget', 'content_creation']),
  resolution: z.enum(['1080p', '1440p', '4K']),
  preferences: z.string().max(500).optional(),
  language: z.enum(['en', 'id']).optional(),
  // Strict boolean: z.coerce.boolean() would turn the string "false" into true.
  includeMonitor: z.boolean().optional(),
  tier: z.enum(['value', 'balanced', 'premium']).optional(),
});

const PICK_CATEGORY = z.enum([
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'ssd',
  'psu',
  'case',
  'cooler',
  'monitor',
]);

export const recomputeBody = z.object({
  picks: z
    .array(
      z.object({
        category: PICK_CATEGORY,
        // null for a part the advisor suggested outside our catalog — it still
        // counts toward the total via its priceUsd.
        slug: z.string().trim().min(1).max(120).nullable(),
        // Fallback price when the slug has no catalog price (or slug is null).
        priceUsd: z.number().nonnegative().max(100000).optional(),
      }),
    )
    .min(1)
    .max(9),
  resolution: z.enum(['1080p', '1440p', '4K']),
});

export const shareSlugParam = z.object({
  shareSlug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
});
