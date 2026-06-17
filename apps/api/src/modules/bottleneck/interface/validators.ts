import { z } from 'zod';

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/);

export const calculateBody = z.object({
  cpuSlug: slug,
  gpuSlug: slug,
  persist: z.boolean().optional().default(false),
});

export const shareSlugParam = z.object({
  shareSlug: z
    .string()
    .min(1)
    .max(240)
    .regex(/^[a-z0-9+-]+$/),
});
