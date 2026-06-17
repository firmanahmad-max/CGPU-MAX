import { CacheTTL, getOrSet } from '../../../shared/cache/cache.js';
import type { ListProcessorsFilter, ProcessorRepository } from '../domain/ProcessorRepository.js';

const CACHE_TAG = 'processors:list';

function cacheKey(f: ListProcessorsFilter): string {
  return `processors:list:${f.type ?? '*'}:${f.manufacturer ?? '*'}:${
    f.search?.toLowerCase() ?? '*'
  }:${f.limit}:${f.offset}`;
}

export class ListProcessors {
  constructor(private readonly repo: ProcessorRepository) {}

  async execute(filter: ListProcessorsFilter) {
    return getOrSet(
      cacheKey(filter),
      { ttlSeconds: CacheTTL.listShort, tags: [CACHE_TAG] },
      async () => {
        const { items, total } = await this.repo.list(filter);
        return {
          items: items.map((p) => p.toPrimitives()),
          total,
          limit: filter.limit,
          offset: filter.offset,
        };
      },
    );
  }
}
