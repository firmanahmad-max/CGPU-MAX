import { Router } from 'express';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { CreateApiKey } from '../application/CreateApiKey.js';
import { ListApiKeys } from '../application/ListApiKeys.js';
import { RevokeApiKey } from '../application/RevokeApiKey.js';

import { createKeyBody, keyIdParam } from './validators.js';

const createUseCase = new CreateApiKey(prisma);
const listUseCase = new ListApiKeys(prisma);
const revokeUseCase = new RevokeApiKey(prisma);

// Management routes are authenticated via Clerk (the dashboard), and gated to
// tiers with API access (Enterprise). The keys themselves authenticate the
// separate public API namespace.
export const apiKeysRouter = Router();

apiKeysRouter.use(requireAuth, requireFeature('apiAccess'));

apiKeysRouter.get('/', async (req, res, next) => {
  try {
    res.json({ keys: await listUseCase.execute(req.auth!) });
  } catch (err) {
    next(err);
  }
});

apiKeysRouter.post('/', async (req, res, next) => {
  try {
    const body = createKeyBody.parse(req.body);
    const result = await createUseCase.execute(req.auth!, body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

apiKeysRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = keyIdParam.parse(req.params);
    res.json(await revokeUseCase.execute(req.auth!, id));
  } catch (err) {
    next(err);
  }
});
