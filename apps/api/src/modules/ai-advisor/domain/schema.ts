// JSON Schema for structured outputs (output_config.format). Mirrors BuildAdvice.
// Keep in sync with BuildAdvice.ts. Structured outputs do not support
// min/max/length constraints, so we omit them and validate ranges downstream.

import { z } from 'zod';

const PICK_CATEGORIES = [
  'cpu',
  'gpu',
  'motherboard',
  'ram',
  'ssd',
  'psu',
  'case',
  'cooler',
  'monitor',
] as const;

const componentPickZod = z.object({
  category: z.enum(PICK_CATEGORIES),
  modelName: z.string(),
  slug: z.string().nullable(),
  approxPriceUsd: z.number(),
  rationale: z.string(),
});

// Runtime validation for provider responses that arrive as raw JSON (the
// OpenAI-compatible path), since those aren't parsed against the schema for us.
// `monitor` is always present in the model output (kept required for strict
// structured-output compatibility); the app nulls it when not requested.
export const buildAdviceZod = z.object({
  summary: z.string(),
  cpu: componentPickZod,
  gpu: componentPickZod,
  motherboard: componentPickZod,
  ram: componentPickZod,
  ssd: componentPickZod,
  psu: componentPickZod,
  case: componentPickZod,
  cooler: componentPickZod,
  monitor: componentPickZod,
  estimatedTotalUsd: z.number(),
  withinBudget: z.boolean(),
  expectedPerformance: z.string(),
  recommendedPsuWatts: z.number(),
  upgradePathNote: z.string(),
  warnings: z.array(z.string()),
});

const pickRef = { $ref: '#/$defs/componentPick' } as const;

export const buildAdviceJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    cpu: pickRef,
    gpu: pickRef,
    motherboard: pickRef,
    ram: pickRef,
    ssd: pickRef,
    psu: pickRef,
    case: pickRef,
    cooler: pickRef,
    monitor: pickRef,
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
    'motherboard',
    'ram',
    'ssd',
    'psu',
    'case',
    'cooler',
    'monitor',
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
        category: { type: 'string', enum: PICK_CATEGORIES },
        modelName: { type: 'string' },
        slug: { type: ['string', 'null'] },
        approxPriceUsd: { type: 'number' },
        rationale: { type: 'string' },
      },
      required: ['category', 'modelName', 'slug', 'approxPriceUsd', 'rationale'],
    },
  },
} as const;
