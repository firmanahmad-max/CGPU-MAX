import { csvEscape, toCsv, toNdjson } from '../../domain/serialize.js';

describe('licensing serializers', () => {
  it('escapes CSV fields with commas, quotes, and newlines', () => {
    expect(csvEscape('plain')).toBe('plain');
    expect(csvEscape('a,b')).toBe('"a,b"');
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(42)).toBe('42');
  });

  it('builds CSV with a header and fixed column order', () => {
    const csv = toCsv(
      [
        { slug: 'a', tdpWatts: 125, modelName: 'Chip, Pro' },
        { slug: 'b', tdpWatts: null, modelName: 'Plain' },
      ],
      ['slug', 'modelName', 'tdpWatts'],
    );
    expect(csv).toBe('slug,modelName,tdpWatts\na,"Chip, Pro",125\nb,Plain,\n');
  });

  it('builds NDJSON (one JSON object per line)', () => {
    const out = toNdjson([
      { slug: 'a', tdpWatts: 125 },
      { slug: 'b', tdpWatts: 170 },
    ]);
    expect(out).toBe('{"slug":"a","tdpWatts":125}\n{"slug":"b","tdpWatts":170}\n');
  });

  it('returns empty string for empty NDJSON', () => {
    expect(toNdjson([])).toBe('');
  });
});
