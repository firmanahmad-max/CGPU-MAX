import { computeCompatibility, computeFutureProofing } from '../../domain/BuildInsights.js';

const base = {
  cpuSocket: 'AM4',
  cpuTdp: 65,
  gpuTdp: 200,
  moboSocket: 'AM4',
  moboMemory: 'DDR4',
  moboForm: 'Micro-ATX',
  ramMemory: 'DDR4',
  caseForm: 'Mid Tower',
  psuWatts: 650,
  coolerType: 'Air',
};

const status = (input: typeof base, code: string) =>
  computeCompatibility(input).checks.find((c) => c.code === code)?.status;

describe('BuildInsights.computeCompatibility', () => {
  // Regression: "Mini Tower" (a Micro-ATX chassis) was ranked as Mini-ITX only.
  it('accepts a Micro-ATX board in a Mini Tower case', () => {
    expect(status({ ...base, caseForm: 'Mini Tower' }, 'formFactor')).toBe('ok');
  });

  it('still rejects an ATX board in a Mini Tower or Mini-ITX case', () => {
    expect(status({ ...base, caseForm: 'Mini Tower', moboForm: 'ATX' }, 'formFactor')).toBe('warn');
    expect(status({ ...base, caseForm: 'Mini-ITX' }, 'formFactor')).toBe('warn');
  });

  it('flags socket and memory mismatches', () => {
    expect(status({ ...base, cpuSocket: 'AM5' }, 'socket')).toBe('warn');
    expect(status({ ...base, ramMemory: 'DDR5' }, 'memory')).toBe('warn');
  });

  it('sizes the PSU from TDP + system overhead', () => {
    const { power } = computeCompatibility(base);
    // (65 + 200 + 150) * 1.3 = 539.5 → rounded up to 550 W
    expect(power?.estimatedDrawW).toBe(415);
    expect(power?.recommendedPsuW).toBe(550);
    expect(status({ ...base, psuWatts: 500 }, 'psu')).toBe('warn');
  });
});

describe('BuildInsights.computeFutureProofing', () => {
  it('scores a current platform with DDR5 and headroom above an EOL one', () => {
    const modern = computeFutureProofing({
      cpuSocket: 'AM5',
      ramMemory: 'DDR5',
      ramCapacityGb: 32,
      ssdCapacityGb: 2048,
      psuHeadroomPct: 45,
    });
    const legacy = computeFutureProofing({
      cpuSocket: 'AM4',
      ramMemory: 'DDR4',
      ramCapacityGb: 16,
      ssdCapacityGb: 512,
      psuHeadroomPct: 10,
    });
    expect(modern.score).toBe(100);
    expect(legacy.score).toBeLessThan(modern.score);
    expect(legacy.factors.find((f) => f.code === 'platform')?.rating).toBe('weak');
  });
});
