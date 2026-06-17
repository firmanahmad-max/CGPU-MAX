import { Router } from 'express';
import { z } from 'zod';

import type { Manufacturer } from '@cgpu-max/types';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { planStream } from '../domain/StreamingAdvisor.js';

const body = z.object({
  // Either give a GPU slug (we detect the encoder) or a manufacturer directly.
  gpuSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  gpuManufacturer: z.enum(['INTEL', 'AMD', 'NVIDIA']).optional(),
  platform: z.enum(['twitch', 'youtube', 'kick']),
  resolution: z.enum(['720p', '1080p', '1440p', '4K']),
  fps: z.coerce.number().int().min(24).max(240),
  uploadMbps: z.coerce.number().positive().max(10000),
});

export const streamingRouter = Router();

streamingRouter.post(
  '/plan',
  requireAuth,
  requireFeature('streamingSuite'),
  async (req, res, next) => {
    try {
      const input = body.parse(req.body);

      let manufacturer: Manufacturer | null = input.gpuManufacturer ?? null;
      if (!manufacturer && input.gpuSlug) {
        const gpu = await prisma.processor.findUnique({
          where: { slug: input.gpuSlug },
          select: { type: true, manufacturer: true },
        });
        if (gpu?.type === 'GPU') manufacturer = gpu.manufacturer;
      }

      const result = planStream({
        gpuManufacturer: manufacturer,
        platform: input.platform,
        resolution: input.resolution,
        fps: input.fps,
        uploadMbps: input.uploadMbps,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
