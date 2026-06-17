import type { Prisma, PrismaClient, ProcessorType } from '@prisma/client';

import type { FlatRecord } from '../domain/serialize.js';

// Columns emitted for the processors dataset (stable order — also the CSV header).
export const PROCESSOR_COLUMNS = [
  'id',
  'slug',
  'type',
  'manufacturer',
  'modelName',
  'generation',
  'architecture',
  'processNm',
  'tdpWatts',
  'msrpUsd',
  'releaseDate',
] as const;

export interface ExportInput {
  type?: ProcessorType;
  cursor?: string;
  limit: number;
}

export interface ExportPage {
  records: FlatRecord[];
  nextCursor: string | null;
  count: number;
}

export class ExportCatalog {
  constructor(private readonly prisma: PrismaClient) {}

  // Cursor pagination on the primary key keeps memory bounded for bulk pulls:
  // the client follows `nextCursor` until it's null.
  async export(input: ExportInput): Promise<ExportPage> {
    const where: Prisma.ProcessorWhereInput = {
      deletedAt: null,
      ...(input.type ? { type: input.type } : {}),
      ...(input.cursor ? { id: { gt: input.cursor } } : {}),
    };

    const rows = await this.prisma.processor.findMany({
      where,
      orderBy: { id: 'asc' },
      take: input.limit,
      select: {
        id: true,
        slug: true,
        type: true,
        manufacturer: true,
        modelName: true,
        generation: true,
        architecture: true,
        processNm: true,
        tdpWatts: true,
        msrpUsd: true,
        releaseDate: true,
      },
    });

    const records: FlatRecord[] = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      type: r.type,
      manufacturer: r.manufacturer,
      modelName: r.modelName,
      generation: r.generation,
      architecture: r.architecture,
      processNm: r.processNm,
      tdpWatts: r.tdpWatts,
      msrpUsd: r.msrpUsd ? Number(r.msrpUsd) : null,
      releaseDate: r.releaseDate ? r.releaseDate.toISOString().slice(0, 10) : null,
    }));

    const last = rows[rows.length - 1];
    const nextCursor = rows.length === input.limit && last ? last.id : null;
    return { records, nextCursor, count: records.length };
  }

  async manifest() {
    const [cpuCount, gpuCount, latest] = await Promise.all([
      this.prisma.processor.count({ where: { deletedAt: null, type: 'CPU' } }),
      this.prisma.processor.count({ where: { deletedAt: null, type: 'GPU' } }),
      this.prisma.processor.findFirst({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    return {
      datasets: [
        {
          name: 'processors',
          description: 'Full CPU/GPU catalog with core specs and pricing.',
          formats: ['json', 'csv', 'ndjson'],
          columns: PROCESSOR_COLUMNS,
          records: { total: cpuCount + gpuCount, cpu: cpuCount, gpu: gpuCount },
          lastUpdated: latest?.updatedAt.toISOString() ?? null,
          endpoint: '/api/public/v1/licensing/export',
        },
      ],
      license:
        'Licensed for use under your CGPU-MAX Enterprise data agreement. ' +
        'Redistribution requires written authorization.',
      generatedAt: new Date().toISOString(),
    };
  }
}
