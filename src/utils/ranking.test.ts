import { describe, expect, it } from 'vitest';
import { rankTeams } from './ranking';
import type { TeamWithScores } from '@/types/leaderboard';

function team(
  id: string,
  name: string,
  createdAt: string,
  scores: Array<{ checkpointOrder: number; value: number; updatedAt?: string }>
): TeamWithScores {
  return {
    id,
    name,
    createdAt: new Date(createdAt),
    scores: scores.map((s) => ({
      checkpointOrder: s.checkpointOrder,
      value: s.value,
      updatedAt: new Date(s.updatedAt ?? createdAt),
    })),
  };
}

describe('rankTeams', () => {
  it('ranks strictly by total score, highest first', () => {
    const teams = [
      team('a', 'Alpha', '2026-01-01', [{ checkpointOrder: 1, value: 50 }]),
      team('b', 'Bravo', '2026-01-01', [{ checkpointOrder: 1, value: 90 }]),
      team('c', 'Charlie', '2026-01-01', [{ checkpointOrder: 1, value: 70 }]),
    ];

    const result = rankTeams(teams);

    expect(result.map((t) => t.name)).toEqual(['Bravo', 'Charlie', 'Alpha']);
    expect(result.map((t) => t.rank)).toEqual([1, 2, 3]);
  });

  it('breaks ties using checkpoint 2 when totals are equal', () => {
    const tied = [
      team('a', 'Alpha', '2026-01-01', [
        { checkpointOrder: 2, value: 10 },
        { checkpointOrder: 1, value: 90 },
      ]),
      team('b', 'Bravo', '2026-01-01', [
        { checkpointOrder: 2, value: 20 },
        { checkpointOrder: 1, value: 80 },
      ]),
    ];

    const result = rankTeams(tied);
    // Both total 100. Bravo has the higher checkpoint 2 (20 > 10) -> Bravo wins.
    expect(result.map((t) => t.name)).toEqual(['Bravo', 'Alpha']);
  });

  it('ranks the earlier-created team higher when every checkpoint ties exactly', () => {
    const teams = [
      team('a', 'Alpha (created later)', '2026-01-02', [{ checkpointOrder: 1, value: 100 }]),
      team('b', 'Bravo (created earlier)', '2026-01-01', [{ checkpointOrder: 1, value: 100 }]),
    ];

    const result = rankTeams(teams);
    expect(result.map((t) => t.name)).toEqual(['Bravo (created earlier)', 'Alpha (created later)']);
  });

  it('treats a missing checkpoint score as 0, not as a crash', () => {
    const teams = [
      team('a', 'Alpha', '2026-01-01', [{ checkpointOrder: 1, value: 20 }]), // no CP2 yet
      team('b', 'Bravo', '2026-01-01', [{ checkpointOrder: 1, value: 15 }]),
    ];

    const result = rankTeams(teams);
    expect(result[0]?.name).toBe('Alpha');
    expect(result[0]?.totalScore).toBe(20);
    expect(result[0]?.scoresByCheckpoint[2]).toBeUndefined(); // not recorded, treated as 0 when compared
  });

  it('returns an empty array for no teams', () => {
    expect(rankTeams([])).toEqual([]);
  });

  it('reports lastUpdated as the most recent score update, or null if never scored', () => {
    const teams = [
      team('a', 'Alpha', '2026-01-01', [
        { checkpointOrder: 1, value: 10, updatedAt: '2026-01-05' },
        { checkpointOrder: 2, value: 10, updatedAt: '2026-01-10' },
      ]),
      team('b', 'Bravo', '2026-01-01', []),
    ];

    const result = rankTeams(teams);
    const alpha = result.find((t) => t.name === 'Alpha')!;
    const bravo = result.find((t) => t.name === 'Bravo')!;

    expect(alpha.lastUpdated?.toISOString().slice(0, 10)).toBe('2026-01-10');
    expect(bravo.lastUpdated).toBeNull();
  });
});
