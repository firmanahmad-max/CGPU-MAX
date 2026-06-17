import { parseWithScores, rankEntries } from '../../domain/ranking.js';

describe('analytics ranking', () => {
  it('ranks descending, drops non-positive, rounds, and limits', () => {
    const out = rankEntries(
      [
        { member: 'a', score: 3 },
        { member: 'b', score: 10.6 },
        { member: 'c', score: 0 },
        { member: 'd', score: 7 },
      ],
      2,
    );
    expect(out).toEqual([
      { member: 'b', score: 11 },
      { member: 'd', score: 7 },
    ]);
  });

  it('parses Redis WITHSCORES flat replies', () => {
    expect(parseWithScores(['nvidia-rtx-4090', '42', 'intel-core-i9-14900k', '17'])).toEqual([
      { member: 'nvidia-rtx-4090', score: 42 },
      { member: 'intel-core-i9-14900k', score: 17 },
    ]);
  });

  it('ignores a dangling member with no score', () => {
    expect(parseWithScores(['a', '5', 'b'])).toEqual([{ member: 'a', score: 5 }]);
  });
});
