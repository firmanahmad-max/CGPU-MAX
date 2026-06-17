import type { Manufacturer, ProcessorType } from '@cgpu-max/types';

import type { Processor } from './Processor.js';

export interface ListProcessorsFilter {
  type?: ProcessorType;
  manufacturer?: Manufacturer;
  search?: string;
  limit: number;
  offset: number;
}

export interface ProcessorRepository {
  findBySlug(slug: string): Promise<Processor | null>;
  list(filter: ListProcessorsFilter): Promise<{ items: Processor[]; total: number }>;
}
