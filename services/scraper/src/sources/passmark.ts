import type { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import {
  detectCpuManufacturer,
  detectGpuManufacturer,
  slugify,
  type NormalizedProcessor,
} from '../domain/NormalizedProcessor.js';
import { retryWithBackoff } from '../http/client.js';
import { logger } from '../logging/logger.js';

import type { SourceAdapter } from './SourceAdapter.js';

const CPU_URL = 'https://www.cpubenchmark.net/high_end_cpus.html';
const GPU_URL = 'https://www.videocardbenchmark.net/high_end_gpus.html';

export class PassmarkAdapter implements SourceAdapter {
  readonly name = 'passmark';

  constructor(
    private readonly http: AxiosInstance,
    private readonly limit = 200,
  ) {}

  async fetchAll(): Promise<NormalizedProcessor[]> {
    const log = logger.child({ source: this.name });
    log.info('Fetching Passmark data');

    const [cpus, gpus] = await Promise.all([this.scrapeCpus(), this.scrapeGpus()]);
    log.info({ cpus: cpus.length, gpus: gpus.length }, 'Passmark fetch complete');
    return [...cpus, ...gpus];
  }

  private async scrapeCpus(): Promise<NormalizedProcessor[]> {
    const html = await this.fetchHtml(CPU_URL);
    const $ = cheerio.load(html);
    const recordedAt = new Date();
    const rows: NormalizedProcessor[] = [];

    $('ul.chartlist li').each((index, li) => {
      if (index >= this.limit) return false;
      const modelName = $(li).find('.prdname').text().trim();
      const scoreText = $(li)
        .find('.count')
        .text()
        .replace(/[^0-9]/g, '');
      const priceText = $(li).find('.price').text();
      if (!modelName) return;
      const manufacturer = detectCpuManufacturer(modelName);
      if (!manufacturer) return;
      const score = parseInt(scoreText, 10);
      const priceUsd = parsePrice(priceText);

      rows.push({
        source: 'passmark',
        sourceId: slugify(modelName),
        type: 'CPU',
        manufacturer,
        modelName,
        slug: slugify(`${manufacturer.toLowerCase()}-${modelName}`),
        msrpUsd: priceUsd,
        priceUsd,
        benchmarks: Number.isFinite(score)
          ? [{ benchmarkType: 'passmark_cpu_mark', score, recordedAt }]
          : [],
      });
      return;
    });

    return rows;
  }

  private async scrapeGpus(): Promise<NormalizedProcessor[]> {
    const html = await this.fetchHtml(GPU_URL);
    const $ = cheerio.load(html);
    const recordedAt = new Date();
    const rows: NormalizedProcessor[] = [];

    $('ul.chartlist li').each((index, li) => {
      if (index >= this.limit) return false;
      const modelName = $(li).find('.prdname').text().trim();
      const scoreText = $(li)
        .find('.count')
        .text()
        .replace(/[^0-9]/g, '');
      const priceText = $(li).find('.price').text();
      if (!modelName) return;
      const manufacturer = detectGpuManufacturer(modelName);
      if (!manufacturer) return;
      const score = parseInt(scoreText, 10);
      const priceUsd = parsePrice(priceText);

      rows.push({
        source: 'passmark',
        sourceId: slugify(modelName),
        type: 'GPU',
        manufacturer,
        modelName,
        slug: slugify(`${manufacturer.toLowerCase()}-${modelName}`),
        msrpUsd: priceUsd,
        priceUsd,
        benchmarks: Number.isFinite(score)
          ? [{ benchmarkType: 'passmark_g3d_mark', score, recordedAt }]
          : [],
      });
      return;
    });

    return rows;
  }

  private async fetchHtml(url: string): Promise<string> {
    return retryWithBackoff(async () => {
      const res = await this.http.get<string>(url, {
        responseType: 'text',
        headers: { Accept: 'text/html' },
      });
      if (res.status >= 400) throw new Error(`Passmark ${url} returned ${res.status}`);
      return res.data;
    });
  }
}

function parsePrice(text: string): number | null {
  const m = text.match(/\$?([\d,]+(?:\.\d+)?)/);
  if (!m?.[1]) return null;
  const value = parseFloat(m[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}
