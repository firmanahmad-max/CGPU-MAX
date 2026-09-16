import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../../shared/persistence/prisma.js';
import { GetCatalog } from '../application/GetCatalog.js';

const useCase = new GetCatalog(prisma);

const query = z.object({
  type: z.enum(['CPU', 'GPU']).optional(),
  manufacturer: z.enum(['INTEL', 'AMD', 'NVIDIA']).optional(),
  search: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  vram: z
    .string()
    .optional()
    .transform((s) =>
      s
        ? s
            .split(',')
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n))
        : undefined,
    ),
  architecture: z.string().trim().max(60).optional(),
  sort: z.enum(['index', 'price', 'perScore', 'tdp', 'vram']).default('index'),
  dir: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const catalogRouter = Router();

// Purpose-built catalog table feed: enriched rows (index, VRAM, price series)
// plus facet counts, in one cached call.
catalogRouter.get('/', async (req, res, next) => {
  try {
    const input = query.parse(req.query);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await useCase.execute(input));
  } catch (err) {
    next(err);
  }
});
