import type { ComponentType, PrismaClient } from '@prisma/client';

export type ComponentSort = 'price' | 'name';

export interface ComponentsInput {
  type: ComponentType;
  brand?: string;
  socket?: string;
  chipset?: string;
  formFactor?: string;
  memoryType?: string;
  capacityGb?: number;
  sort: ComponentSort;
  dir: 'asc' | 'desc';
  limit: number;
}

export interface ComponentRow {
  slug: string;
  brand: string;
  modelName: string;
  type: string;
  priceIdr: number | null;
  msrpUsd: number | null;
  socket: string | null;
  chipset: string | null;
  formFactor: string | null;
  memoryType: string | null;
  capacityGb: number | null;
  moduleCount: number | null;
  speedMhz: number | null;
  casLatency: number | null;
}

export interface ComponentFacets {
  brands: { name: string; count: number }[];
  sockets: { name: string; count: number }[];
  chipsets: { name: string; count: number }[];
  formFactors: { name: string; count: number }[];
  memoryTypes: { name: string; count: number }[];
  capacities: { gb: number; count: number }[];
  speeds: { mhz: number; count: number }[];
  priceMin: number | null;
  priceMax: number | null;
}

function tally<T extends string | number>(values: (T | null)[]): { value: T; count: number }[] {
  const m = new Map<T, number>();
  for (const v of values) if (v !== null && v !== undefined) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].map(([value, count]) => ({ value, count }));
}

export class GetComponents {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: ComponentsInput) {
    // Base set: everything of this type. Facets are counted here so their totals
    // stay stable as the other filters change.
    const rows = await this.prisma.component.findMany({
      where: { deletedAt: null, type: input.type },
    });

    const base: ComponentRow[] = rows.map((r) => ({
      slug: r.slug,
      brand: r.brand,
      modelName: r.modelName,
      type: String(r.type),
      priceIdr: r.priceIdr ?? null,
      msrpUsd: r.msrpUsd ? Number(r.msrpUsd) : null,
      socket: r.socket,
      chipset: r.chipset,
      formFactor: r.formFactor,
      memoryType: r.memoryType,
      capacityGb: r.capacityGb,
      moduleCount: r.moduleCount,
      speedMhz: r.speedMhz,
      casLatency: r.casLatency,
    }));

    const prices = base.map((r) => r.priceIdr).filter((p): p is number => p !== null);
    const facets: ComponentFacets = {
      brands: tally(base.map((r) => r.brand))
        .map((x) => ({ name: x.value, count: x.count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
      sockets: tally(base.map((r) => r.socket))
        .map((x) => ({ name: x.value, count: x.count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      chipsets: tally(base.map((r) => r.chipset))
        .map((x) => ({ name: x.value, count: x.count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      formFactors: tally(base.map((r) => r.formFactor))
        .map((x) => ({ name: x.value, count: x.count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      memoryTypes: tally(base.map((r) => r.memoryType))
        .map((x) => ({ name: x.value, count: x.count }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      capacities: tally(base.map((r) => r.capacityGb))
        .map((x) => ({ gb: x.value, count: x.count }))
        .sort((a, b) => a.gb - b.gb),
      speeds: tally(base.map((r) => r.speedMhz))
        .map((x) => ({ mhz: x.value, count: x.count }))
        .sort((a, b) => a.mhz - b.mhz),
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    };

    const filtered = base.filter((r) => {
      if (input.brand && r.brand !== input.brand) return false;
      if (input.socket && r.socket !== input.socket) return false;
      if (input.chipset && r.chipset !== input.chipset) return false;
      if (input.formFactor && r.formFactor !== input.formFactor) return false;
      if (input.memoryType && r.memoryType !== input.memoryType) return false;
      if (input.capacityGb && r.capacityGb !== input.capacityGb) return false;
      return true;
    });

    const mul = input.dir === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (input.sort === 'name') return a.modelName.localeCompare(b.modelName) * mul;
      return ((a.priceIdr ?? Infinity) - (b.priceIdr ?? Infinity)) * mul;
    });

    const total = filtered.length;
    const items = filtered.slice(0, input.limit);
    return { items, total, facets, sort: input.sort, dir: input.dir };
  }
}
