// Pure ranking helpers for analytics leaderboards. No Redis, no DB.

export interface RankedEntry {
  member: string;
  score: number;
}

// Redis ZREVRANGE already returns sorted, but other sources (merges, tests) may
// not — this normalizes to a descending, limited, integer-score list.
export function rankEntries(entries: RankedEntry[], limit: number): RankedEntry[] {
  return [...entries]
    .filter((e) => Number.isFinite(e.score) && e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, limit))
    .map((e) => ({ member: e.member, score: Math.round(e.score) }));
}

// Parse Redis ZREVRANGE ... WITHSCORES flat reply [member, score, member, ...].
export function parseWithScores(flat: string[]): RankedEntry[] {
  const out: RankedEntry[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const member = flat[i];
    const score = Number(flat[i + 1]);
    if (member !== undefined && Number.isFinite(score)) out.push({ member, score });
  }
  return out;
}
