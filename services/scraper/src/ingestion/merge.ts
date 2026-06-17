import type { NormalizedProcessor } from '../domain/NormalizedProcessor.js';

// Merge rows from multiple sources keyed by (type, slug). Later sources overwrite
// nulls but never overwrite existing non-null values — first non-null wins, except
// benchmarks/priceUsd which are accumulated.

export interface MergedProcessor extends NormalizedProcessor {
  sources: string[];
}

export function mergeBySlug(rows: NormalizedProcessor[]): MergedProcessor[] {
  const map = new Map<string, MergedProcessor>();

  for (const row of rows) {
    const key = `${row.type}::${row.slug}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...row, sources: [row.source], benchmarks: [...(row.benchmarks ?? [])] });
      continue;
    }

    map.set(key, {
      ...existing,
      generation: existing.generation ?? row.generation ?? null,
      architecture: existing.architecture ?? row.architecture ?? null,
      processNm: existing.processNm ?? row.processNm ?? null,
      tdpWatts: existing.tdpWatts ?? row.tdpWatts ?? null,
      msrpUsd: existing.msrpUsd ?? row.msrpUsd ?? null,
      releaseDate: existing.releaseDate ?? row.releaseDate ?? null,
      cpu: existing.cpu ?? row.cpu,
      gpu: existing.gpu ?? row.gpu,
      priceUsd: existing.priceUsd ?? row.priceUsd ?? null,
      benchmarks: [...(existing.benchmarks ?? []), ...(row.benchmarks ?? [])],
      sources: existing.sources.includes(row.source)
        ? existing.sources
        : [...existing.sources, row.source],
    });
  }

  return Array.from(map.values());
}
