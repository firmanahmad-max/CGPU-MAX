import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { GenerateReport } from '../application/GenerateReport.js';
import { CONTENT_TYPE } from '../domain/types.js';

const reports = new GenerateReport(prisma);

const params = z.object({
  shareSlug: z
    .string()
    .min(1)
    .max(240)
    .regex(/^[a-z0-9+-]+$/),
});
const query = z.object({ format: z.enum(['pdf', 'xlsx']).default('pdf') });

export const reportsRouter = Router();

reportsRouter.use(requireAuth, requireFeature('customReports'));

reportsRouter.get('/comparison/:shareSlug', async (req, res, next) => {
  try {
    const { shareSlug } = params.parse(req.params);
    const { format } = query.parse(req.query);
    const { buffer, filename } = await reports.comparison(shareSlug, format);
    send(res, buffer, filename, format);
  } catch (err) {
    next(err);
  }
});

reportsRouter.get('/bottleneck/:shareSlug', async (req, res, next) => {
  try {
    const { shareSlug } = params.parse(req.params);
    const { format } = query.parse(req.query);
    const { buffer, filename } = await reports.bottleneck(shareSlug, format);
    send(res, buffer, filename, format);
  } catch (err) {
    next(err);
  }
});

function send(
  res: import('express').Response,
  buffer: Buffer,
  filename: string,
  format: 'pdf' | 'xlsx',
) {
  res.setHeader('Content-Type', CONTENT_TYPE[format]);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}
