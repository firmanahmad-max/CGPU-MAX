import { z } from 'zod';

export const createKeyBody = z.object({
  name: z.string().min(1).max(80),
  expiresInDays: z.coerce.number().int().min(1).max(3650).optional(),
});

export const keyIdParam = z.object({
  id: z.string().uuid(),
});
