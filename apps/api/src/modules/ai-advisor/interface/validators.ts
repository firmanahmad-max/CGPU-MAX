import { z } from 'zod';

export const adviceBody = z.object({
  budgetUsd: z.coerce.number().int().min(200).max(20000),
  purpose: z.enum(['gaming', 'streaming', 'workstation', 'budget', 'content_creation']),
  resolution: z.enum(['1080p', '1440p', '4K']),
  preferences: z.string().max(500).optional(),
  language: z.enum(['en', 'id']).optional(),
  includeMonitor: z.coerce.boolean().optional(),
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
    .array(z.object({ category: PICK_CATEGORY, slug: z.string().trim().min(1).max(120) }))
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
