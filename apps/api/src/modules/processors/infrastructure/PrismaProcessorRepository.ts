import type { PrismaClient } from '@prisma/client';

import { Processor } from '../domain/Processor.js';
import type { ListProcessorsFilter, ProcessorRepository } from '../domain/ProcessorRepository.js';

export class PrismaProcessorRepository implements ProcessorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBySlug(slug: string): Promise<Processor | null> {
    const row = await this.prisma.processor.findUnique({ where: { slug } });
    if (!row || row.deletedAt) return null;
    return Processor.create({
      id: row.id,
      type: row.type,
      manufacturer: row.manufacturer,
      modelName: row.modelName,
      slug: row.slug,
      generation: row.generation,
      tdpWatts: row.tdpWatts,
      msrpUsd: row.msrpUsd ? Number(row.msrpUsd) : null,
    });
  }

  async list(filter: ListProcessorsFilter) {
    const where = {
      deletedAt: null,
      ...(filter.type ? { type: filter.type } : {}),
      ...(filter.manufacturer ? { manufacturer: filter.manufacturer } : {}),
      ...(filter.search
        ? { modelName: { contains: filter.search, mode: 'insensitive' as const } }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.processor.findMany({
        where,
        take: filter.limit,
        skip: filter.offset,
        orderBy: { releaseDate: 'desc' },
      }),
      this.prisma.processor.count({ where }),
    ]);

    const items = rows.map((row) =>
      Processor.create({
        id: row.id,
        type: row.type,
        manufacturer: row.manufacturer,
        modelName: row.modelName,
        slug: row.slug,
        generation: row.generation,
        tdpWatts: row.tdpWatts,
        msrpUsd: row.msrpUsd ? Number(row.msrpUsd) : null,
      }),
    );
    return { items, total };
  }
}
