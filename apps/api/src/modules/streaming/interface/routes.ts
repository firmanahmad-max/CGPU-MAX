import type { Manufacturer } from '@cgpu-max/types';
import { Router } from 'express';
import { z } from 'zod';

import { requireAuth } from '../../../shared/auth/middleware.js';
import { requireFeature } from '../../../shared/auth/requireFeature.js';
import { prisma } from '../../../shared/persistence/prisma.js';
import { planStream } from '../domain/StreamingAdvisor.js';

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9-]+$/);

const body = z.object({
  // Prefer a GPU slug (model-aware encoder detection); a bare manufacturer works too.
  gpuSlug: slug.optional(),
  gpuManufacturer: z.enum(['INTEL', 'AMD', 'NVIDIA']).optional(),
  // Optional CPU slug — informs whether software x264 is feasible.
  cpuSlug: slug.optional(),
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
      let gpuModelName: string | null = null;
      if (input.gpuSlug) {
        const gpu = await prisma.processor.findUnique({
          where: { slug: input.gpuSlug },
          select: { type: true, manufacturer: true, modelName: true },
        });
        if (gpu?.type === 'GPU') {
          manufacturer = gpu.manufacturer;
          gpuModelName = gpu.modelName;
        }
      }

      let cpuModelName: string | null = null;
      let cpuCores: number | null = null;
      let cpuThreads: number | null = null;
      if (input.cpuSlug) {
        const cpu = await prisma.processor.findUnique({
          where: { slug: input.cpuSlug },
          select: {
            type: true,
            modelName: true,
            cpuSpecs: { select: { cores: true, threads: true } },
          },
        });
        if (cpu?.type === 'CPU') {
          cpuModelName = cpu.modelName;
          cpuCores = cpu.cpuSpecs?.cores ?? null;
          cpuThreads = cpu.cpuSpecs?.threads ?? null;
        }
      }

      const result = planStream({
        gpuManufacturer: manufacturer,
        gpuModelName,
        cpuModelName,
        cpuCores,
        cpuThreads,
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
