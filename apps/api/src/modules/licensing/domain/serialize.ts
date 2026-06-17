// Pure export serializers. No DB, no framework.

export type ExportFormat = 'json' | 'csv' | 'ndjson';

export type FlatRecord = Record<string, string | number | boolean | null>;

// RFC-4180-style CSV escaping: quote fields containing comma, quote, or newline;
// double any embedded quotes.
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(records: FlatRecord[], columns: string[]): string {
  const header = columns.join(',');
  const rows = records.map((r) => columns.map((c) => csvEscape(r[c])).join(','));
  return [header, ...rows].join('\n') + '\n';
}

export function toNdjson(records: FlatRecord[]): string {
  if (records.length === 0) return '';
  return records.map((r) => JSON.stringify(r)).join('\n') + '\n';
}

export const CONTENT_TYPE: Record<ExportFormat, string> = {
  json: 'application/json',
  csv: 'text/csv; charset=utf-8',
  ndjson: 'application/x-ndjson',
};
