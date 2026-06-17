import { Processor } from '../../domain/Processor.js';

describe('Processor entity', () => {
  it('rejects empty modelName', () => {
    expect(() =>
      Processor.create({
        id: 'p1',
        type: 'CPU',
        manufacturer: 'INTEL',
        modelName: '   ',
        slug: 'x',
        generation: null,
        tdpWatts: null,
        msrpUsd: null,
      }),
    ).toThrow(/modelName/);
  });

  it('exposes immutable primitives', () => {
    const p = Processor.create({
      id: 'p1',
      type: 'CPU',
      manufacturer: 'INTEL',
      modelName: 'i9-14900K',
      slug: 'intel-core-i9-14900k',
      generation: 14,
      tdpWatts: 125,
      msrpUsd: 589,
    });
    expect(p.slug).toBe('intel-core-i9-14900k');
    expect(p.toPrimitives().modelName).toBe('i9-14900K');
  });
});
