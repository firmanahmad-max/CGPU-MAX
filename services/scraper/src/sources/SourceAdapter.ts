import type { NormalizedProcessor } from '../domain/NormalizedProcessor.js';

export interface SourceAdapter {
  readonly name: string;
  fetchAll(): Promise<NormalizedProcessor[]>;
}
