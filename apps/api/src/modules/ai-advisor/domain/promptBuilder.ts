// Builds the system prompt + user message for the build advisor. The catalog
// context is injected so Claude recommends real parts from our DB and returns
// matching slugs — grounding the model rather than letting it free-associate.

import type { BuildPurpose, Resolution } from './BuildAdvice.js';

export interface CatalogPart {
  slug: string;
  type: 'CPU' | 'GPU';
  modelName: string;
  manufacturer: string;
  msrpUsd: number | null;
  tdpWatts: number | null;
}

export interface AdvisorRequest {
  budgetUsd: number;
  purpose: BuildPurpose;
  resolution: Resolution;
  preferences?: string;
}

export const SYSTEM_PROMPT = `You are CGPU-MAX's build advisor — an expert PC hardware consultant.

Your job: recommend one CPU and one GPU for the user's budget, purpose, and target resolution, choosing from the provided catalog whenever a good fit exists.

Rules:
- Prefer parts from the CATALOG. When you pick a catalog part, copy its slug exactly into the "slug" field. If you must recommend a part not in the catalog, set slug to null.
- Keep the combined CPU+GPU cost within the stated budget when feasible. If the budget is too low for the purpose/resolution, pick the best realistic pairing and set withinBudget to false with a clear warning.
- Balance the build: avoid pairing a flagship GPU with a weak CPU at lower resolutions, or vice versa.
- recommendedPsuWatts should cover CPU + GPU TDP plus headroom for the rest of the system (~30%), rounded up to a common PSU size.
- Be concrete and concise. No marketing fluff. Write for someone who knows the basics.
- Lead each rationale with the single most important reason for the pick.`;

export function buildCatalogContext(parts: CatalogPart[]): string {
  const cpus = parts.filter((p) => p.type === 'CPU');
  const gpus = parts.filter((p) => p.type === 'GPU');
  const fmt = (p: CatalogPart) =>
    `- ${p.modelName} [slug:${p.slug}] mfr:${p.manufacturer} msrp:${
      p.msrpUsd ? `$${p.msrpUsd}` : 'n/a'
    } tdp:${p.tdpWatts ? `${p.tdpWatts}W` : 'n/a'}`;
  return [
    'CATALOG',
    '',
    'CPUs:',
    ...cpus.map(fmt),
    '',
    'GPUs:',
    ...gpus.map(fmt),
  ].join('\n');
}

export function buildUserMessage(req: AdvisorRequest, catalog: string): string {
  return [
    `Budget: $${req.budgetUsd} (CPU + GPU combined)`,
    `Purpose: ${req.purpose}`,
    `Target resolution: ${req.resolution}`,
    req.preferences ? `Preferences: ${req.preferences}` : null,
    '',
    catalog,
    '',
    'Recommend the best CPU + GPU pairing. Return the structured build advice.',
  ]
    .filter(Boolean)
    .join('\n');
}
