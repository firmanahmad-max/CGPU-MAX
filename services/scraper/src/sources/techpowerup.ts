import type { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

import { env } from '../config/env.js';
import {
  detectCpuManufacturer,
  detectGpuManufacturer,
  slugify,
  type NormalizedProcessor,
} from '../domain/NormalizedProcessor.js';
import { retryWithBackoff, sleep } from '../http/client.js';
import { logger } from '../logging/logger.js';

import type { SourceAdapter } from './SourceAdapter.js';

const CPU_URL = 'https://www.techpowerup.com/cpu-specs/';
const GPU_URL = 'https://www.techpowerup.com/gpu-specs/';

export class TechPowerUpAdapter implements SourceAdapter {
  readonly name = 'techpowerup';

  constructor(private readonly http: AxiosInstance) {}

  async fetchAll(): Promise<NormalizedProcessor[]> {
    const log = logger.child({ source: this.name });
    log.info('Fetching TechPowerUp data (respecting rate limits)');

    const intelCpus = await this.scrapeCpus('intel');
    await sleep(env.SCRAPER_DELAY_MS);
    const amdCpus = await this.scrapeCpus('amd');
    await sleep(env.SCRAPER_DELAY_MS);
    const gpus = await this.scrapeGpus();

    const all = [...intelCpus, ...amdCpus, ...gpus];
    log.info(
      { cpus: intelCpus.length + amdCpus.length, gpus: gpus.length },
      'TechPowerUp fetch complete',
    );
    return all;
  }

  private async scrapeCpus(brand: 'intel' | 'amd'): Promise<NormalizedProcessor[]> {
    const url = `${CPU_URL}?mfgr=${brand}`;
    const html = await this.fetchHtml(url);
    const $ = cheerio.load(html);
    const cpus: NormalizedProcessor[] = [];

    $('table.processors tbody tr, table.cpus tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      const modelName = $(cells[0]).text().trim();
      if (!modelName) return;
      const manufacturer = detectCpuManufacturer(modelName);
      if (!manufacturer) return;

      const cores = parseInt($(cells[1]).text(), 10) || 0;
      const threads = parseInt($(cells[2]).text(), 10) || cores;
      const baseClock = parseClockGhz($(cells[3]).text());
      const boostClock = parseClockGhz($(cells[4]).text());
      const l3 = parseInt($(cells[5]).text(), 10);
      const tdp = parseInt($(cells[6]).text(), 10);
      const socket = $(cells[7]).text().trim();
      const architecture = $(cells[8]).text().trim();

      cpus.push({
        source: 'techpowerup',
        sourceId: slugify(modelName),
        type: 'CPU',
        manufacturer,
        modelName,
        slug: slugify(`${manufacturer.toLowerCase()}-${modelName}`),
        architecture: architecture || null,
        tdpWatts: Number.isFinite(tdp) ? tdp : null,
        cpu: cores
          ? {
              cores,
              threads,
              baseClockGhz: baseClock ?? 0,
              boostClockGhz: boostClock ?? null,
              l3CacheMb: Number.isFinite(l3) ? l3 : null,
              socket: socket || null,
            }
          : undefined,
      });
    });

    return cpus;
  }

  private async scrapeGpus(): Promise<NormalizedProcessor[]> {
    const html = await this.fetchHtml(GPU_URL);
    const $ = cheerio.load(html);
    const gpus: NormalizedProcessor[] = [];

    $('table.gputable tbody tr, table.gpus tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      const modelName = $(cells[0]).text().trim();
      if (!modelName) return;
      const manufacturer = detectGpuManufacturer(modelName);
      if (!manufacturer) return;

      const vramGb = parseInt($(cells[1]).text(), 10);
      const vramType = $(cells[2]).text().trim();
      const shaderUnits = parseInt($(cells[3]).text(), 10);
      const memoryBandwidth = parseInt($(cells[6]).text(), 10);
      const tdp = parseInt($(cells[7]).text(), 10);

      gpus.push({
        source: 'techpowerup',
        sourceId: slugify(modelName),
        type: 'GPU',
        manufacturer,
        modelName,
        slug: slugify(`${manufacturer.toLowerCase()}-${modelName}`),
        tdpWatts: Number.isFinite(tdp) ? tdp : null,
        gpu:
          shaderUnits && vramGb
            ? {
                shaderUnits,
                vramGb,
                vramType: vramType || null,
                memoryBandwidthGbps: Number.isFinite(memoryBandwidth) ? memoryBandwidth : null,
                baseClockMhz: 0,
              }
            : undefined,
      });
    });

    return gpus;
  }

  private async fetchHtml(url: string): Promise<string> {
    return retryWithBackoff(async () => {
      const res = await this.http.get<string>(url, {
        responseType: 'text',
        headers: { Accept: 'text/html' },
      });
      if (res.status >= 400) throw new Error(`TechPowerUp ${url} returned ${res.status}`);
      return res.data;
    });
  }
}

function parseClockGhz(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)/);
  if (!m?.[1]) return null;
  const value = parseFloat(m[1]);
  if (/mhz/i.test(text)) return value / 1000;
  return value;
}
