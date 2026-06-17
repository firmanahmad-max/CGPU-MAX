import { Router } from 'express';

import { NotFoundError } from '../../../shared/errors/AppError.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { CalculateBottleneck } from '../application/CalculateBottleneck.js';

import { calculateBody, shareSlugParam } from './validators.js';

const useCase = new CalculateBottleneck(prisma);

export const bottleneckRouter = Router();

bottleneckRouter.post('/calculate', async (req, res, next) => {
  try {
    const body = calculateBody.parse(req.body);
    const result = await useCase.execute(body);
    res.status(body.persist ? 201 : 200).json(result);
  } catch (err) {
    next(err);
  }
});

bottleneckRouter.get('/:shareSlug', async (req, res, next) => {
  try {
    const { shareSlug } = shareSlugParam.parse(req.params);
    const row = await prisma.savedBottleneck.findUnique({ where: { shareSlug } });
    if (!row) throw new NotFoundError('Bottleneck result', shareSlug);
    res.json(row.payload);
  } catch (err) {
    next(err);
  }
});
