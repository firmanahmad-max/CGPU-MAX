import type { PrismaClient } from '@prisma/client';

import { AppError } from '../../../shared/errors/AppError.js';
import { buildProcessorSnapshot } from '../../comparisons/application/BuildSnapshot.js';
import { BottleneckAlgorithm } from '../domain/BottleneckAlgorithm.js';

export interface CalculateInput {
  cpuSlug: string;
  gpuSlug: string;
  persist?: boolean;
}

export class CalculateBottleneck {
  private readonly algorithm = new BottleneckAlgorithm();

  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: CalculateInput) {
    const [cpu, gpu] = await Promise.all([
      buildProcessorSnapshot(this.prisma, input.cpuSlug),
      buildProcessorSnapshot(this.prisma, input.gpuSlug),
    ]);

    if (cpu.type !== 'CPU') {
      throw new AppError('NOT_A_CPU', `Processor ${cpu.slug} is not a CPU`, 400);
    }
    if (gpu.type !== 'GPU') {
      throw new AppError('NOT_A_GPU', `Processor ${gpu.slug} is not a GPU`, 400);
    }

    const outcome = this.algorithm.evaluate(cpu, gpu);
    const payload = {
      cpu,
      gpu,
      ...outcome,
      generatedAt: new Date().toISOString(),
    };

    if (!input.persist) {
      return { ...payload, shareSlug: null as string | null };
    }

    const shareSlug = `${cpu.slug}+${gpu.slug}`.slice(0, 220);
    await this.prisma.savedBottleneck.upsert({
      where: { shareSlug },
      create: {
        shareSlug,
        cpuId: cpu.id,
        gpuId: gpu.id,
        payload: payload as object,
        algorithmVersion: outcome.algorithmVersion,
      },
      update: {
        payload: payload as object,
        algorithmVersion: outcome.algorithmVersion,
        createdAt: new Date(),
      },
    });

    return { ...payload, shareSlug };
  }
}
