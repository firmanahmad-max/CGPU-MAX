import type { Processor } from '@cgpu-max/types';

export interface CgpuMaxClientOptions {
  apiKey: string;
  /** Base URL of the public API. Defaults to the production endpoint. */
  baseUrl?: string;
  /** Optional custom fetch (e.g. for testing or non-global-fetch runtimes). */
  fetch?: typeof fetch;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListProcessorsParams {
  type?: 'CPU' | 'GPU';
  manufacturer?: 'INTEL' | 'AMD' | 'NVIDIA';
  search?: string;
  limit?: number;
  offset?: number;
}

export class CgpuMaxApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CgpuMaxApiError';
  }
}

const DEFAULT_BASE_URL = 'https://api.cgpu-max.app/api/public/v1';

export class CgpuMaxClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: CgpuMaxClientOptions) {
    if (!options.apiKey) throw new Error('apiKey is required');
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.fetchImpl = options.fetch ?? globalThis.fetch;
  }

  async listProcessors(params: ListProcessorsParams = {}): Promise<ListResponse<Processor>> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) qs.set(k, String(v));
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.request<ListResponse<Processor>>('GET', `/processors${suffix}`);
  }

  async getProcessor(slug: string): Promise<Processor> {
    return this.request<Processor>('GET', `/processors/${encodeURIComponent(slug)}`);
  }

  async compare(aSlug: string, bSlug: string): Promise<unknown> {
    return this.request('POST', '/comparisons', { aSlug, bSlug });
  }

  async bottleneck(cpuSlug: string, gpuSlug: string): Promise<unknown> {
    return this.request('POST', '/bottleneck/calculate', { cpuSlug, gpuSlug });
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let code = 'HTTP_ERROR';
      let message = `Request failed with status ${res.status}`;
      try {
        const data = (await res.json()) as { error?: { code?: string; message?: string } };
        if (data.error) {
          code = data.error.code ?? code;
          message = data.error.message ?? message;
        }
      } catch {
        // non-JSON error body — keep defaults
      }
      throw new CgpuMaxApiError(res.status, code, message);
    }

    return res.json() as Promise<T>;
  }
}
