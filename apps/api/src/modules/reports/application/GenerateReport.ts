import type { PrismaClient } from '@prisma/client';

import { NotFoundError } from '../../../shared/errors/AppError.js';
import type {
  BottleneckReportData,
  ComparisonReportData,
  ReportFormat,
} from '../domain/types.js';
import { renderBottleneckXlsx, renderComparisonXlsx } from '../infrastructure/excel.js';
import { renderBottleneckPdf, renderComparisonPdf } from '../infrastructure/pdf.js';

export interface RenderedReport {
  buffer: Buffer;
  filename: string;
}

export class GenerateReport {
  constructor(private readonly prisma: PrismaClient) {}

  async comparison(shareSlug: string, format: ReportFormat): Promise<RenderedReport> {
    const row = await this.prisma.savedComparison.findUnique({ where: { shareSlug } });
    if (!row) throw new NotFoundError('Comparison', shareSlug);
    const data = row.payload as unknown as ComparisonReportData;
    const buffer =
      format === 'pdf' ? await renderComparisonPdf(data) : await renderComparisonXlsx(data);
    return { buffer, filename: `comparison-${shareSlug}.${format}` };
  }

  async bottleneck(shareSlug: string, format: ReportFormat): Promise<RenderedReport> {
    const row = await this.prisma.savedBottleneck.findUnique({ where: { shareSlug } });
    if (!row) throw new NotFoundError('Bottleneck result', shareSlug);
    const data = row.payload as unknown as BottleneckReportData;
    const buffer =
      format === 'pdf' ? await renderBottleneckPdf(data) : await renderBottleneckXlsx(data);
    return { buffer, filename: `bottleneck-${shareSlug}.${format}` };
  }
}
