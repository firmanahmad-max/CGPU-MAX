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
  // CPUs carry a socket so the model can match a compatible motherboard.
  socket: string | null;
}

// A non-processor component (motherboard, RAM, SSD, PSU, case, cooler, monitor)
// offered to the model. Only the fields relevant to compatibility/selection are
// carried; the exact set varies by type.
export interface ComponentCatalogPart {
  slug: string;
  type: string;
  brand: string;
  modelName: string;
  approxPriceUsd: number | null;
  socket: string | null;
  chipset: string | null;
  formFactor: string | null;
  memoryType: string | null;
  capacityGb: number | null;
  interface: string | null;
  wattage: number | null;
  efficiency: string | null;
  sizeInch: number | null;
  resolution: string | null;
  refreshHz: number | null;
  panel: string | null;
}

export type BuildTier = 'value' | 'balanced' | 'premium';

export interface AdvisorRequest {
  budgetUsd: number;
  purpose: BuildPurpose;
  resolution: Resolution;
  preferences?: string;
  language?: 'en' | 'id';
  includeMonitor?: boolean;
  tier?: BuildTier;
}

export const SYSTEM_PROMPT = `You are CGPU-MAX's build advisor — an expert PC hardware consultant.

Your job: design a complete, compatible PC build for the user's budget, purpose, and target resolution, choosing every part from the provided CATALOG whenever a good fit exists. You recommend all of: CPU, GPU, motherboard, RAM, SSD, PSU, case, and CPU cooler. When the user asks, you also recommend a matching monitor.

Rules:
- Prefer parts from the CATALOG. When you pick a catalog part, copy its slug exactly into the "slug" field. If you must recommend a part not in the catalog, set slug to null.
- COMPATIBILITY IS MANDATORY:
  - The motherboard socket must match the CPU socket.
  - The RAM memory type (DDR4/DDR5) must match what the motherboard supports.
  - The PSU wattage must comfortably exceed the whole system's draw (CPU + GPU TDP plus ~30% headroom); state that figure in recommendedPsuWatts.
  - The cooler must be adequate for the CPU's thermal output.
  - The case form factor must fit the motherboard.
- Allocate the budget sensibly across all parts. Keep the total within the stated budget when feasible; if it is too low for the purpose/resolution, pick the best realistic set and set withinBudget to false with a clear warning.
- estimatedTotalUsd must be the sum of every recommended part's approxPriceUsd (including the monitor when one is recommended).
- Balance the build: don't pair a flagship GPU with a weak CPU at low resolution, or starve a strong build with slow RAM or a tiny SSD.
- MONITOR: when the user requests a monitor, pick one whose resolution and refresh rate suit the GPU's real capability at the target resolution (e.g. don't pair an entry GPU with a 4K 144Hz panel, or a flagship with a 1080p 60Hz panel). When the user does NOT request a monitor, still emit the monitor field but set its slug to null, modelName to "(not included)", approxPriceUsd to 0, and rationale to a single short dash, and DO NOT count it in estimatedTotalUsd.
- Be concrete and concise. No marketing fluff. Write for someone who knows the basics.
- Lead each rationale with the single most important reason for the pick.`;

function fmtProcessor(p: CatalogPart): string {
  return `- ${p.modelName} [slug:${p.slug}] mfr:${p.manufacturer} msrp:${
    p.msrpUsd ? `$${p.msrpUsd}` : 'n/a'
  } tdp:${p.tdpWatts ? `${p.tdpWatts}W` : 'n/a'}${p.socket ? ` socket:${p.socket}` : ''}`;
}

function fmtComponent(c: ComponentCatalogPart): string {
  const specs: string[] = [];
  if (c.socket) specs.push(`socket:${c.socket}`);
  if (c.chipset) specs.push(`chipset:${c.chipset}`);
  if (c.memoryType) specs.push(`mem:${c.memoryType}`);
  if (c.formFactor) specs.push(`form:${c.formFactor}`);
  if (c.capacityGb)
    specs.push(`cap:${c.capacityGb >= 1024 ? `${c.capacityGb / 1024}TB` : `${c.capacityGb}GB`}`);
  if (c.interface) specs.push(`iface:${c.interface}`);
  if (c.wattage) specs.push(`${c.wattage}W`);
  if (c.efficiency) specs.push(c.efficiency);
  if (c.sizeInch) specs.push(`${c.sizeInch}"`);
  if (c.resolution) specs.push(c.resolution);
  if (c.refreshHz) specs.push(`${c.refreshHz}Hz`);
  if (c.panel) specs.push(c.panel);
  const price = c.approxPriceUsd ? `~$${c.approxPriceUsd}` : 'n/a';
  return `- ${c.brand} ${c.modelName} [slug:${c.slug}] ${specs.join(' ')} ${price}`.trim();
}

export function buildCatalogContext(
  parts: CatalogPart[],
  components: ComponentCatalogPart[] = [],
): string {
  const cpus = parts.filter((p) => p.type === 'CPU');
  const gpus = parts.filter((p) => p.type === 'GPU');
  const byType = (t: string) => components.filter((c) => c.type === t);

  const lines = [
    'CATALOG',
    '',
    'CPUs:',
    ...cpus.map(fmtProcessor),
    '',
    'GPUs:',
    ...gpus.map(fmtProcessor),
  ];

  const sections: [string, string][] = [
    ['Motherboards:', 'MOTHERBOARD'],
    ['RAM:', 'RAM'],
    ['SSDs:', 'SSD'],
    ['PSUs:', 'PSU'],
    ['Cases:', 'CASING'],
    ['Coolers:', 'COOLER'],
    ['Monitors:', 'MONITOR'],
  ];
  for (const [heading, type] of sections) {
    const rows = byType(type);
    if (rows.length === 0) continue;
    lines.push('', heading, ...rows.map(fmtComponent));
  }
  return lines.join('\n');
}

export function buildUserMessage(req: AdvisorRequest, catalog: string): string {
  // Localize the human-readable prose. Part model names/slugs stay as-is.
  const languageLine =
    req.language === 'id'
      ? 'IMPORTANT: Write every human-readable text field (summary, each rationale, expectedPerformance, upgradePathNote, and every warning) in Indonesian (Bahasa Indonesia). Keep part model names and slugs unchanged.'
      : 'Write all text fields in English.';
  const monitorLine = req.includeMonitor
    ? 'The user WANTS a matching monitor — recommend one that suits the build and count it in the total.'
    : 'The user wants a PC build ONLY — do not recommend a monitor (emit the null monitor placeholder as instructed).';
  const tierLine =
    req.tier === 'value'
      ? 'TIER: VALUE — maximize price-to-performance. Aim for roughly 80–90% of the budget (do not overspend); favor last-gen bargains and sensible mid-range parts.'
      : req.tier === 'premium'
        ? 'TIER: PREMIUM — spend the full budget for maximum performance and headroom; prefer current-gen platforms, a stronger GPU, and generous PSU/RAM/storage.'
        : null;
  return [
    `Budget: $${req.budgetUsd} (whole PC build${req.includeMonitor ? ' including monitor' : ''})`,
    `Purpose: ${req.purpose}`,
    `Target resolution: ${req.resolution}`,
    req.preferences ? `Preferences: ${req.preferences}` : null,
    tierLine,
    '',
    catalog,
    '',
    monitorLine,
    languageLine,
    'Design the best complete, compatible build. Return the structured build advice.',
  ]
    .filter(Boolean)
    .join('\n');
}
