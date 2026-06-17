// Domain entity — pure, no framework or ORM dependencies.

import type { Manufacturer, ProcessorType } from '@cgpu-max/types';

export interface ProcessorProps {
  id: string;
  type: ProcessorType;
  manufacturer: Manufacturer;
  modelName: string;
  slug: string;
  generation: number | null;
  tdpWatts: number | null;
  msrpUsd: number | null;
}

export class Processor {
  private constructor(private readonly props: ProcessorProps) {}

  static create(props: ProcessorProps): Processor {
    if (!props.modelName.trim()) {
      throw new Error('Processor modelName is required');
    }
    return new Processor(props);
  }

  get id(): string {
    return this.props.id;
  }

  get type(): ProcessorType {
    return this.props.type;
  }

  get slug(): string {
    return this.props.slug;
  }

  toPrimitives(): ProcessorProps {
    return { ...this.props };
  }
}
