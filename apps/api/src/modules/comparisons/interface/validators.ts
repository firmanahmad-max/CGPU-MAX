import { z } from 'zod';

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, numbers, or dashes');

export const compareBody = z.object({
  aSlug: slug,
  bSlug: slug,
  persist: z.boolean().optional().default(false),
});

export const shareSlugParam = z.object({
  shareSlug: z
    .string()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9-]+$/),
});
