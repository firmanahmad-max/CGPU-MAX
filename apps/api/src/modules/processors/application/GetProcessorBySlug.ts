import { CacheTTL, getOrSet } from '../../../shared/cache/cache.js';
import { NotFoundError } from '../../../shared/errors/AppError.js';
import type { ProcessorRepository } from '../domain/ProcessorRepository.js';

export class GetProcessorBySlug {
  constructor(private readonly repo: ProcessorRepository) {}

  async execute(slug: string) {
    return getOrSet(
      `processors:slug:${slug}`,
      { ttlSeconds: CacheTTL.processor, tags: [`processor:${slug}`] },
      async () => {
        const processor = await this.repo.findBySlug(slug);
        if (!processor) {
          throw new NotFoundError('Processor', slug);
        }
        return processor.toPrimitives();
      },
    );
  }
}
