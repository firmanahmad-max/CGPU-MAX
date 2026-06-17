import { Router } from 'express';

import { prisma } from '../../../shared/persistence/prisma.js';
import { CompareProcessors } from '../application/CompareProcessors.js';
import { GetComparisonBySlug } from '../application/GetComparisonBySlug.js';

import { compareBody, shareSlugParam } from './validators.js';

const compareUseCase = new CompareProcessors(prisma);
const getUseCase = new GetComparisonBySlug(prisma);

export const comparisonsRouter = Router();

comparisonsRouter.post('/', async (req, res, next) => {
  try {
    const body = compareBody.parse(req.body);
    const result = await compareUseCase.execute({ ...body, auth: req.auth });
    res.status(body.persist ? 201 : 200).json(result);
  } catch (err) {
    next(err);
  }
});

comparisonsRouter.get('/:shareSlug', async (req, res, next) => {
  try {
    const { shareSlug } = shareSlugParam.parse(req.params);
    const result = await getUseCase.execute(shareSlug);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
