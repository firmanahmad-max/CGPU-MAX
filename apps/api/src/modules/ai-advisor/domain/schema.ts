// JSON Schema for structured outputs (output_config.format). Mirrors BuildAdvice.
// Keep in sync with BuildAdvice.ts. Structured outputs do not support
// min/max/length constraints, so we omit them and validate ranges downstream.

import { z } from 'zod';

const componentPickZod = z.object({
  category: z.enum(['cpu', 'gpu']),
  modelName: z.string(),
  slug: z.string().nullable(),
  approxPriceUsd: z.number(),
  rationale: z.string(),
});

// Runtime validation for provider responses that arrive as raw JSON (the
// OpenAI-compatible path), since those aren't parsed against the schema for us.
export const buildAdviceZod = z.object({
  summary: z.string(),
  cpu: componentPickZod,
  gpu: componentPickZod,
  estimatedTotalUsd: z.number(),
  withinBudget: z.boolean(),
  expectedPerformance: z.string(),
  recommendedPsuWatts: z.number(),
  upgradePathNote: z.string(),
  warnings: z.array(z.string()),
});

export const buildAdviceJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    cpu: { $ref: '#/$defs/componentPick' },
    gpu: { $ref: '#/$defs/componentPick' },
    estimatedTotalUsd: { type: 'number' },
    withinBudget: { type: 'boolean' },
    expectedPerformance: { type: 'string' },
    recommendedPsuWatts: { type: 'integer' },
    upgradePathNote: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'summary',
    'cpu',
    'gpu',
    'estimatedTotalUsd',
    'withinBudget',
    'expectedPerformance',
    'recommendedPsuWatts',
    'upgradePathNote',
    'warnings',
  ],
  $defs: {
    componentPick: {
      type: 'object',
      additionalProperties: false,
      properties: {
        category: { type: 'string', enum: ['cpu', 'gpu'] },
        modelName: { type: 'string' },
        slug: { type: ['string', 'null'] },
        approxPriceUsd: { type: 'number' },
        rationale: { type: 'string' },
      },
      required: ['category', 'modelName', 'slug', 'approxPriceUsd', 'rationale'],
    },
  },
} as const;
