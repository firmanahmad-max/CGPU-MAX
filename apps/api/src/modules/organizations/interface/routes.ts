import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { OrganizationService } from '../application/OrganizationService.js';

const orgs = new OrganizationService(prisma);

const createBody = z.object({ name: z.string().min(1).max(120) });
const idParam = z.object({ id: z.string().uuid() });
const brandingBody = z.object({
  brandName: z.string().min(1).max(120).optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  primaryColorHex: z.string().optional(),
  secondaryColorHex: z.string().optional(),
  customDomain: z.string().max(253).nullable().optional(),
});
const memberBody = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});
const domainParam = z.object({ domain: z.string().min(1).max(253) });

// Management routes — Enterprise tier (white-label) only.
export const organizationsRouter = Router();
organizationsRouter.use(requireAuth, requireFeature('whiteLabel'));

organizationsRouter.post('/', async (req, res, next) => {
  try {
    const { name } = createBody.parse(req.body);
    res.status(201).json(await orgs.create(req.auth!, name));
  } catch (err) {
    next(err);
  }
});

organizationsRouter.get('/me', async (req, res, next) => {
  try {
    res.json({ organizations: await orgs.listMine(req.auth!) });
  } catch (err) {
    next(err);
  }
});

organizationsRouter.patch('/:id/branding', async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const patch = brandingBody.parse(req.body);
    res.json(await orgs.updateBranding(req.auth!, id, patch));
  } catch (err) {
    next(err);
  }
});

organizationsRouter.post('/:id/members', async (req, res, next) => {
  try {
    const { id } = idParam.parse(req.params);
    const { email, role } = memberBody.parse(req.body);
    res.status(201).json(await orgs.addMember(req.auth!, id, email, role));
  } catch (err) {
    next(err);
  }
});

// Public branding resolution by custom domain — used by white-label frontends
// to theme themselves. Cached and CDN-friendly.
export const brandingRouter = Router();
brandingRouter.get('/by-domain/:domain', async (req, res, next) => {
  try {
    const { domain } = domainParam.parse(req.params);
    res.set('Cache-Control', 'public, max-age=300');
    res.json(await orgs.brandingByDomain(domain));
  } catch (err) {
    next(err);
  }
});
