import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../../../shared/persistence/prisma.js';
import { GetComponents } from '../application/GetComponents.js';

const useCase = new GetComponents(prisma);

const query = z.object({
  type: z.enum(['MOTHERBOARD', 'RAM']).default('MOTHERBOARD'),
  brand: z.string().trim().max(40).optional(),
  socket: z.string().trim().max(20).optional(),
  chipset: z.string().trim().max(20).optional(),
  formFactor: z.string().trim().max(20).optional(),
  memoryType: z.string().trim().max(10).optional(),
  capacityGb: z.coerce.number().int().positive().optional(),
  sort: z.enum(['price', 'name']).default('price'),
  dir: z.enum(['asc', 'desc']).default('asc'),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const componentsRouter = Router();

// Motherboard / RAM catalog feed: rows + facet counts (socket/chipset/form for
// boards; type/capacity/speed for RAM).
componentsRouter.get('/', async (req, res, next) => {
  try {
    const input = query.parse(req.query);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await useCase.execute(input));
  } catch (err) {
    next(err);
  }
});
