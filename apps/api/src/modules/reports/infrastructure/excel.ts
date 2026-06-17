import ExcelJS from 'exceljs';

import type { BottleneckReportData, ComparisonReportData } from '../domain/types.js';

const BRAND = 'CGPU-MAX';

function winnerLabel(w: 'a' | 'b' | 'tied', a: string, b: string): string {
  return w === 'tied' ? 'Tied' : w === 'a' ? a : b;
}

export async function renderComparisonXlsx(data: ComparisonReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND;
  wb.created = new Date(data.generatedAt);
  const ws = wb.addWorksheet('Comparison');

  ws.addRow([`${BRAND} — Comparison Report`]);
  ws.getRow(1).font = { bold: true, size: 16 };
  ws.addRow([`${data.a.modelName}  vs  ${data.b.modelName}`]);
  ws.addRow([
    `Generated ${new Date(data.generatedAt).toUTCString()} · algorithm ${data.algorithmVersion}`,
  ]);
  ws.addRow([]);

  const header = ws.addRow(['Metric', data.a.modelName, data.b.modelName, 'Winner', 'Delta %']);
  header.font = { bold: true };
  header.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF042C53' } };
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  for (const m of data.metrics) {
    ws.addRow([
      m.label,
      formatVal(m.a, m.unit),
      formatVal(m.b, m.unit),
      winnerLabel(m.winner, data.a.modelName, data.b.modelName),
      m.deltaPercent === null ? '—' : `${m.deltaPercent.toFixed(1)}%`,
    ]);
  }

  ws.addRow([]);
  ws.addRow(['Performance index', data.performanceScore.a, data.performanceScore.b]).font = {
    bold: true,
  };
  ws.addRow([
    'Overall winner',
    winnerLabel(data.overallWinner, data.a.modelName, data.b.modelName),
  ]);
  ws.addRow([
    'Best price / performance',
    winnerLabel(data.pricePerformanceWinner, data.a.modelName, data.b.modelName),
  ]);

  ws.columns.forEach((col) => {
    col.width = 26;
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function renderBottleneckXlsx(data: BottleneckReportData): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND;
  const ws = wb.addWorksheet('Bottleneck');

  ws.addRow([`${BRAND} — Bottleneck Report`]);
  ws.getRow(1).font = { bold: true, size: 16 };
  ws.addRow([`${data.cpu.modelName}  +  ${data.gpu.modelName}`]);
  ws.addRow([`CPU power ${data.cpuPower} · GPU power ${data.gpuPower}`]);
  ws.addRow([]);

  const header = ws.addRow([
    'Resolution',
    'Profile',
    'Bottleneck %',
    'Limiting',
    'Severity',
    'Expected FPS',
  ]);
  header.font = { bold: true };
  header.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF042C53' } };
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });

  for (const s of data.scenarios) {
    ws.addRow([
      s.resolution,
      s.profile,
      `${s.bottleneckPercentage.toFixed(1)}%`,
      s.limitingComponent,
      s.severity,
      s.expectedFpsRange ? `${s.expectedFpsRange.min}–${s.expectedFpsRange.max}` : '—',
    ]);
  }

  ws.addRow([]);
  ws.addRow(['Thermal estimate', data.thermalEstimateC ? `${data.thermalEstimateC} °C` : '—']);
  ws.addRow(['Total power draw', data.totalPowerDrawW ? `${data.totalPowerDrawW} W` : '—']);
  ws.addRow(['Recommended PSU', data.recommendedPsuW ? `${data.recommendedPsuW} W` : '—']);
  ws.addRow([]);
  ws.addRow(['Recommendations']).font = { bold: true };
  for (const r of data.recommendations) ws.addRow([r]);

  ws.columns.forEach((col) => {
    col.width = 22;
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}

function formatVal(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return '—';
  const n = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return unit ? `${n} ${unit}` : n;
}
