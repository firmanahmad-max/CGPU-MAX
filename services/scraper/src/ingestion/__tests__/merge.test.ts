import { mergeBySlug } from '../merge.js';

describe('mergeBySlug', () => {
  it('combines partial rows for the same processor', () => {
    const merged = mergeBySlug([
      {
        source: 'geekbench',
        sourceId: 'g1',
        type: 'CPU',
        manufacturer: 'INTEL',
        modelName: 'Core i9-14900K',
        slug: 'intel-core-i9-14900k',
        benchmarks: [{ benchmarkType: 'gb6_single', score: 3000, recordedAt: new Date(0) }],
      },
      {
        source: 'techpowerup',
        sourceId: 't1',
        type: 'CPU',
        manufacturer: 'INTEL',
        modelName: 'Core i9-14900K',
        slug: 'intel-core-i9-14900k',
        tdpWatts: 125,
        architecture: 'Raptor Lake',
        cpu: { cores: 24, threads: 32, baseClockGhz: 3.2 },
      },
      {
        source: 'passmark',
        sourceId: 'p1',
        type: 'CPU',
        manufacturer: 'INTEL',
        modelName: 'Core i9-14900K',
        slug: 'intel-core-i9-14900k',
        priceUsd: 589,
        benchmarks: [{ benchmarkType: 'passmark_cpu', score: 60000, recordedAt: new Date(0) }],
      },
    ]);

    expect(merged).toHaveLength(1);
    const row = merged[0];
    expect(row.sources).toEqual(['geekbench', 'techpowerup', 'passmark']);
    expect(row.tdpWatts).toBe(125);
    expect(row.cpu?.cores).toBe(24);
    expect(row.priceUsd).toBe(589);
    expect(row.benchmarks).toHaveLength(2);
  });

  it('does not overwrite existing non-null with later null', () => {
    const merged = mergeBySlug([
      {
        source: 'techpowerup',
        sourceId: 't',
        type: 'CPU',
        manufacturer: 'AMD',
        modelName: 'Ryzen 9 9950X',
        slug: 'amd-ryzen-9-9950x',
        tdpWatts: 170,
      },
      {
        source: 'passmark',
        sourceId: 'p',
        type: 'CPU',
        manufacturer: 'AMD',
        modelName: 'Ryzen 9 9950X',
        slug: 'amd-ryzen-9-9950x',
        tdpWatts: null,
      },
    ]);
    expect(merged[0].tdpWatts).toBe(170);
  });
});
