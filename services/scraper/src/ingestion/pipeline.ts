import { env } from '../config/env.js';
import { createHttpClient } from '../http/client.js';
import { logger } from '../logging/logger.js';
import { prisma } from '../persistence/prisma.js';
import { GeekbenchAdapter } from '../sources/geekbench.js';
import { PassmarkAdapter } from '../sources/passmark.js';
import type { SourceAdapter } from '../sources/SourceAdapter.js';
import { TechPowerUpAdapter } from '../sources/techpowerup.js';

import { evaluatePriceAlerts, type AlertEvalStats } from './evaluateAlerts.js';
import { mergeBySlug } from './merge.js';
import { upsertProcessors, type UpsertStats } from './upsert.js';

export interface PipelineResult {
  durationMs: number;
  perSource: Record<string, { rows: number; ok: boolean; error?: string }>;
  stats: UpsertStats;
  alerts: AlertEvalStats;
}

export async function runPipeline(): Promise<PipelineResult> {
  const start = Date.now();
  const http = createHttpClient();
  const adapters: SourceAdapter[] = [
    new GeekbenchAdapter(http),
    new TechPowerUpAdapter(http),
    new PassmarkAdapter(http),
  ];

  const perSource: PipelineResult['perSource'] = {};
  const collected = [];

  for (const adapter of adapters) {
    try {
      const rows = await adapter.fetchAll();
      perSource[adapter.name] = { rows: rows.length, ok: true };
      collected.push(...rows);
    } catch (err) {
      perSource[adapter.name] = { rows: 0, ok: false, error: (err as Error).message };
      logger.error({ err, source: adapter.name }, 'Source adapter failed');
    }
  }

  const merged = mergeBySlug(collected);
  logger.info(
    { total: collected.length, unique: merged.length },
    'Merged source rows; starting upsert',
  );
  const stats = await upsertProcessors(prisma, merged);

  // Fresh prices are in; re-evaluate active price alerts against them.
  const alerts = await evaluatePriceAlerts(prisma);

  const result: PipelineResult = {
    durationMs: Date.now() - start,
    perSource,
    stats,
    alerts,
  };
  logger.info({ env: env.NODE_ENV, result }, 'Pipeline complete');
  return result;
}
