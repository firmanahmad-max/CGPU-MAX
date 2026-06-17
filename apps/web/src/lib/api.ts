import type { Processor } from '@cgpu-max/types';

import { API_BASE_URL } from './env';

export interface ListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListProcessorsQuery {
  type?: 'CPU' | 'GPU';
  manufacturer?: 'INTEL' | 'AMD' | 'NVIDIA';
  search?: string;
  limit?: number;
  offset?: number;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }
  return url.toString();
}

export async function listProcessors(
  query: ListProcessorsQuery = {},
  init?: RequestInit,
): Promise<ListResponse<Processor>> {
  const params: Record<string, string | number | undefined> = {
    type: query.type,
    manufacturer: query.manufacturer,
    search: query.search,
    limit: query.limit,
    offset: query.offset,
  };
  const res = await fetch(buildUrl('/api/v1/processors', params), {
    next: { revalidate: 60, tags: ['processors:list'] },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Failed to list processors: ${res.status}`);
  }
  return res.json() as Promise<ListResponse<Processor>>;
}

export interface PriceHistory {
  slug: string;
  points: { retailer: string; priceUsd: number; inStock: boolean; recordedAt: string }[];
}

export async function getPriceHistory(slug: string, days = 365): Promise<PriceHistory | null> {
  const res = await fetch(buildUrl(`/api/v1/pricing/history/${slug}`, { days }), {
    next: { revalidate: 300, tags: [`processor:${slug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json() as Promise<PriceHistory>;
}

export async function getProcessor(slug: string, init?: RequestInit): Promise<Processor | null> {
  const res = await fetch(buildUrl(`/api/v1/processors/${slug}`), {
    next: { revalidate: 300, tags: [`processor:${slug}`] },
    ...init,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to get processor: ${res.status}`);
  }
  return res.json() as Promise<Processor>;
}

// Comparisons API
export interface ComparisonPayload {
  a: Processor;
  b: Processor;
  metrics: Array<{
    key: string;
    label: string;
    unit?: string;
    higherIsBetter: boolean;
    a: number | null;
    b: number | null;
    winner: 'a' | 'b' | 'tied';
    deltaPercent: number | null;
  }>;
  overallWinner: 'a' | 'b' | 'tied';
  pricePerformanceWinner: 'a' | 'b' | 'tied';
  performanceScore: { a: number; b: number };
  pricePerformanceScore: { a: number | null; b: number | null };
  algorithmVersion: string;
  generatedAt: string;
  shareSlug: string | null;
}

export async function getComparisonByShareSlug(
  shareSlug: string,
): Promise<ComparisonPayload | null> {
  const res = await fetch(buildUrl(`/api/v1/comparisons/${shareSlug}`), {
    next: { revalidate: 300, tags: [`comparison:${shareSlug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load comparison: ${res.status}`);
  return res.json() as Promise<ComparisonPayload>;
}

export async function compareProcessors(
  aSlug: string,
  bSlug: string,
  persist = false,
): Promise<ComparisonPayload> {
  const res = await fetch(buildUrl('/api/v1/comparisons'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aSlug, bSlug, persist }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Comparison failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<ComparisonPayload>;
}

// Bottleneck API
export type BottleneckSeverity = 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
export type LimitingComponent = 'cpu' | 'gpu' | 'balanced';

export interface BottleneckPayload {
  cpu: Processor;
  gpu: Processor;
  cpuPower: number;
  gpuPower: number;
  scenarios: Array<{
    resolution: '1080p' | '1440p' | '4K';
    profile: 'esports' | 'aaa' | 'vr' | 'creative';
    bottleneckPercentage: number;
    limitingComponent: LimitingComponent;
    severity: BottleneckSeverity;
    expectedFpsRange: { min: number; max: number } | null;
  }>;
  thermalEstimateC: number | null;
  totalPowerDrawW: number | null;
  recommendedPsuW: number | null;
  recommendations: string[];
  algorithmVersion: string;
  generatedAt: string;
  shareSlug: string | null;
}

export async function getBottleneckByShareSlug(
  shareSlug: string,
): Promise<BottleneckPayload | null> {
  const res = await fetch(buildUrl(`/api/v1/bottleneck/${shareSlug}`), {
    next: { revalidate: 300, tags: [`bottleneck:${shareSlug}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load bottleneck: ${res.status}`);
  return res.json() as Promise<BottleneckPayload>;
}

export async function calculateBottleneck(
  cpuSlug: string,
  gpuSlug: string,
  persist = false,
): Promise<BottleneckPayload> {
  const res = await fetch(buildUrl('/api/v1/bottleneck/calculate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpuSlug, gpuSlug, persist }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Bottleneck failed (${res.status}): ${body}`);
  }
  return res.json() as Promise<BottleneckPayload>;
}
