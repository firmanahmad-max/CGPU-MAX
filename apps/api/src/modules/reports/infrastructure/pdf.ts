import PDFDocument from 'pdfkit';

import type { BottleneckReportData, ComparisonReportData } from '../domain/types.js';

const NAVY = '#042C53';
const ACCENT = '#185FA5';
const MUTED = '#5F5E5A';

function toBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

function header(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
  doc.fillColor(NAVY).fontSize(22).text('CGPU-MAX', { continued: false });
  doc.fillColor(MUTED).fontSize(10).text('Hardware Intelligence Platform');
  doc.moveDown(0.8);
  doc.fillColor(NAVY).fontSize(16).text(title);
  doc.fillColor(MUTED).fontSize(11).text(subtitle);
  doc.moveDown(0.8);
  doc.strokeColor(ACCENT).lineWidth(1).moveTo(doc.x, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.8);
}

function winnerLabel(w: 'a' | 'b' | 'tied', a: string, b: string): string {
  return w === 'tied' ? 'Tied' : w === 'a' ? a : b;
}

export async function renderComparisonPdf(data: ComparisonReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  header(
    doc,
    `${data.a.modelName} vs ${data.b.modelName}`,
    `Generated ${new Date(data.generatedAt).toUTCString()} · algorithm ${data.algorithmVersion}`,
  );

  doc.fillColor(NAVY).fontSize(12).text('Metric comparison');
  doc.moveDown(0.4);
  doc.fontSize(10);
  for (const m of data.metrics) {
    const win = winnerLabel(m.winner, data.a.modelName, data.b.modelName);
    doc
      .fillColor('#222')
      .text(
        `${m.label}: ${fmt(m.a, m.unit)}  |  ${fmt(m.b, m.unit)}  →  ${win}` +
          (m.deltaPercent !== null ? `  (${m.deltaPercent.toFixed(1)}%)` : ''),
      );
  }

  doc.moveDown(0.8);
  doc.fillColor(NAVY).fontSize(12).text('Verdict');
  doc.moveDown(0.3);
  doc
    .fillColor('#222')
    .fontSize(10)
    .text(`Performance index — ${data.a.modelName}: ${data.performanceScore.a}, ${data.b.modelName}: ${data.performanceScore.b}`)
    .text(`Overall winner: ${winnerLabel(data.overallWinner, data.a.modelName, data.b.modelName)}`)
    .text(
      `Best price/performance: ${winnerLabel(data.pricePerformanceWinner, data.a.modelName, data.b.modelName)}`,
    );

  return toBuffer(doc);
}

export async function renderBottleneckPdf(data: BottleneckReportData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  header(
    doc,
    `${data.cpu.modelName} + ${data.gpu.modelName}`,
    `Generated ${new Date(data.generatedAt).toUTCString()} · algorithm ${data.algorithmVersion}`,
  );

  doc
    .fillColor('#222')
    .fontSize(10)
    .text(`CPU power index: ${data.cpuPower}   GPU power index: ${data.gpuPower}`);
  doc.moveDown(0.6);

  doc.fillColor(NAVY).fontSize(12).text('Scenario matrix');
  doc.moveDown(0.4);
  doc.fillColor('#222').fontSize(9);
  for (const s of data.scenarios) {
    const fps = s.expectedFpsRange ? ` (${s.expectedFpsRange.min}–${s.expectedFpsRange.max} fps)` : '';
    doc.text(
      `${s.resolution} · ${s.profile}: ${s.bottleneckPercentage.toFixed(1)}% ${s.limitingComponent}-limited [${s.severity}]${fps}`,
    );
  }

  doc.moveDown(0.6);
  doc.fillColor(NAVY).fontSize(12).text('System');
  doc.moveDown(0.3);
  doc
    .fillColor('#222')
    .fontSize(10)
    .text(`Thermal estimate: ${data.thermalEstimateC ? `${data.thermalEstimateC} °C` : '—'}`)
    .text(`Total power draw: ${data.totalPowerDrawW ? `${data.totalPowerDrawW} W` : '—'}`)
    .text(`Recommended PSU: ${data.recommendedPsuW ? `${data.recommendedPsuW} W` : '—'}`);

  if (data.recommendations.length) {
    doc.moveDown(0.6);
    doc.fillColor(NAVY).fontSize(12).text('Recommendations');
    doc.moveDown(0.3);
    doc.fillColor('#222').fontSize(10);
    for (const r of data.recommendations) doc.text(`• ${r}`);
  }

  return toBuffer(doc);
}

function fmt(v: number | null, unit?: string): string {
  if (v === null || v === undefined) return '—';
  const n = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return unit ? `${n} ${unit}` : n;
}
