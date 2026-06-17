import type { PrismaClient } from '@prisma/client';

import { AppError } from '../../../shared/errors/AppError.js';
import { buildProcessorSnapshot } from '../../comparisons/application/BuildSnapshot.js';
import { GamingOptimizer, type GameProfile, type Resolution } from '../domain/GamingOptimizer.js';

export interface OptimizeInput {
  gpuSlug: string;
  cpuSlug?: string;
  resolution: Resolution;
  profile: GameProfile;
}

export class OptimizeGame {
  private readonly optimizer = new GamingOptimizer();

  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: OptimizeInput) {
    const gpu = await buildProcessorSnapshot(this.prisma, input.gpuSlug);
    if (gpu.type !== 'GPU') {
      throw new AppError('NOT_A_GPU', `${gpu.slug} is not a GPU`, 400);
    }
    const cpu = input.cpuSlug
      ? await buildProcessorSnapshot(this.prisma, input.cpuSlug)
      : undefined;
    if (cpu && cpu.type !== 'CPU') {
      throw new AppError('NOT_A_CPU', `${cpu.slug} is not a CPU`, 400);
    }

    const result = this.optimizer.evaluate(gpu, input.resolution, input.profile, cpu);
    return {
      gpu: { slug: gpu.slug, modelName: gpu.modelName },
      cpu: cpu ? { slug: cpu.slug, modelName: cpu.modelName } : null,
      ...result,
    };
  }
}
