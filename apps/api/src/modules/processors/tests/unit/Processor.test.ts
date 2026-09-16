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
        codeName: null,
        generation: null,
        releaseDate: null,
        architecture: null,
        processNm: null,
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
      codeName: 'Raptor Lake Refresh',
      generation: 14,
      releaseDate: '2023-10-17T00:00:00.000Z',
      architecture: 'Raptor Lake Refresh',
      processNm: 10,
      tdpWatts: 125,
      msrpUsd: 589,
    });
    expect(p.slug).toBe('intel-core-i9-14900k');
    expect(p.toPrimitives().modelName).toBe('i9-14900K');
    expect(p.toPrimitives().architecture).toBe('Raptor Lake Refresh');
  });
});
