import type { AxiosInstance } from 'axios';

import {
  detectCpuManufacturer,
  detectGpuManufacturer,
  slugify,
  type NormalizedProcessor,
} from '../domain/NormalizedProcessor.js';
import { retryWithBackoff } from '../http/client.js';
import { logger } from '../logging/logger.js';

import type { SourceAdapter } from './SourceAdapter.js';

interface GeekbenchCpuRow {
  id: number | string;
  name: string;
  score?: number;
  single_core_score?: number;
  multi_core_score?: number;
  number_of_cores?: number;
  number_of_threads?: number;
}

interface GeekbenchGpuRow {
  id: number | string;
  name: string;
  score?: number;
  api?: string;
}

const BASE = 'https://browser.geekbench.com';

export class GeekbenchAdapter implements SourceAdapter {
  readonly name = 'geekbench';

  constructor(private readonly http: AxiosInstance) {}

  async fetchAll(): Promise<NormalizedProcessor[]> {
    const log = logger.child({ source: this.name });
    log.info('Fetching Geekbench data');

    const [single, multi, gpu, vulkan] = await Promise.allSettled([
      this.fetchJson<{ results?: GeekbenchCpuRow[] }>('/v6/cpu/singlecore'),
      this.fetchJson<{ results?: GeekbenchCpuRow[] }>('/v6/cpu/multicore'),
      this.fetchJson<{ results?: GeekbenchGpuRow[] }>('/gpu-benchmarks'),
      this.fetchJson<{ results?: GeekbenchGpuRow[] }>('/vulkan-benchmarks'),
    ]);

    const cpus = this.transformCpus([
      ...(single.status === 'fulfilled' ? (single.value.results ?? []) : []),
      ...(multi.status === 'fulfilled' ? (multi.value.results ?? []) : []),
    ]);
    const gpus = this.transformGpus([
      ...(gpu.status === 'fulfilled' ? (gpu.value.results ?? []) : []),
      ...(vulkan.status === 'fulfilled' ? (vulkan.value.results ?? []) : []),
    ]);

    log.info({ cpus: cpus.length, gpus: gpus.length }, 'Geekbench fetch complete');
    return [...cpus, ...gpus];
  }

  private async fetchJson<T>(path: string): Promise<T> {
    return retryWithBackoff(async () => {
      const res = await this.http.get<T>(`${BASE}${path}`);
      if (res.status >= 400) {
        throw new Error(`Geekbench ${path} returned ${res.status}`);
      }
      return res.data;
    });
  }

  private transformCpus(rows: GeekbenchCpuRow[]): NormalizedProcessor[] {
    const recordedAt = new Date();
    return rows
      .map((row): NormalizedProcessor | null => {
        const manufacturer = detectCpuManufacturer(row.name);
        if (!manufacturer) return null;
        const benchmarks = [
          row.single_core_score
            ? { benchmarkType: 'geekbench6_single_core', score: row.single_core_score, recordedAt }
            : null,
          row.multi_core_score
            ? { benchmarkType: 'geekbench6_multi_core', score: row.multi_core_score, recordedAt }
            : null,
          row.score ? { benchmarkType: 'geekbench6_overall', score: row.score, recordedAt } : null,
        ].filter(
          (x): x is { benchmarkType: string; score: number; recordedAt: Date } => x !== null,
        );

        return {
          source: 'geekbench',
          sourceId: String(row.id),
          type: 'CPU',
          manufacturer,
          modelName: row.name,
          slug: slugify(`${manufacturer.toLowerCase()}-${row.name}`),
          cpu:
            row.number_of_cores && row.number_of_threads
              ? {
                  cores: row.number_of_cores,
                  threads: row.number_of_threads,
                  baseClockGhz: 0,
                }
              : undefined,
          benchmarks,
        };
      })
      .filter((x): x is NormalizedProcessor => x !== null);
  }

  private transformGpus(rows: GeekbenchGpuRow[]): NormalizedProcessor[] {
    const recordedAt = new Date();
    return rows
      .map((row): NormalizedProcessor | null => {
        const manufacturer = detectGpuManufacturer(row.name);
        if (!manufacturer) return null;
        const benchmarks = row.score
          ? [
              {
                benchmarkType: `geekbench_${row.api ?? 'compute'}`.toLowerCase(),
                score: row.score,
                recordedAt,
              },
            ]
          : [];
        return {
          source: 'geekbench',
          sourceId: String(row.id),
          type: 'GPU',
          manufacturer,
          modelName: row.name,
          slug: slugify(`${manufacturer.toLowerCase()}-${row.name}`),
          benchmarks,
        };
      })
      .filter((x): x is NormalizedProcessor => x !== null);
  }
}
